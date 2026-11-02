import type { MinorUnits } from '../utils/money';

/** Contract 3 - PayableBooking (Karim -> Ahmed). */

export enum BookingType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}

/** The slice of a booking the payments module needs. */
export interface PayableBookingView {
  userId: string;
  /** Booking total in PLATFORM_CURRENCY minor units. */
  totalMinor: MinorUnits;
  status: BookingStatus;
  /** End of the 10-minute hold; null once no longer held. */
  holdExpiresAt: Date | null;
  /** Set by POST .../accept-policies; payment is blocked while null. */
  policiesAcceptedAt: Date | null;
}

export interface PayableBooking {
  /** Throws NotFoundException when the booking does not exist. */
  getPayable(type: BookingType, id: string): Promise<PayableBookingView>;

  /**
   * Held -> booked after a verified payment_intent.succeeded. Must be
   * idempotent: a second call with the same paymentId is a no-op.
   */
  markConfirmed(
    type: BookingType,
    id: string,
    paymentId: string,
  ): Promise<void>;

  /** Booking stays PENDING_PAYMENT so the user can retry until expiry. */
  markPaymentFailed(type: BookingType, id: string): Promise<void>;
}
