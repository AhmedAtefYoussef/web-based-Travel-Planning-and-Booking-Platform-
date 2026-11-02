import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import {
  BookingType,
  type PayableBooking,
} from '../../common/contracts/booking.contract';
import type { NotificationsService } from '../../common/contracts/notifications.contract';
import { PaymentStatus } from '../../common/contracts/payments.contract';
import type { PolicySnapshot } from '../../common/contracts/policies.contract';
import {
  RefundQuote,
  RefundReason,
  RefundRecord,
  RefundStatus,
  RefundsService as RefundsServiceContract,
} from '../../common/contracts/refunds.contract';
import {
  NOTIFICATIONS_SERVICE,
  PAYABLE_BOOKING,
} from '../../common/contracts/tokens';
import { daysRemaining } from '../../common/utils/dates';
import { MinorUnits, percentOfMinor } from '../../common/utils/money';
import { Payment, PaymentDocument, Refund, RefundDocument } from './schemas';
import { STRIPE_CLIENT } from './stripe.provider';

@Injectable()
export class RefundsService implements RefundsServiceContract {
  constructor(
    @InjectModel(Refund.name) private readonly refunds: Model<RefundDocument>,
    @InjectModel(Payment.name)
    private readonly payments: Model<PaymentDocument>,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @Inject(PAYABLE_BOOKING) private readonly bookings: PayableBooking,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notifications: NotificationsService,
  ) {}

  quote(
    policySnapshot: Pick<PolicySnapshot, 'tiers'>,
    days: number,
    totalMinor: MinorUnits,
  ): RefundQuote {
    let tier: RefundQuote['tier'] = null;
    for (const t of policySnapshot.tiers) {
      if (t.daysBefore <= days && (!tier || t.daysBefore > tier.daysBefore)) {
        tier = t;
      }
    }
    const refundPercent = tier ? tier.refundPercent : 0;
    return {
      tier,
      refundPercent,
      amountMinor: percentOfMinor(totalMinor, refundPercent),
    };
  }

  async refundFor(
    type: BookingType,
    bookingId: string,
    reason: RefundReason,
  ): Promise<RefundRecord | null> {
    const view = await this.bookings.getPayable(type, bookingId);
    const payment = await this.payments.findOne({
      bookingType: type,
      bookingId,
      status: PaymentStatus.SUCCEEDED,
    });
    if (!payment) return null;

    const existing = await this.refunds.findOne({
      bookingType: type,
      bookingId,
      status: { $ne: RefundStatus.FAILED },
    });
    if (existing) return toRecord(existing);

    let amountMinor: MinorUnits;
    if (reason === 'PROVIDER') {
      amountMinor = payment.amountMinor;
    } else {
      const days = daysRemaining(view.serviceStartsAt, view.timeZone);
      amountMinor = this.quote(
        { tiers: view.policySnapshot?.tiers ?? [] },
        days,
        payment.amountMinor,
      ).amountMinor;
    }
    if (amountMinor <= 0) return null;

    const sr = await this.stripe.refunds.create(
      {
        payment_intent: payment.stripeId,
        amount: amountMinor,
        metadata: { bookingType: type, bookingId, reason },
      },
      { idempotencyKey: `refund-${type}-${bookingId}` },
    );
    const doc = await this.refunds.create({
      bookingType: type,
      bookingId,
      userId: view.userId,
      paymentId: String(payment.id ?? payment._id),
      stripeRefundId: sr.id,
      amountMinor,
      currency: payment.currency,
      reason,
      status: RefundStatus.PENDING,
    });
    await this.notifications.notify(view.userId, {
      type: 'REFUND_ISSUED',
      title: 'Refund initiated',
      body: `A refund of ${(amountMinor / 100).toFixed(2)} ${payment.currency} was initiated.`,
      link: `/refunds/${String(doc.id)}`,
    });
    return toRecord(doc);
  }

  /**
   * Full refund of one PaymentIntent of a payment, independent of the
   * booking (late or superseded payments). Idempotent per PI id.
   */
  async refundPayment(
    payment: PaymentDocument,
    paymentIntentId: string,
    reason: RefundReason,
  ): Promise<RefundRecord> {
    const sr = await this.stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount: payment.amountMinor,
        metadata: {
          bookingType: payment.bookingType,
          bookingId: payment.bookingId,
          reason,
        },
      },
      { idempotencyKey: `refund-pi-${paymentIntentId}` },
    );
    const existing = await this.refunds.findOne({ stripeRefundId: sr.id });
    if (existing) return toRecord(existing);
    const doc = await this.refunds.create({
      bookingType: payment.bookingType,
      bookingId: payment.bookingId,
      userId: payment.userId,
      paymentId: String(payment.id),
      stripeRefundId: sr.id,
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      reason,
      status: RefundStatus.PENDING,
    });
    return toRecord(doc);
  }

  /** Webhook: refund.updated / charge.refund.updated. */
  async applyStripeRefund(refund: Stripe.Refund): Promise<void> {
    let status: RefundStatus | null = null;
    if (refund.status === 'succeeded') status = RefundStatus.REFUNDED;
    else if (refund.status === 'failed' || refund.status === 'canceled')
      status = RefundStatus.FAILED;
    if (!status) return;
    await this.refunds.findOneAndUpdate(
      { stripeRefundId: refund.id },
      { status },
      { new: true },
    );
  }

  async findById(id: string): Promise<RefundRecord | null> {
    const doc = await this.refunds.findById(id);
    return doc ? toRecord(doc) : null;
  }
}

function toRecord(d: RefundDocument): RefundRecord {
  const o = d as unknown as RefundRecord & { _id?: unknown };
  return {
    id: String(d.id ?? o._id),
    bookingType: d.bookingType,
    bookingId: d.bookingId,
    userId: d.userId,
    paymentId: d.paymentId,
    stripeRefundId: d.stripeRefundId,
    amountMinor: d.amountMinor,
    currency: d.currency,
    reason: d.reason,
    status: d.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}
