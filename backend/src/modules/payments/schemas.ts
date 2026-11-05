import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BookingType } from '../../common/contracts/booking.contract';
import { PaymentStatus } from '../../common/contracts/payments.contract';
import {
  type RefundReason,
  RefundStatus,
} from '../../common/contracts/refunds.contract';

/** Money is stored as non-negative integer minor units (PAY-04). */
const minorUnits = {
  type: Number,
  required: true,
  min: 0,
  validate: {
    validator: (v: number) => Number.isInteger(v),
    message: '{PATH} must be an integer amount in minor units',
  },
} as const;

/** Only the PAY-01 fields are stored; never card data. */
@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({ type: String, required: true, enum: BookingType })
  bookingType: BookingType;
  @Prop({ required: true, index: true }) bookingId: string;
  @Prop({ required: true }) userId: string;
  /** Current PaymentIntent id; unique (see the indexes below). */
  @Prop({ required: true }) stripeId: string;
  /** Earlier PaymentIntent ids superseded by retries. */
  @Prop({ type: [String], default: [], index: true })
  stripeIdHistory: string[];
  @Prop(minorUnits) amountMinor: number;
  /** Always PLATFORM_CURRENCY, set by the service (no schema default). */
  @Prop({ required: true }) currency: string;
  @Prop({
    type: String,
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;
}
export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
/** One payment record per PaymentIntent. */
PaymentSchema.index({ stripeId: 1 }, { unique: true, name: 'stripeId_unique' });
/** At most one PENDING payment per booking, even under concurrent creates. */
PaymentSchema.index(
  { bookingType: 1, bookingId: 1 },
  {
    unique: true,
    name: 'booking_pending_unique',
    partialFilterExpression: { status: PaymentStatus.PENDING },
  },
);

@Schema({ collection: 'refunds', timestamps: true })
export class Refund {
  @Prop({ type: String, required: true, enum: BookingType })
  bookingType: BookingType;
  @Prop({ required: true, index: true }) bookingId: string;
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) paymentId: string;
  /** The PaymentIntent refunded; refunds are deduped per PI. */
  @Prop({ type: String, required: true, index: true })
  paymentIntentId: string;
  @Prop({ type: String, default: null })
  stripeRefundId: string | null;
  @Prop(minorUnits) amountMinor: number;
  /** Always PLATFORM_CURRENCY, set by the service (no schema default). */
  @Prop({ required: true }) currency: string;
  @Prop({ type: String, required: true, enum: ['USER', 'PROVIDER'] })
  reason: RefundReason;
  @Prop({
    type: String,
    required: true,
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;
}
export type RefundDocument = HydratedDocument<Refund>;
export const RefundSchema = SchemaFactory.createForClass(Refund);
/** One local record per Stripe refund, even under concurrent webhooks. */
RefundSchema.index(
  { stripeRefundId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripeRefundId: { $type: 'string' } },
  },
);
/**
 * At most one active (not FAILED) refund per PaymentIntent. The service
 * claims this slot before calling Stripe, so concurrent refundFor /
 * refundPayment calls issue a single refund.
 */
RefundSchema.index(
  { paymentIntentId: 1 },
  {
    unique: true,
    name: 'paymentIntentId_active_unique',
    partialFilterExpression: {
      status: { $in: [RefundStatus.PENDING, RefundStatus.REFUNDED] },
    },
  },
);
