# Wave 1 API contract (shared by t1-t4; the Leader owns this file)
All routes under /api. Error body: {statusCode, error, message, fieldErrors?: [{field, message}], path, timestamp}.
Auth in dev/test (requires env DEV_AUTH_ENABLED=true and NODE_ENV development|test): headers x-dev-user-id (24-hex), x-dev-role (USER|ADMIN|AIRLINE_MOD|HOTEL_MOD), x-dev-provider. No headers -> 401. @Public routes skip it.
Lists: ?page=N (int >= 1, default 1), size fixed 10 -> {items, page, limit: 10, total, totalPages}. page=0 or 'x' -> 400.

## t1 foundation
backend/src/bootstrap/setup-app.ts: `export function setupApp(app: INestApplication): INestApplication`
  applies ValidationPipe({whitelist, forbidNonWhitelisted, transform}), AllExceptionsFilter, cookie-parser, Swagger UI at /api/docs, JSON at /api/docs-json.
main.ts: NestFactory.create(AppModule, {rawBody: true}) then setupApp. Tests must also create the app with {rawBody: true}.
AppModule connects with MongooseModule.forRootAsync(MONGODB_URI). Duplicate key -> 409; invalid ObjectId -> 400; unknown body field -> 400 with fieldErrors.
backend/src/common/security/password-hasher.ts: `hash(plain): Promise<string>` (bcrypt, salted), `verify(plain, hash): Promise<boolean>`.

## t2 payments (module src/modules/payments, PaymentsModule)
:type in URLs is `flight` | `hotel` (anything else -> 400). Owner = view.userId === x-dev-user-id, else 404.
GET  /bookings/:type/:id/policies -> 200 ProviderPolicies (via POLICIES_PROVIDER.getPolicies(view.providerId)).
POST /bookings/:type/:id/accept-policies {accepted: true} -> 200 {policiesAcceptedAt}; accepted!==true -> 400; booking not PENDING_PAYMENT or hold expired -> 409.
POST /payments {bookingType: 'FLIGHT'|'HOTEL', bookingId} -> 201 {paymentId, clientSecret, amountMinor, currency:'USD'}.
  409 when booking not PENDING_PAYMENT, hold expired, or policies not accepted. Existing PENDING payment for the booking -> returns it (same paymentId).
POST /payments/:id/retry -> 201 same shape; only when payment FAILED and hold still valid, else 409.
GET  /payments/:id -> 200 {id, bookingType, bookingId, amountMinor, currency, status}; owner or ADMIN.
POST /payments/webhook (@Public, uses req.rawBody + header stripe-signature) -> 200 {received: true}; bad/missing signature -> 400.
  payment_intent.succeeded: re-retrieve PI, require status 'succeeded' -> payment SUCCEEDED, PayableBooking.markConfirmed once (duplicate event = no second call).
  payment_intent.payment_failed -> payment FAILED, markPaymentFailed. refund.updated / charge.refund.updated -> refund REFUNDED | FAILED.
POST /payments/:id/test-confirm (dev only; 404 when NODE_ENV=production) -> confirms PI with pm_card_visa; booking still only confirmed by webhook.
GET  /refunds/:id -> 200 {id, bookingType, bookingId, amountMinor, currency, reason, status}; owner or ADMIN.
Stripe client: DI token STRIPE_CLIENT exported from src/modules/payments/stripe.provider.ts (tests override it). Webhook verification uses
  the client's `webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`.
RefundsService (token REFUNDS_SERVICE): quote() pure; refundFor(type,id,'USER'|'PROVIDER') uses view.policySnapshot.tiers + daysRemaining(view.serviceStartsAt, view.timeZone),
  PROVIDER = 100%, amount 0 -> null and no Stripe call; else stripe.refunds.create, record PENDING, NOTIFICATIONS_SERVICE.notify(userId,...).

## t3 audit, uploads, currency
AuditModule: AUDIT_SERVICE.record({actorId, action, targetType, targetId, metadata?}); GET /admin/audit-logs (ADMIN only, else 403)
  query page, actorId, action, from, to (ISO dates); newest first.
UploadsModule: UPLOADS_SERVICE per uploads.contract.ts; JPG/PNG by mimetype AND magic bytes; <= 5 MB; max per call from options; stored in UPLOAD_DIR;
  GET /uploads/:filename (@Public) serves the file; unknown -> 404. Violations -> 400 BadRequest with message.
CurrencyModule: CURRENCY_SERVICE.convert(amountMinor, from, to) -> {amountMinor, rate, rateDate}; unsupported code -> 400; no rates ever cached -> 503.
  Supported: EGP, AED, GBP, USD, EUR, JPY, SAR. Rates fetched daily from FX_API_BASE_URL/latest?base=USD&api_key=FX_API_KEY into exchange_rates; on fetch failure keep last cached.
  GET /currencies (@Public) -> {items: [codes]}; GET /currencies/rates (@Public) -> {base, rateDate, rates}.
