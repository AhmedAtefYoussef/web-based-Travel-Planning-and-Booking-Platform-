/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  BookingType,
} from '../../common/contracts/booking.contract';
import { PaymentStatus } from '../../common/contracts/payments.contract';
import { PaymentsService } from './payments.service';
import { stripeProvider } from './stripe.provider';

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

function setup(
  v = view(),
  platformCurrency = 'USD',
  settings: Record<string, string | undefined> = {},
) {
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
        amount: 12345,
        amount_received: 12345,
        currency: platformCurrency.toLowerCase(),
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
  const values: Record<string, string | undefined> = {
    STRIPE_WEBHOOK_SECRET: 'whsec_x',
    PLATFORM_CURRENCY: platformCurrency,
    ...settings,
  };
  const config = {
    get: (k: string) => (k in values ? values[k] : 'test'),
    getOrThrow: (k: string) => values[k] ?? 'test',
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
      amount: 12345,
      currency: 'usd',
    });
    const r = await svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(r.paymentId).toBe('pay0');
    expect(r.clientSecret).toBe('cs_0');
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });
});

describe('PAY-04: PLATFORM_CURRENCY drives the currency', () => {
  it('uses EUR on the intent and the stored payment', async () => {
    const { svc, stripe, model } = setup(view(), 'EUR');
    const r = await svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ currency: 'eur' }),
      expect.anything(),
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ currency: 'EUR' }),
    );
    expect(r.currency).toBe('EUR');
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
  const retryable = (stripe: ReturnType<typeof setup>['stripe']) =>
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_old',
      status: 'requires_payment_method',
    });
  it('allows retry for FAILED payment', async () => {
    const { svc, model, stripe } = setup();
    retryable(stripe);
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
    retryable(stripe);
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
  it('ignores unexpected-state errors when cancelling the old PI', async () => {
    const { svc, model, stripe } = setup();
    retryable(stripe);
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
    amountMinor: 12345,
    currency: 'USD',
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
    // After the first delivery the booking reports this payment.
    bookings.getPayable
      .mockResolvedValueOnce(view())
      .mockResolvedValueOnce(
        view({ status: BookingStatus.CONFIRMED, paymentId: 'pay1' }),
      );
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
      expect.objectContaining({
        status: { $ne: PaymentStatus.SUCCEEDED },
      }),
      { status: PaymentStatus.SUCCEEDED },
      expect.anything(),
    );
    expect(bookings.markConfirmed).not.toHaveBeenCalled();
    expect(refunds.refundPayment).toHaveBeenCalledWith(
      pay,
      expect.objectContaining({ id: 'pi_1' }),
      'PROVIDER',
    );
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
      expect.objectContaining({ id: 'pi_old' }),
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

/** Stateful fake of the payment model that honours status filters. */
function statefulPayment(setupResult: ReturnType<typeof setup>, doc: any) {
  const state = { ...doc };
  const matches = (f: any) => {
    if (f.stripeId && f.stripeId !== state.stripeId) return false;
    if (f.status === undefined) return true;
    if (typeof f.status === 'string') return f.status === state.status;
    if (f.status.$in) return f.status.$in.includes(state.status);
    if (f.status.$ne) return f.status.$ne !== state.status;
    return false;
  };
  setupResult.model.findOne.mockImplementation(async () => ({ ...state }));
  setupResult.model.findById.mockImplementation(async () => ({ ...state }));
  setupResult.model.findOneAndUpdate.mockImplementation(
    async (f: any, u: any) => {
      if (!matches(f)) return null;
      const rest = { ...u };
      delete rest.$addToSet;
      Object.assign(state, rest);
      return { ...state };
    },
  );
  return state;
}

describe('PAY-01 F1: success on FAILED payment / retry guard', () => {
  const base = {
    id: 'pay1',
    userId: 'u1',
    bookingType: 'FLIGHT',
    bookingId: 'b1',
    stripeId: 'pi_1',
    amountMinor: 12345,
    currency: 'USD',
  };
  it('success for the current PI on a FAILED payment confirms the booking', async () => {
    const s = setup();
    const state = statefulPayment(s, { ...base, status: 'FAILED' });
    s.stripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1' } },
    });
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
      amount_received: 12345,
      currency: 'usd',
    });
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(state.status).toBe(PaymentStatus.SUCCEEDED);
    expect(s.bookings.markConfirmed).toHaveBeenCalledWith(
      'FLIGHT',
      'b1',
      'pay1',
    );
  });
  it.each(['succeeded', 'processing'])(
    'retry 409s when the old PI is %s, without cancelling or creating',
    async (piStatus) => {
      const s = setup();
      s.model.findById.mockResolvedValue({
        ...base,
        stripeId: 'pi_old',
        status: 'FAILED',
      });
      s.model.findOneAndUpdate.mockResolvedValue({ ...base });
      s.stripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_old',
        status: piStatus,
      });
      await expect(s.svc.retry('u1', 'pay1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(s.stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_old');
      expect(s.stripe.paymentIntents.cancel).not.toHaveBeenCalled();
      expect(s.stripe.paymentIntents.create).not.toHaveBeenCalled();
    },
  );
});

describe('PAY-01 F2: late-refund path is retry-safe on redelivery', () => {
  it('redelivery after a failed refund attempt refunds again', async () => {
    const s = setup(view({ holdExpiresAt: new Date(Date.now() - 1000) }));
    const state = statefulPayment(s, {
      id: 'pay1',
      userId: 'u1',
      bookingType: 'FLIGHT',
      bookingId: 'b1',
      stripeId: 'pi_1',
      amountMinor: 12345,
      currency: 'USD',
      status: 'PENDING',
    });
    s.stripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1' } },
    });
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
      amount_received: 12345,
    });
    s.refunds.refundPayment
      .mockRejectedValueOnce(new Error('stripe down'))
      .mockResolvedValueOnce({ id: 'r1' });
    await expect(s.svc.handleWebhook(Buffer.from('x'), 's')).rejects.toThrow(
      'stripe down',
    );
    expect(state.status).toBe(PaymentStatus.SUCCEEDED);
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(s.refunds.refundPayment).toHaveBeenCalledTimes(2);
    expect(s.bookings.markConfirmed).not.toHaveBeenCalled();
  });
  it('redelivery when booking was confirmed by this payment does nothing', async () => {
    const s = setup(
      view({ status: BookingStatus.CONFIRMED, paymentId: 'pay1' }),
    );
    statefulPayment(s, {
      id: 'pay1',
      bookingType: 'FLIGHT',
      bookingId: 'b1',
      stripeId: 'pi_1',
      status: 'SUCCEEDED',
    });
    s.stripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1' } },
    });
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(s.refunds.refundPayment).not.toHaveBeenCalled();
    expect(s.bookings.markConfirmed).not.toHaveBeenCalled();
  });
});

describe('PAY-01 F3: late refund uses the captured PI', () => {
  it('passes the re-retrieved PI (amount_received) to refundPayment', async () => {
    const s = setup(view({ status: BookingStatus.EXPIRED }));
    statefulPayment(s, {
      id: 'pay1',
      bookingType: 'FLIGHT',
      bookingId: 'b1',
      stripeId: 'pi_1',
      amountMinor: 12345,
      status: 'PENDING',
    });
    s.stripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1' } },
    });
    const fresh = { id: 'pi_1', status: 'succeeded', amount_received: 999 };
    s.stripe.paymentIntents.retrieve.mockResolvedValue(fresh);
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(s.refunds.refundPayment).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pay1' }),
      fresh,
      'PROVIDER',
    );
  });
});

describe('PAY-01/PAY-04 fix-PAY-01-1: amount and currency cross-check', () => {
  const pending = {
    id: 'pay1',
    userId: 'u1',
    bookingType: 'FLIGHT',
    bookingId: 'b1',
    stripeId: 'pi_1',
    amountMinor: 12345,
    currency: 'USD',
    status: 'PENDING',
  };
  const succeededEvent = {
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_1' } },
  };

  it.each([
    ['amount_received < amountMinor', { amount_received: 12000 }],
    ['amount_received > amountMinor', { amount_received: 99999 }],
    ['amount_received missing', { amount_received: undefined }],
    ['currency differs from the payment', { currency: 'eur' }],
  ])(
    'succeeded with %s does not markConfirmed; refunds and logs',
    async (_n, o) => {
      const s = setup();
      statefulPayment(s, { ...pending });
      const errorSpy = jest
        .spyOn((s.svc as any).logger, 'error')
        .mockImplementation(() => undefined);
      s.stripe.webhooks.constructEvent.mockReturnValue(succeededEvent);
      const fresh = {
        id: 'pi_1',
        status: 'succeeded',
        amount: 12345,
        amount_received: 12345,
        currency: 'usd',
        ...o,
      };
      s.stripe.paymentIntents.retrieve.mockResolvedValue(fresh);
      await s.svc.handleWebhook(Buffer.from('x'), 's');
      expect(s.bookings.markConfirmed).not.toHaveBeenCalled();
      expect(s.refunds.refundPayment).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'pay1' }),
        fresh,
        'PROVIDER',
      );
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('pi_1'));
    },
  );

  it('succeeded in a currency other than PLATFORM_CURRENCY does not confirm', async () => {
    // Payment stored as USD, platform now EUR: never confirm a foreign charge.
    const s = setup(view(), 'EUR');
    statefulPayment(s, { ...pending });
    jest
      .spyOn((s.svc as any).logger, 'error')
      .mockImplementation(() => undefined);
    s.stripe.webhooks.constructEvent.mockReturnValue(succeededEvent);
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
      amount_received: 12345,
      currency: 'usd',
    });
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(s.bookings.markConfirmed).not.toHaveBeenCalled();
    expect(s.refunds.refundPayment).toHaveBeenCalled();
  });

  it('succeeded for a payment whose amount no longer matches the booking total does not confirm', async () => {
    const s = setup(view({ totalMinor: 20000 }));
    statefulPayment(s, { ...pending });
    jest
      .spyOn((s.svc as any).logger, 'error')
      .mockImplementation(() => undefined);
    s.stripe.webhooks.constructEvent.mockReturnValue(succeededEvent);
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(s.bookings.markConfirmed).not.toHaveBeenCalled();
    expect(s.refunds.refundPayment).toHaveBeenCalled();
  });

  it('succeeded with matching amount_received and currency confirms', async () => {
    const s = setup();
    statefulPayment(s, { ...pending });
    s.stripe.webhooks.constructEvent.mockReturnValue(succeededEvent);
    await s.svc.handleWebhook(Buffer.from('x'), 's');
    expect(s.bookings.markConfirmed).toHaveBeenCalledWith(
      'FLIGHT',
      'b1',
      'pay1',
    );
    expect(s.refunds.refundPayment).not.toHaveBeenCalled();
  });

  it('createForBooking after a total change returns the new amount', async () => {
    const s = setup(view({ totalMinor: 12345 }));
    const state = statefulPayment(s, {
      ...pending,
      id: 'pay0',
      stripeId: 'pi_0',
      amountMinor: 10000,
    });
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_0',
      client_secret: 'cs_0',
      status: 'requires_payment_method',
      amount: 10000,
      currency: 'usd',
    });
    const r = await s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(s.stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_0');
    expect(s.stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 12345, currency: 'usd' }),
      expect.anything(),
    );
    expect(s.model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ stripeId: 'pi_0', status: 'PENDING' }),
      expect.objectContaining({
        stripeId: 'pi_1',
        amountMinor: 12345,
        currency: 'USD',
        $addToSet: { stripeIdHistory: 'pi_0' },
      }),
      expect.anything(),
    );
    expect(state.stripeId).toBe('pi_1');
    expect(r).toEqual({
      paymentId: 'pay0',
      clientSecret: 'cs_1',
      amountMinor: 12345,
      currency: 'USD',
    });
  });

  it('createForBooking recreates a reused PI whose Stripe amount drifted', async () => {
    const s = setup();
    statefulPayment(s, { ...pending, id: 'pay0', stripeId: 'pi_0' });
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_0',
      client_secret: 'cs_0',
      status: 'requires_payment_method',
      amount: 999,
      currency: 'usd',
    });
    const r = await s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(s.stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_0');
    expect(r.clientSecret).toBe('cs_1');
    expect(r.amountMinor).toBe(12345);
  });

  it('createForBooking on a duplicate-key race (11000) returns the existing PENDING payment', async () => {
    const s = setup();
    const winner = { ...pending, id: 'pay0', stripeId: 'pi_0' };
    s.model.findOne
      .mockResolvedValueOnce(null) // first look: nothing yet
      .mockResolvedValueOnce(winner); // re-read after the race
    s.model.create.mockRejectedValueOnce(
      Object.assign(new Error('E11000 duplicate key'), { code: 11000 }),
    );
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_0',
      client_secret: 'cs_0',
      status: 'requires_payment_method',
      amount: 12345,
      currency: 'usd',
    });
    const r = await s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(r).toEqual({
      paymentId: 'pay0',
      clientSecret: 'cs_0',
      amountMinor: 12345,
      currency: 'USD',
    });
    // The intent opened by the losing request is not left dangling.
    expect(s.stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_1');
  });

  it('createForBooking duplicate-key race sharing the same idempotent PI does not cancel it', async () => {
    const s = setup();
    s.model.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...pending, id: 'pay0', stripeId: 'pi_1' });
    s.model.create.mockRejectedValueOnce(
      Object.assign(new Error('E11000 duplicate key'), { code: 11000 }),
    );
    const r = await s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(r.paymentId).toBe('pay0');
    expect(s.stripe.paymentIntents.cancel).not.toHaveBeenCalled();
  });

  it('createForBooking rethrows non-duplicate insert errors', async () => {
    const s = setup();
    s.model.create.mockRejectedValueOnce(new Error('db down'));
    await expect(
      s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1'),
    ).rejects.toThrow('db down');
  });

  it('createForBooking reuses an unchanged PI', async () => {
    const s = setup();
    statefulPayment(s, { ...pending, id: 'pay0', stripeId: 'pi_0' });
    s.stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_0',
      client_secret: 'cs_0',
      status: 'requires_payment_method',
      amount: 12345,
      currency: 'usd',
    });
    const r = await s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1');
    expect(r.clientSecret).toBe('cs_0');
    expect(s.stripe.paymentIntents.cancel).not.toHaveBeenCalled();
    expect(s.stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it.each(['succeeded', 'processing'])(
    'createForBooking with a changed total 409s when the old PI is %s',
    async (piStatus) => {
      const s = setup(view({ totalMinor: 20000 }));
      statefulPayment(s, { ...pending, id: 'pay0', stripeId: 'pi_0' });
      s.stripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_0',
        client_secret: 'cs_0',
        status: piStatus,
        amount: 12345,
        currency: 'usd',
      });
      await expect(
        s.svc.createForBooking('u1', BookingType.FLIGHT, 'b1'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(s.stripe.paymentIntents.cancel).not.toHaveBeenCalled();
      expect(s.stripe.paymentIntents.create).not.toHaveBeenCalled();
    },
  );
});

describe('PAY-01 fix-PAY-01-1: webhook secret fails closed', () => {
  it.each([
    ['missing', undefined],
    ['empty', ''],
  ])(
    'handleWebhook with no configured secret (%s) rejects an event',
    async (_n, secret) => {
      const s = setup(view(), 'USD', { STRIPE_WEBHOOK_SECRET: secret });
      jest
        .spyOn((s.svc as any).logger, 'error')
        .mockImplementation(() => undefined);
      s.stripe.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1' } },
      });
      await expect(
        s.svc.handleWebhook(Buffer.from('{}'), 'sig'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(s.stripe.webhooks.constructEvent).not.toHaveBeenCalled();
      expect(s.bookings.markConfirmed).not.toHaveBeenCalled();
    },
  );
});

describe('PAY-01 A3: testConfirm is dev-only', () => {
  it('testConfirm with NODE_ENV=production throws NotFoundException and never calls paymentIntents.confirm', async () => {
    const s = setup(view(), 'USD', { NODE_ENV: 'production' });
    s.model.findById.mockResolvedValue({
      id: 'pay1',
      userId: 'u1',
      stripeId: 'pi_1',
    });
    await expect(s.svc.testConfirm('u1', 'pay1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(s.stripe.paymentIntents.confirm).not.toHaveBeenCalled();
  });
  it('testConfirm outside production confirms the owner PI', async () => {
    const s = setup(view(), 'USD', { NODE_ENV: 'development' });
    s.model.findById.mockResolvedValue({
      id: 'pay1',
      userId: 'u1',
      stripeId: 'pi_1',
    });
    await s.svc.testConfirm('u1', 'pay1');
    expect(s.stripe.paymentIntents.confirm).toHaveBeenCalledWith(
      'pi_1',
      expect.objectContaining({ payment_method: 'pm_card_visa' }),
    );
  });
});

describe('PAY-01 F17: payments minor fixes', () => {
  const doc = {
    id: 'pay1',
    userId: 'u1',
    bookingType: 'FLIGHT',
    bookingId: 'b1',
    stripeId: 'pi_1',
    amountMinor: 12345,
    currency: 'USD',
    status: 'PENDING',
  };
  it("getForUser other user's id -> 404", async () => {
    const s = setup();
    s.model.findById.mockResolvedValue(doc);
    await expect(
      s.svc.getForUser('other', false, 'pay1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('getForUser: owner and admin can read', async () => {
    const s = setup();
    s.model.findById.mockResolvedValue(doc);
    await expect(s.svc.getForUser('u1', false, 'pay1')).resolves.toEqual(
      expect.objectContaining({ id: 'pay1', amountMinor: 12345 }),
    );
    await expect(s.svc.getForUser('admin', true, 'pay1')).resolves.toEqual(
      expect.objectContaining({ id: 'pay1' }),
    );
  });
  it('cancelForExpiredHold on a succeeded PI does not throw', async () => {
    const s = setup();
    s.model.findOne.mockResolvedValue(doc);
    s.stripe.paymentIntents.cancel.mockRejectedValue(
      Object.assign(new Error('unexpected state'), {
        code: 'payment_intent_unexpected_state',
      }),
    );
    await expect(
      s.svc.cancelForExpiredHold(BookingType.FLIGHT, 'b1'),
    ).resolves.toBeUndefined();
  });
  it('cancelForExpiredHold only cancels a still-open payment (no overwrite of SUCCEEDED)', async () => {
    const s = setup();
    const state = statefulPayment(s, { ...doc });
    s.model.findOne.mockResolvedValue({ ...doc });
    s.stripe.paymentIntents.cancel.mockImplementation(async () => {
      state.status = 'SUCCEEDED'; // the webhook won the race
      return {};
    });
    await s.svc.cancelForExpiredHold(BookingType.FLIGHT, 'b1');
    expect(state.status).toBe('SUCCEEDED');
  });
  it('cancelForExpiredHold rethrows other Stripe errors', async () => {
    const s = setup();
    s.model.findOne.mockResolvedValue(doc);
    s.stripe.paymentIntents.cancel.mockRejectedValue(new Error('network'));
    await expect(
      s.svc.cancelForExpiredHold(BookingType.FLIGHT, 'b1'),
    ).rejects.toThrow('network');
  });
});

describe('PAY-01 F17: Stripe client has no silent placeholder key', () => {
  const cfg = (values: Record<string, string | undefined>) =>
    ({ get: (k: string) => values[k] }) as any;
  afterEach(() => jest.restoreAllMocks());
  it('throws in production without STRIPE_SECRET_KEY', () => {
    expect(() =>
      stripeProvider.useFactory(cfg({ NODE_ENV: 'production' })),
    ).toThrow(/STRIPE_SECRET_KEY/);
  });
  it('warns loudly outside production without STRIPE_SECRET_KEY', () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const client = stripeProvider.useFactory(cfg({ NODE_ENV: 'development' }));
    expect(client).toBeDefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('STRIPE_SECRET_KEY'),
    );
  });
  it('uses the configured key without warning', () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    stripeProvider.useFactory(
      cfg({ NODE_ENV: 'production', STRIPE_SECRET_KEY: 'sk_test_unit' }),
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
