---
paths:
  - "backend/src/modules/payments/**"
  - "backend/src/modules/*booking*/**"
  - "backend/src/modules/auth/**"
  - "backend/src/modules/uploads/**"
  - "backend/src/common/**"
  - "backend/src/config/**"
---
# Money, payments and security invariants (regression-tested; do not weaken)

## Money (PAY-04)
- Integer minor units only, in `PLATFORM_CURRENCY`. Percentages via `percentOfMinor`; formatting via `minorToDecimalString`.
  Never floats for money, never `parseFloat` on amounts. Booking prices are never converted (only itinerary budgets, ITN-18).

## Bookings and payments (PAY-01, PAY-02, GEN-11)
- Lifecycle: PENDING_PAYMENT → CONFIRMED → COMPLETED; PENDING_PAYMENT → EXPIRED (10-min hold); CONFIRMED → CANCELLED. Nothing else.
- Payment is blocked until policies are accepted; acceptance stores a timestamp and a frozen policy snapshot.
- A booking is confirmed only by the verified `payment_intent.succeeded` webhook (signature over the raw body), after re-reading
  the PaymentIntent and checking amount_received/currency equal the stored amount and the booking total. Idempotent.
- A late, superseded or mismatched success is refunded in full, never confirmed. Retry cancels the previous PaymentIntent.
- When a hold expires, the expiry job releases inventory and calls `PaymentsService.cancelForExpiredHold`.
- Store only the Stripe id, amount, currency, status (plus booking/user references). Never card data.

## Refunds (PAY-03)
- One active refund per PaymentIntent (DB-claimed before calling Stripe). USER: tier from the policy snapshot by calendar days
  remaining in the provider time zone; PROVIDER: 100%. The local status mirrors Stripe's (`pending`/`succeeded`/`failed`).

## Security
- Passwords: bcrypt via `PasswordHasher` only. Auth tokens only in httpOnly, Secure (prod), SameSite cookies (ACC-19).
- Every non-public route checks role and ownership/provider scope in the backend (ACC-11, GEN-13).
- Mongo operator injection: DTO-validate every query field; never pass raw `req.query`/`req.body` objects into a filter.
- Uploads (GEN-08): JPG/PNG by magic bytes, ≤ 5 MB, ≤ 5 per post/activity/hotel counting existing images, 1 airline logo.
- Webhook stays `@Public()` and rejects when `STRIPE_WEBHOOK_SECRET` is missing. Dev-only endpoints return 404 in production.
- Use the `security-reviewer` agent for any diff touching these paths.
