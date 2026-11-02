/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import {
  BookingStatus,
  BookingType,
} from '../../common/contracts/booking.contract';
import { RefundsService } from './refunds.service';

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
  const refundModel = {
    create: jest.fn(async (d: any) => ({ id: 'r1', ...d })),
    findOne: jest.fn(async (): Promise<any> => null),
    findOneAndUpdate: jest.fn(async (): Promise<any> => null),
    findById: jest.fn(),
  };
  const stripe = { refunds: { create: jest.fn(async () => ({ id: 're_1' })) } };
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
    expect(refundModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'PENDING',
        stripeRefundId: 're_1',
        amountMinor: 5000,
        reason: 'USER',
      }),
    );
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
    expect(refundModel.create).not.toHaveBeenCalled();
    expect(notifications.notify).not.toHaveBeenCalled();
  });
});

describe('RefundsService.applyStripeRefund', () => {
  it('maps statuses', async () => {
    const { svc, refundModel } = setup(0);
    await svc.applyStripeRefund({ id: 're_1', status: 'succeeded' } as any);
    expect(refundModel.findOneAndUpdate).toHaveBeenCalledWith(
      { stripeRefundId: 're_1' },
      { status: 'REFUNDED' },
      expect.anything(),
    );
    await svc.applyStripeRefund({ id: 're_1', status: 'failed' } as any);
    expect(refundModel.findOneAndUpdate).toHaveBeenLastCalledWith(
      { stripeRefundId: 're_1' },
      { status: 'FAILED' },
      expect.anything(),
    );
  });
});
