/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-member-access */
import {
  BookingStatus,
  BookingType,
} from '../../common/contracts/booking.contract';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { RefundsService } from './refunds.service';
import {
  Payment,
  PaymentDocument,
  PaymentSchema,
  Refund,
  RefundDocument,
  RefundSchema,
} from './schemas';

const tiers = [
  { daysBefore: 7, refundPercent: 100 },
  { daysBefore: 3, refundPercent: 50 },
];
function setup(days: number) {
  const start = new Date(Date.now() + days * 86_400_000);
  const view = {
    userId: 'u1',
    totalMinor: 10001,
    status: BookingStatus.CONFIRMED,
    holdExpiresAt: null,
    policiesAcceptedAt: new Date(),
    providerId: 'p',
    serviceStartsAt: start,
    timeZone: 'UTC',
    policySnapshot: { kind: 'HOTEL', tiers } as any,
    paymentId: 'pay1',
  };
  const payments = {
    findOne: jest.fn(async (): Promise<any> => ({
      id: 'pay1',
      stripeId: 'pi_1',
      amountMinor: 10001,
      currency: 'USD',
    })),
  };
  let lastCreated: any = null;
  const refundModel = {
    create: jest.fn(async (d: any) => (lastCreated = { id: 'r1', ...d })),
    findOne: jest.fn(async (): Promise<any> => null),
    findOneAndUpdate: jest.fn(async (_f: any, u: any): Promise<any> =>
      u?.$setOnInsert
        ? { id: 'r1', ...u.$setOnInsert }
        : u?.$set && lastCreated
          ? { ...lastCreated, ...u.$set }
          : null,
    ),
    countDocuments: jest.fn(async (): Promise<number> => 0),
    deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
    findById: jest.fn(),
  };
  const stripe = {
    refunds: { create: jest.fn(async () => ({ id: 're_1' })) },
    paymentIntents: {
      retrieve: jest.fn(async (): Promise<any> => ({
        id: 'pi_1',
        amount_received: 10001,
      })),
    },
  };
  const bookings = { getPayable: jest.fn(async () => view) };
  const notifications = { notify: jest.fn(async () => undefined) };
  const svc = new RefundsService(
    refundModel as any,
    payments as any,
    stripe as any,
    bookings as any,
    notifications,
  );
  return { svc, stripe, refundModel, notifications };
}

describe('RefundsService.quote', () => {
  const { svc } = setup(0);
  it('picks highest daysBefore <= remaining', () => {
    expect(svc.quote({ tiers }, 10, 1000)).toMatchObject({
      refundPercent: 100,
      amountMinor: 1000,
    });
    expect(svc.quote({ tiers }, 5, 1000)).toMatchObject({
      refundPercent: 50,
      amountMinor: 500,
    });
  });
  it('boundary is inclusive', () => {
    expect(svc.quote({ tiers }, 7, 1000).refundPercent).toBe(100);
    expect(svc.quote({ tiers }, 3, 1000).refundPercent).toBe(50);
  });
  it('no tier -> 0% and null tier', () => {
    expect(svc.quote({ tiers }, 2, 1000)).toEqual({
      tier: null,
      refundPercent: 0,
      amountMinor: 0,
    });
    expect(svc.quote({ tiers: [] }, 9, 1000).amountMinor).toBe(0);
  });
  it('rounds down', () => {
    expect(svc.quote({ tiers }, 5, 1001).amountMinor).toBe(500);
  });
});

describe('RefundsService.refundFor', () => {
  it('USER refund uses tier, calls Stripe, records PENDING, notifies', async () => {
    const { svc, stripe, refundModel, notifications } = setup(5.5);
    const r = await svc.refundFor(BookingType.HOTEL, 'b1', 'USER');
    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_1', amount: 5000 }),
      expect.anything(),
    );
    // Claimed as PENDING before Stripe is called, then linked to the refund.
    expect(refundModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'PENDING',
        stripeRefundId: null,
        paymentIntentId: 'pi_1',
        amountMinor: 5000,
        reason: 'USER',
      }),
    );
    expect(refundModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { $set: { stripeRefundId: 're_1' } },
      { new: true },
    );
    expect(r).toMatchObject({
      status: 'PENDING',
      stripeRefundId: 're_1',
      amountMinor: 5000,
      reason: 'USER',
    });
    expect(notifications.notify).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ type: 'REFUND_ISSUED' }),
    );
    expect(r).not.toBeNull();
  });
  it('PROVIDER refunds 100% regardless of tiers', async () => {
    const { svc, stripe } = setup(0);
    await svc.refundFor(BookingType.HOTEL, 'b1', 'PROVIDER');
    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10001 }),
      expect.anything(),
    );
  });
  it('zero amount issues nothing', async () => {
    const { svc, stripe, refundModel, notifications } = setup(1);
    expect(await svc.refundFor(BookingType.HOTEL, 'b1', 'USER')).toBeNull();
    expect(stripe.refunds.create).not.toHaveBeenCalled();
    expect(refundModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(notifications.notify).not.toHaveBeenCalled();
  });
});

describe('RefundsService.refundPayment', () => {
  it('refunds the full captured amount as PROVIDER, PENDING', async () => {
    const { svc, stripe, refundModel } = setup(0);
    await svc.refundPayment(
      {
        id: 'pay1',
        bookingType: BookingType.HOTEL,
        bookingId: 'b1',
        userId: 'u1',
        amountMinor: 777,
        currency: 'USD',
      } as any,
      { id: 'pi_old', amount_received: 777 },
      'PROVIDER',
    );
    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_old', amount: 777 }),
      { idempotencyKey: 'refund-pi-pi_old' },
    );
    expect(refundModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'PENDING',
        reason: 'PROVIDER',
        amountMinor: 777,
      }),
    );
    expect(refundModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { $set: { stripeRefundId: 're_1' } },
      expect.anything(),
    );
  });
});

describe('RefundsService.applyStripeRefund', () => {
  it('maps statuses', async () => {
    const { svc, refundModel } = setup(0);
    await svc.applyStripeRefund({ id: 're_1', status: 'succeeded' } as any);
    expect(refundModel.findOneAndUpdate).toHaveBeenCalledWith(
      { stripeRefundId: 're_1', status: { $ne: 'REFUNDED' } },
      { status: 'REFUNDED' },
      expect.anything(),
    );
    await svc.applyStripeRefund({ id: 're_1', status: 'failed' } as any);
    expect(refundModel.findOneAndUpdate).toHaveBeenLastCalledWith(
      { stripeRefundId: 're_1', status: { $ne: 'FAILED' } },
      { status: 'FAILED' },
      expect.anything(),
    );
  });
});

describe('PAY-03 F3: refund the amount captured on the PI', () => {
  it('refundPayment refunds and records amount_received, not amountMinor', async () => {
    const { svc, stripe, refundModel } = setup(0);
    await svc.refundPayment(
      {
        id: 'pay1',
        bookingType: BookingType.HOTEL,
        bookingId: 'b1',
        userId: 'u1',
        amountMinor: 777,
        currency: 'USD',
      } as any,
      { id: 'pi_old', amount_received: 500 },
      'PROVIDER',
    );
    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_old', amount: 500 }),
      { idempotencyKey: 'refund-pi-pi_old' },
    );
    const written = JSON.stringify([
      ...refundModel.create.mock.calls,
      ...refundModel.findOneAndUpdate.mock.calls,
    ]);
    expect(written).toContain('"amountMinor":500');
    expect(written).not.toContain('"amountMinor":777');
  });
  it('refundFor bases the refund on the captured amount of the PI', async () => {
    const { svc, stripe } = setup(0);
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      amount_received: 9000,
    });
    await svc.refundFor(BookingType.HOTEL, 'b1', 'PROVIDER');
    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_1');
    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_1', amount: 9000 }),
      expect.anything(),
    );
  });
});

describe('PAY-03 F4: refunds are deduped per PaymentIntent', () => {
  const pay = {
    id: 'pay1',
    bookingType: BookingType.HOTEL,
    bookingId: 'b1',
    userId: 'u1',
    amountMinor: 777,
    currency: 'USD',
  } as any;
  it('refundPayment returns the existing refund of the same PI without calling Stripe', async () => {
    const { svc, stripe, refundModel } = setup(0);
    refundModel.findOne.mockImplementation(async (f: any) =>
      f.paymentIntentId === 'pi_old'
        ? { id: 'r0', paymentIntentId: 'pi_old', status: 'PENDING' }
        : null,
    );
    const r = await svc.refundPayment(
      pay,
      { id: 'pi_old', amount_received: 777 },
      'PROVIDER',
    );
    expect(r?.id).toBe('r0');
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });
  it('records paymentIntentId on the refund', async () => {
    const { svc, refundModel } = setup(0);
    await svc.refundPayment(
      pay,
      { id: 'pi_old', amount_received: 777 },
      'PROVIDER',
    );
    const written = JSON.stringify([
      ...refundModel.create.mock.calls,
      ...refundModel.findOneAndUpdate.mock.calls,
    ]);
    expect(written).toContain('"paymentIntentId":"pi_old"');
  });
  it('refundFor is not blocked by a refund of another PI on the same booking', async () => {
    const { svc, stripe, refundModel } = setup(0);
    refundModel.findOne.mockImplementation(async (f: any) =>
      f.paymentIntentId === 'pi_1'
        ? null
        : { id: 'r_late', paymentIntentId: 'pi_late', status: 'PENDING' },
    );
    const r = await svc.refundFor(BookingType.HOTEL, 'b1', 'PROVIDER');
    expect(stripe.refunds.create).toHaveBeenCalled();
    expect(r?.id).not.toBe('r_late');
  });
});

describe('PAY-03: refund notifications and minor units', () => {
  const pay = (currency: string) =>
    ({
      id: 'pay1',
      bookingType: BookingType.HOTEL,
      bookingId: 'b1',
      userId: 'u1',
      amountMinor: 777,
      currency,
    }) as any;

  it('refundPayment (late/superseded) notifies the user', async () => {
    const { svc, notifications } = setup(0);
    await svc.refundPayment(
      pay('USD'),
      { id: 'pi_old', amount_received: 777 },
      'PROVIDER',
    );
    expect(notifications.notify).toHaveBeenCalledTimes(1);
    expect(notifications.notify).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        type: 'REFUND_ISSUED',
        body: expect.stringContaining('7.77 USD'),
      }),
    );
  });
  it('refundPayment returning an existing refund does not notify again', async () => {
    const { svc, refundModel, notifications } = setup(0);
    refundModel.findOne.mockResolvedValue({ id: 'r0', status: 'PENDING' });
    await svc.refundPayment(
      pay('USD'),
      { id: 'pi_old', amount_received: 777 },
      'PROVIDER',
    );
    expect(notifications.notify).not.toHaveBeenCalled();
  });
  it('formats a zero-decimal currency (JPY) without dividing by 100', async () => {
    const { svc, notifications } = setup(0);
    await svc.refundPayment(
      pay('JPY'),
      { id: 'pi_jpy', amount_received: 500 },
      'PROVIDER',
    );
    const arg = (notifications.notify.mock.calls[0] as any[])[1];
    expect(arg.body).toContain('500 JPY');
    expect(arg.body).not.toContain('5.00');
  });
  it('webhook REFUNDED notifies the owner', async () => {
    const { svc, refundModel, notifications } = setup(0);
    refundModel.findOneAndUpdate.mockResolvedValue({
      id: 'r1',
      userId: 'u9',
      amountMinor: 1234,
      currency: 'EUR',
    });
    await svc.applyStripeRefund({ id: 're_1', status: 'succeeded' } as any);
    expect(notifications.notify).toHaveBeenCalledWith(
      'u9',
      expect.objectContaining({
        type: 'REFUND_COMPLETED',
        body: expect.stringContaining('12.34 EUR'),
      }),
    );
  });
  it('webhook FAILED notifies the owner', async () => {
    const { svc, refundModel, notifications } = setup(0);
    refundModel.findOneAndUpdate.mockResolvedValue({
      id: 'r1',
      userId: 'u9',
      amountMinor: 1234,
      currency: 'USD',
    });
    await svc.applyStripeRefund({ id: 're_1', status: 'failed' } as any);
    expect(notifications.notify).toHaveBeenCalledWith(
      'u9',
      expect.objectContaining({ type: 'REFUND_FAILED' }),
    );
  });
  it('webhook that changes nothing (redelivery / unknown) does not notify', async () => {
    const { svc, notifications } = setup(0);
    await svc.applyStripeRefund({ id: 're_1', status: 'succeeded' } as any);
    await svc.applyStripeRefund({ id: 're_1', status: 'pending' } as any);
    expect(notifications.notify).not.toHaveBeenCalled();
  });
});

describe('PAY-03 F5: zero captured amount', () => {
  it('refundPayment(pay, {amount_received: 0}) returns null and never calls stripe.refunds.create', async () => {
    const { svc, stripe, refundModel, notifications } = setup(0);
    const r = await svc.refundPayment(
      {
        id: 'pay1',
        bookingType: BookingType.HOTEL,
        bookingId: 'b1',
        userId: 'u1',
        amountMinor: 777,
        currency: 'USD',
      } as any,
      { id: 'pi_zero', amount_received: 0 },
      'PROVIDER',
    );
    expect(r).toBeNull();
    expect(stripe.refunds.create).not.toHaveBeenCalled();
    expect(refundModel.create).not.toHaveBeenCalled();
    expect(refundModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(notifications.notify).not.toHaveBeenCalled();
  });
});

describe('PAY-03 F4: one idempotency key per PaymentIntent', () => {
  it('refundFor uses the same key as refundPayment (refund-pi-<PI>)', async () => {
    const { svc, stripe } = setup(0);
    await svc.refundFor(BookingType.HOTEL, 'b1', 'PROVIDER');
    expect(stripe.refunds.create).toHaveBeenCalledWith(expect.anything(), {
      idempotencyKey: 'refund-pi-pi_1',
    });
  });
});

/* Real Mongo (replica set): the dedupe must hold at the database level. */
describe('PAY-03/PAY-01/PAY-04: database-level uniqueness', () => {
  let mongo: MongoMemoryReplSet;
  let conn: Connection;
  let payments: Model<PaymentDocument>;
  let refunds: Model<RefundDocument>;

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    conn = await mongoose
      .createConnection(mongo.getUri('refunds_spec'), { autoIndex: false })
      .asPromise();
    payments = conn.model<PaymentDocument>(Payment.name, PaymentSchema);
    refunds = conn.model<RefundDocument>(Refund.name, RefundSchema);
    // Build every unique/partial index before asserting on it.
    await payments.syncIndexes();
    await refunds.syncIndexes();
  }, 120_000);
  afterAll(async () => {
    await conn?.close();
    await mongo?.stop();
  });
  beforeEach(async () => {
    await payments.deleteMany({});
    await refunds.deleteMany({});
  });

  const paymentFields = (over: Record<string, unknown> = {}) => ({
    bookingType: BookingType.HOTEL,
    bookingId: 'b1',
    userId: 'u1',
    stripeId: 'pi_1',
    amountMinor: 10001,
    currency: 'USD',
    status: 'SUCCEEDED',
    ...over,
  });
  const refundFields = (over: Record<string, unknown> = {}) => ({
    bookingType: BookingType.HOTEL,
    bookingId: 'b1',
    userId: 'u1',
    paymentId: 'pay1',
    paymentIntentId: 'pi_1',
    amountMinor: 100,
    currency: 'USD',
    reason: 'USER',
    status: 'PENDING',
    ...over,
  });

  function realService(paymentId: string) {
    let n = 0;
    const stripe = {
      refunds: {
        // Yields to the event loop so concurrent callers interleave.
        create: jest.fn(async (): Promise<any> => {
          await new Promise((r) => setTimeout(r, 20));
          return { id: `re_${++n}` };
        }),
      },
      paymentIntents: {
        retrieve: jest.fn(async (id: string) => ({
          id,
          amount_received: 10001,
        })),
      },
    };
    const view = {
      userId: 'u1',
      totalMinor: 10001,
      status: BookingStatus.CONFIRMED,
      holdExpiresAt: null,
      policiesAcceptedAt: new Date(),
      providerId: 'p',
      serviceStartsAt: new Date(Date.now() + 30 * 86_400_000),
      timeZone: 'UTC',
      policySnapshot: { kind: 'HOTEL', tiers } as any,
      paymentId,
    };
    const notifications = { notify: jest.fn(async () => undefined) };
    const svc = new RefundsService(
      refunds,
      payments,
      stripe as any,
      { getPayable: jest.fn(async () => view) } as any,
      notifications,
    );
    return { svc, stripe, notifications };
  }

  it('refundFor twice for the same booking issues one refunds.create', async () => {
    const pay = await payments.create(paymentFields());
    const { svc, stripe, notifications } = realService(String(pay._id));
    const a = await svc.refundFor(BookingType.HOTEL, 'b1', 'USER');
    const b = await svc.refundFor(BookingType.HOTEL, 'b1', 'USER');
    expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
    expect(b?.id).toBe(a?.id);
    expect(await refunds.countDocuments({})).toBe(1);
    expect(notifications.notify).toHaveBeenCalledTimes(1);
  });

  it('concurrent refundFor calls issue one refund', async () => {
    const pay = await payments.create(paymentFields());
    const { svc, stripe } = realService(String(pay._id));
    const [a, b] = await Promise.all([
      svc.refundFor(BookingType.HOTEL, 'b1', 'USER'),
      svc.refundFor(BookingType.HOTEL, 'b1', 'USER'),
    ]);
    expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
    expect(a?.id).toBe(b?.id);
    expect(await refunds.countDocuments({})).toBe(1);
  });

  it('parallel refundFor + refundPayment -> one refund', async () => {
    const pay = await payments.create(paymentFields());
    const { svc, stripe, notifications } = realService(String(pay._id));
    const [a, b] = await Promise.all([
      svc.refundFor(BookingType.HOTEL, 'b1', 'PROVIDER'),
      svc.refundPayment(
        pay,
        { id: 'pi_1', amount_received: 10001 },
        'PROVIDER',
      ),
    ]);
    expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
    expect(a?.id).toBe(b?.id);
    expect(await refunds.countDocuments({ paymentIntentId: 'pi_1' })).toBe(1);
    expect(notifications.notify).toHaveBeenCalledTimes(1);
  });

  it('a Stripe error releases the claim so a later call can refund', async () => {
    const pay = await payments.create(paymentFields());
    const { svc, stripe } = realService(String(pay._id));
    stripe.refunds.create.mockRejectedValueOnce(new Error('stripe down'));
    await expect(
      svc.refundFor(BookingType.HOTEL, 'b1', 'USER'),
    ).rejects.toThrow('stripe down');
    expect(await refunds.countDocuments({})).toBe(0);
    const r = await svc.refundFor(BookingType.HOTEL, 'b1', 'USER');
    expect(r?.stripeRefundId).toBe('re_1');
    expect(await refunds.countDocuments({})).toBe(1);
  });

  it('after a FAILED refund a new refund of the PI uses a fresh idempotency key', async () => {
    const pay = await payments.create(paymentFields());
    await refunds.create(
      refundFields({ status: 'FAILED', stripeRefundId: 're_old' }),
    );
    const { svc, stripe } = realService(String(pay._id));
    const r = await svc.refundFor(BookingType.HOTEL, 'b1', 'USER');
    expect(r?.stripeRefundId).toBe('re_1');
    expect((stripe.refunds.create.mock.calls[0] as any[])[1]).toEqual({
      idempotencyKey: 'refund-pi-pi_1-1',
    });
  });

  it('refunds: one active (PENDING/REFUNDED) refund per paymentIntentId', async () => {
    await refunds.create(refundFields({ status: 'FAILED' }));
    await refunds.create(refundFields({ status: 'FAILED' }));
    await refunds.create(refundFields({ status: 'PENDING' }));
    await expect(
      refunds.create(refundFields({ status: 'PENDING' })),
    ).rejects.toMatchObject({ code: 11000 });
    await expect(
      refunds.create(refundFields({ status: 'REFUNDED' })),
    ).rejects.toMatchObject({ code: 11000 });
    await refunds.create(refundFields({ paymentIntentId: 'pi_2' }));
  });

  it('payments: stripeId is unique', async () => {
    await payments.create(paymentFields());
    await expect(
      payments.create(paymentFields({ bookingId: 'b2' })),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('payments: one PENDING payment per booking', async () => {
    await payments.create(
      paymentFields({ stripeId: 'pi_a', status: 'FAILED' }),
    );
    await payments.create(
      paymentFields({ stripeId: 'pi_b', status: 'PENDING' }),
    );
    await expect(
      payments.create(paymentFields({ stripeId: 'pi_c', status: 'PENDING' })),
    ).rejects.toMatchObject({ code: 11000 });
    // Another booking, or another booking type, is independent.
    await payments.create(
      paymentFields({ stripeId: 'pi_d', status: 'PENDING', bookingId: 'b2' }),
    );
    await payments.create(
      paymentFields({
        stripeId: 'pi_e',
        status: 'PENDING',
        bookingType: BookingType.FLIGHT,
      }),
    );
  });
});

describe('PAY-04 F13: amounts are integer minor units', () => {
  const PaymentModel = mongoose.model<PaymentDocument>(
    'PaymentValidation',
    PaymentSchema,
  );
  const RefundModel = mongoose.model<RefundDocument>(
    'RefundValidation',
    RefundSchema,
  );
  const base = {
    bookingType: BookingType.HOTEL,
    bookingId: 'b1',
    userId: 'u1',
    currency: 'USD',
  };
  it('saving Payment with amountMinor 10.5 fails validation', () => {
    const err = new PaymentModel({
      ...base,
      stripeId: 'pi_1',
      amountMinor: 10.5,
    }).validateSync();
    expect(err?.errors.amountMinor).toBeDefined();
  });
  it('saving Refund with amountMinor 10.5 fails validation', () => {
    const err = new RefundModel({
      ...base,
      paymentId: 'pay1',
      paymentIntentId: 'pi_1',
      amountMinor: 10.5,
      reason: 'USER',
    }).validateSync();
    expect(err?.errors.amountMinor).toBeDefined();
  });
  it('negative amounts are rejected; integers pass', () => {
    expect(
      new PaymentModel({
        ...base,
        stripeId: 'pi_1',
        amountMinor: -1,
      }).validateSync()?.errors.amountMinor,
    ).toBeDefined();
    expect(
      new PaymentModel({
        ...base,
        stripeId: 'pi_1',
        amountMinor: 10001,
      }).validateSync(),
    ).toBeUndefined();
  });
});
