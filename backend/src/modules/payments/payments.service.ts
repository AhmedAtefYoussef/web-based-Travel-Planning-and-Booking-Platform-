import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import {
  BookingStatus,
  BookingType,
  type PayableBooking,
  type PayableBookingView,
} from '../../common/contracts/booking.contract';
import {
  CreatePaymentResult,
  PaymentStatus,
  PaymentsService as PaymentsServiceContract,
} from '../../common/contracts/payments.contract';
import { PAYABLE_BOOKING } from '../../common/contracts/tokens';
import { Payment, PaymentDocument } from './schemas';
import { RefundsService } from './refunds.service';
import { STRIPE_CLIENT } from './stripe.provider';

const CURRENCY = 'USD';

export interface PaymentView {
  id: string;
  bookingType: BookingType;
  bookingId: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
}

@Injectable()
export class PaymentsService implements PaymentsServiceContract {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private readonly model: Model<PaymentDocument>,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @Inject(PAYABLE_BOOKING) private readonly bookings: PayableBooking,
    private readonly refunds: RefundsService,
    private readonly config: ConfigService,
  ) {}

  async createForBooking(
    userId: string,
    type: BookingType,
    bookingId: string,
  ): Promise<CreatePaymentResult> {
    const view = await this.ownedBooking(userId, type, bookingId);
    this.assertPayable(view);
    if (!view.policiesAcceptedAt) {
      throw new ConflictException('Policies must be accepted before payment');
    }

    const existing = await this.model.findOne({
      bookingType: type,
      bookingId,
      status: PaymentStatus.PENDING,
    });
    if (existing) {
      const pi = await this.stripe.paymentIntents.retrieve(existing.stripeId);
      return this.result(existing, pi.client_secret);
    }

    const pi = await this.newIntent(type, bookingId, view.totalMinor, 0);
    const doc = await this.model.create({
      bookingType: type,
      bookingId,
      userId,
      stripeId: pi.id,
      amountMinor: view.totalMinor,
      currency: CURRENCY,
      status: PaymentStatus.PENDING,
    });
    return this.result(doc, pi.client_secret);
  }

  async retry(userId: string, paymentId: string): Promise<CreatePaymentResult> {
    const payment = await this.ownedPayment(userId, paymentId);
    if (payment.status !== PaymentStatus.FAILED) {
      throw new ConflictException('Only a failed payment can be retried');
    }
    const view = await this.bookings.getPayable(
      payment.bookingType,
      payment.bookingId,
    );
    this.assertPayable(view);
    const pi = await this.newIntent(
      payment.bookingType,
      payment.bookingId,
      view.totalMinor,
      Date.now(),
    );
    const updated = await this.model.findOneAndUpdate(
      { _id: paymentId, status: PaymentStatus.FAILED },
      {
        stripeId: pi.id,
        status: PaymentStatus.PENDING,
        amountMinor: view.totalMinor,
      },
      { new: true },
    );
    if (!updated) throw new ConflictException('Payment already retried');
    return this.result(updated, pi.client_secret);
  }

  async getForUser(
    userId: string,
    isAdmin: boolean,
    paymentId: string,
  ): Promise<PaymentView> {
    const p = await this.model.findById(paymentId);
    if (!p) throw new NotFoundException('Payment not found');
    if (p.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Not your payment');
    }
    return {
      id: String(p.id),
      bookingType: p.bookingType,
      bookingId: p.bookingId,
      amountMinor: p.amountMinor,
      currency: p.currency,
      status: p.status,
    };
  }

  /** Dev-only helper: confirms the PI; the webhook still confirms booking. */
  async testConfirm(userId: string, paymentId: string): Promise<void> {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }
    const p = await this.ownedPayment(userId, paymentId);
    await this.stripe.paymentIntents.confirm(p.stripeId, {
      payment_method: 'pm_card_visa',
      return_url: 'http://localhost/payment-return',
    });
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing webhook signature or body');
    }
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '',
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.onSucceeded(event.data.object);
      case 'payment_intent.payment_failed':
        return this.onFailed(event.data.object);
      case 'refund.updated':
      case 'charge.refund.updated':
        return this.refunds.applyStripeRefund(event.data.object);
      default:
        return;
    }
  }

  async cancelForExpiredHold(
    type: BookingType,
    bookingId: string,
  ): Promise<void> {
    const open = await this.model.findOne({
      bookingType: type,
      bookingId,
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
    });
    if (!open) return;
    await this.stripe.paymentIntents.cancel(open.stripeId);
    await this.model.findOneAndUpdate(
      { _id: open.id },
      { status: PaymentStatus.CANCELLED },
      { new: true },
    );
  }

  private async onSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.model.findOne({ stripeId: intent.id });
    if (!payment) return;
    // Never trust the event body alone: re-read the intent from Stripe.
    const fresh = await this.stripe.paymentIntents.retrieve(intent.id);
    if (fresh.status !== 'succeeded') return;
    // Atomic transition: only the first delivery wins.
    const won = await this.model.findOneAndUpdate(
      { _id: payment.id, status: { $ne: PaymentStatus.SUCCEEDED } },
      { status: PaymentStatus.SUCCEEDED },
      { new: true },
    );
    if (!won) return;
    await this.bookings.markConfirmed(
      payment.bookingType,
      payment.bookingId,
      String(payment.id),
    );
  }

  private async onFailed(intent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.model.findOne({ stripeId: intent.id });
    if (!payment) return;
    const changed = await this.model.findOneAndUpdate(
      { _id: payment.id, status: PaymentStatus.PENDING },
      { status: PaymentStatus.FAILED },
      { new: true },
    );
    if (!changed) return;
    await this.bookings.markPaymentFailed(
      payment.bookingType,
      payment.bookingId,
    );
  }

  private newIntent(
    type: BookingType,
    bookingId: string,
    amountMinor: number,
    attempt: number,
  ) {
    return this.stripe.paymentIntents.create(
      {
        amount: amountMinor,
        currency: CURRENCY.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: { bookingType: type, bookingId },
      },
      { idempotencyKey: `pi-${type}-${bookingId}-${attempt}` },
    );
  }

  private result(
    p: { id?: string; amountMinor: number; currency: string },
    clientSecret: string | null,
  ): CreatePaymentResult {
    return {
      paymentId: String(p.id),
      clientSecret: clientSecret ?? '',
      amountMinor: p.amountMinor,
      currency: p.currency,
    };
  }

  private async ownedBooking(
    userId: string,
    type: BookingType,
    id: string,
  ): Promise<PayableBookingView> {
    const view = await this.bookings.getPayable(type, id);
    if (view.userId !== userId)
      throw new NotFoundException('Booking not found');
    return view;
  }

  private async ownedPayment(userId: string, id: string) {
    const p = await this.model.findById(id);
    if (!p || p.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }
    return p;
  }

  private assertPayable(view: PayableBookingView): void {
    if (view.status !== BookingStatus.PENDING_PAYMENT) {
      throw new ConflictException('Booking is not awaiting payment');
    }
    if (!view.holdExpiresAt || view.holdExpiresAt.getTime() <= Date.now()) {
      throw new ConflictException('Booking hold has expired');
    }
  }
}
