/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  BookingStatus,
  BookingType,
} from '../../common/contracts/booking.contract';
import { PaymentStatus } from '../../common/contracts/payments.contract';
import { PaymentsService } from './payments.service';

const future = () => new Date(Date.now() + 5 * 60_000);
const view = (o: Record<string, unknown> = {}) => ({
  userId: 'u1',
  totalMinor: 12345,
  status: BookingStatus.PENDING_PAYMENT,
  holdExpiresAt: future(),
  policiesAcceptedAt: new Date(),
  providerId: 'p1',
  serviceStartsAt: new Date(),
  timeZone: 'UTC',
  policySnapshot: null,
  paymentId: null,
  ...o,
});

function setup(v = view()) {
  const model = {
    create: jest.fn(async (d: any) => ({ id: 'pay1', _id: 'pay1', ...d })),
    findOne: jest.fn(async (): Promise<any> => null),
    findById: jest.fn(async (): Promise<any> => null),
    findOneAndUpdate: jest.fn(async (): Promise<any> => null),
  };
  const stripe = {
    paymentIntents: {
      create: jest.fn(async () => ({ id: 'pi_1', client_secret: 'cs_1' })),
      retrieve: jest.fn(async (): Promise<any> => ({
        id: 'pi_1',
        client_secret: 'cs_1',
        status: 'succeeded',
      })),
      cancel: jest.fn(async () => ({})),
      confirm: jest.fn(async () => ({})),
    },
    webhooks: { constructEvent: jest.fn() },
  };
  const bookings = {
    getPayable: jest.fn(async () => v),
    markConfirmed: jest.fn(async () => undefined),
    markPaymentFailed: jest.fn(async () => undefined),
    recordPolicyAcceptance: jest.fn(),
  };
  const refunds = { applyStripeRefund: jest.fn(), refundPayment: jest.fn() };
  const config = {
    get: (k: string) => (k === 'STRIPE_WEBHOOK_SECRET' ? 'whsec_x' : 'test'),
  };
  const svc = new PaymentsService(
    model as any,
    stripe as any,
    bookings,
    refunds as any,
    config as any,
  );
  return { svc, model, stripe, bookings, refunds };
}

describe('PaymentsService.createForBooking', () => {
  it('creates an intent with booking total in USD', async () => {
    const { svc, stripe, model } = setup();
    const r = await svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 12345, currency: 'usd' }),
      expect.anything(),
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 12345,
        currency: 'USD',
        stripeId: 'pi_1',
        status: PaymentStatus.PENDING,
      }),
    );
    expect(r).toEqual({
      paymentId: 'pay1',
      clientSecret: 'cs_1',
      amountMinor: 12345,
      currency: 'USD',
    });
  });
  it.each([
    ['status', { status: BookingStatus.CONFIRMED }],
    ['expired hold', { holdExpiresAt: new Date(Date.now() - 1000) }],
    ['null hold', { holdExpiresAt: null }],
    ['policies not accepted', { policiesAcceptedAt: null }],
  ])('409 on %s', async (_n, o) => {
    const { svc, stripe } = setup(view(o));
    await expect(
      svc.createForBooking('u1', BookingType.FLIGHT, 'b1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });
  it('404 for non-owner', async () => {
    const { svc } = setup();
    await expect(
      svc.createForBooking('other', BookingType.FLIGHT, 'b1'),
    ).rejects.toThrow('not found');
  });
  it('returns existing PENDING payment', async () => {
    const { svc, model, stripe } = setup();
    model.findOne.mockResolvedValueOnce({
      id: 'pay0',
      stripeId: 'pi_0',
      amountMinor: 12345,
      currency: 'USD',
      status: 'PENDING',
    });
    stripe.paymentIntents.retrieve.mockResolvedValueOnce({
      id: 'pi_0',
      client_secret: 'cs_0',
      status: 'requires_payment_method',
    });
    const r = await svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(r.paymentId).toBe('pay0');
    expect(r.clientSecret).toBe('cs_0');
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });
});

describe('PaymentsService.retry', () => {
  const failed = {
    id: 'pay1',
    userId: 'u1',
    bookingType: 'FLIGHT',
    bookingId: 'b1',
    status: 'FAILED',
    amountMinor: 12345,
    currency: 'USD',
    stripeId: 'pi_old',
  };
  it('allows retry for FAILED payment', async () => {
    const { svc, model } = setup();
    model.findById.mockResolvedValue(failed);
    model.findOneAndUpdate.mockResolvedValue({
      ...failed,
      status: 'PENDING',
      stripeId: 'pi_1',
    });
    const r = await svc.retry('u1', 'pay1');
    expect(r.clientSecret).toBe('cs_1');
    expect(r.paymentId).toBe('pay1');
  });
  it('cancels the previous PI and records it in history', async () => {
    const { svc, model, stripe } = setup();
    model.findById.mockResolvedValue(failed);
    model.findOneAndUpdate.mockResolvedValue({ ...failed, stripeId: 'pi_1' });
    await svc.retry('u1', 'pay1');
    expect(stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_old');
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ $addToSet: { stripeIdHistory: 'pi_old' } }),
      expect.anything(),
    );
  });
  it('ignores already-canceled/succeeded errors on the old PI', async () => {
    const { svc, model, stripe } = setup();
    model.findById.mockResolvedValue(failed);
    model.findOneAndUpdate.mockResolvedValue({ ...failed, stripeId: 'pi_1' });
    stripe.paymentIntents.cancel.mockRejectedValue({
      code: 'payment_intent_unexpected_state',
    });
    await expect(svc.retry('u1', 'pay1')).resolves.toBeDefined();
  });
  it('409 when not FAILED', async () => {
    const { svc, model } = setup();
    model.findById.mockResolvedValue({ ...failed, status: 'PENDING' });
    await expect(svc.retry('u1', 'pay1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('409 when hold expired', async () => {
    const { svc, model } = setup(
      view({ holdExpiresAt: new Date(Date.now() - 1) }),
    );
    model.findById.mockResolvedValue(failed);
    await expect(svc.retry('u1', 'pay1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe('PaymentsService.handleWebhook', () => {
  const pay = {
    id: 'pay1',
    bookingType: 'FLIGHT',
    bookingId: 'b1',
    stripeId: 'pi_1',
  };
  const ev = (type: string, object: any = { id: 'pi_1' }) => ({
    type,
    data: { object },
  });

  it('rejects bad signature with 400', async () => {
    const { svc, stripe } = setup();
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('bad');
    });
    await expect(
      svc.handleWebhook(Buffer.from('{}'), 'sig'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('rejects missing signature with 400', async () => {
    const { svc } = setup();
    await expect(
      svc.handleWebhook(Buffer.from('{}'), ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('succeeded confirms booking exactly once on duplicate events', async () => {
    const { svc, stripe, model, bookings } = setup();
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('payment_intent.succeeded'),
    );
    model.findOne.mockResolvedValue(pay);
    model.findOneAndUpdate
      .mockResolvedValueOnce(pay)
      .mockResolvedValueOnce(null);
    await svc.handleWebhook(Buffer.from('x'), 's');
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(bookings.markConfirmed).toHaveBeenCalledTimes(1);
    expect(bookings.markConfirmed).toHaveBeenCalledWith('FLIGHT', 'b1', 'pay1');
  });
  it('late success on expired booking refunds fully, no confirm', async () => {
    const { svc, stripe, model, bookings, refunds } = setup(
      view({ holdExpiresAt: new Date(Date.now() - 1000) }),
    );
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('payment_intent.succeeded'),
    );
    model.findOne.mockResolvedValue(pay);
    model.findOneAndUpdate.mockResolvedValue(pay);
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: PaymentStatus.PENDING }),
      { status: PaymentStatus.SUCCEEDED },
      expect.anything(),
    );
    expect(bookings.markConfirmed).not.toHaveBeenCalled();
    expect(refunds.refundPayment).toHaveBeenCalledWith(pay, 'pi_1', 'PROVIDER');
  });
  it('late success on cancelled booking refunds, no confirm', async () => {
    const { svc, stripe, model, bookings, refunds } = setup(
      view({ status: BookingStatus.CANCELLED }),
    );
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('payment_intent.succeeded'),
    );
    model.findOne.mockResolvedValue(pay);
    model.findOneAndUpdate.mockResolvedValue(pay);
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(bookings.markConfirmed).not.toHaveBeenCalled();
    expect(refunds.refundPayment).toHaveBeenCalled();
  });
  it('superseded PI success is refunded, never confirmed', async () => {
    const { svc, stripe, model, bookings, refunds } = setup();
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('payment_intent.succeeded', { id: 'pi_old' }),
    );
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_old',
      status: 'succeeded',
    });
    model.findOne.mockResolvedValue({
      ...pay,
      stripeId: 'pi_new',
      stripeIdHistory: ['pi_old'],
    });
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(bookings.markConfirmed).not.toHaveBeenCalled();
    expect(refunds.refundPayment).toHaveBeenCalledWith(
      expect.anything(),
      'pi_old',
      'PROVIDER',
    );
  });
  it('ignores succeeded when re-retrieved PI is not succeeded', async () => {
    const { svc, stripe, model, bookings } = setup();
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('payment_intent.succeeded'),
    );
    model.findOne.mockResolvedValue(pay);
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'processing',
    });
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(bookings.markConfirmed).not.toHaveBeenCalled();
  });
  it('failed marks payment failed so retry is allowed', async () => {
    const { svc, stripe, model, bookings } = setup();
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('payment_intent.payment_failed'),
    );
    model.findOne.mockResolvedValue(pay);
    model.findOneAndUpdate.mockResolvedValue(pay);
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { status: PaymentStatus.FAILED },
      expect.anything(),
    );
    expect(bookings.markPaymentFailed).toHaveBeenCalledWith('FLIGHT', 'b1');
  });
  it('dispatches refund events', async () => {
    const { svc, stripe, refunds } = setup();
    stripe.webhooks.constructEvent.mockReturnValue(
      ev('refund.updated', { id: 're_1', status: 'succeeded' }),
    );
    await svc.handleWebhook(Buffer.from('x'), 's');
    expect(refunds.applyStripeRefund).toHaveBeenCalledWith({
      id: 're_1',
      status: 'succeeded',
    });
  });
});

describe('PaymentsService.cancelForExpiredHold', () => {
  it('cancels the open PI', async () => {
    const { svc, stripe, model } = setup();
    model.findOne.mockResolvedValue({ id: 'pay1', stripeId: 'pi_1' });
    await svc.cancelForExpiredHold(BookingType.HOTEL, 'b1');
    expect(stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_1');
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { status: PaymentStatus.CANCELLED },
      expect.anything(),
    );
  });
  it('no-op without open payment', async () => {
    const { svc, stripe } = setup();
    await svc.cancelForExpiredHold(BookingType.HOTEL, 'b1');
    expect(stripe.paymentIntents.cancel).not.toHaveBeenCalled();
  });
});
