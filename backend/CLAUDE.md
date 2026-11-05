# backend/ — NestJS 11 conventions

## Layout
- src/config/env.schema.ts: Joi env validation, fails fast. Add a variable here AND in /.env.example (CI checks they match).
- src/bootstrap/setup-app.ts: ValidationPipe (whitelist, forbidNonWhitelisted, transform), AllExceptionsFilter, cookie-parser, Swagger.
- src/common/: contracts/ (interfaces + DI tokens), stubs/ (ContractStubsModule), decorators/ (@Public @Roles @CurrentUser),
  guards/ (DevAuthGuard, temporary), filters/, pipes/ (ParseObjectIdPipe), dto/ (pagination), security/ (PasswordHasher), swagger/ (@ApiErrors), utils/ (money, dates).
- src/modules/<name>/: each feature exports <Name>Module. The Leader wires it into src/app.module.ts at merge.
- scripts/: ts-node tools (export-openapi, demo-server); excluded from the build (tsconfig.build.json). CI asserts dist/main.js.

## Contracts (inject by token, never import another module)
PAYABLE_BOOKING (stub → Ahmed hold/confirm/lifecycle + Karim booking views/cancel) · POLICIES_PROVIDER (stub → Joudy airline, Sandra hotel) · NOTIFICATIONS_SERVICE (stub → Karim) ·
PAYMENTS_SERVICE · REFUNDS_SERVICE · CURRENCY_SERVICE · AUDIT_SERVICE · UPLOADS_SERVICE (real, Ahmed).
Replace a stub in the owning module with { provide: TOKEN, useExisting: RealService }.
The hold-expiry job (GEN-11, Ahmed) calls PaymentsService.cancelForExpiredHold; cancellations (Karim) call RefundsService.refundFor.
Ownership per person and shared modules: docs/team/ownership.md (Jira is the source of truth).

## Auth in dev/test
DEV_AUTH_ENABLED=true and NODE_ENV development|test enable x-dev-user-id / x-dev-role / x-dev-provider headers (Swagger "Authorize").
Refused in production. Real JWT cookie guard (ACC-11) replaces DevAuthGuard.

## Money and time
Integer minor units only; currency exponent from utils/money.ts (JPY has 0 decimals). UTC storage; daysRemaining in provider tz (utils/dates.ts).

## Payments invariants (regression-tested)
Webhook signature verified on req.rawBody (app created with {rawBody:true}). Confirm only via webhook, idempotent.
Late or superseded PaymentIntent success → automatic refund, never confirm. Retry cancels the previous PI. Refunds deduped per PaymentIntent, amount_received.

## Swagger
Every operation summary starts with [ID], e.g. "[PAY-01] Create payment intent". Document errors with @ApiErrors.
After changing an endpoint: npm run openapi:export and commit docs/api/openapi.json (CI fails on drift).

## Tests
Unit: *.spec.ts next to the code (mock models/Stripe). e2e: test/*.e2e-spec.ts, MongoMemoryReplSet via jest globalSetup,
utils/test-app.ts (require(), not dynamic import(); fake Stripe with the real webhook signing util).
Fixtures never look like real credentials: mongodb://<user>:<password>@… (the PR secret scanner flags user:pass@).

## Local database
backend/.env (never read or print it). Behind Cloudflare WARP or strict DNS, mongodb+srv fails with querySrv ECONNREFUSED:
use the direct-host form (one or three shard hosts + replicaSet=…); env.schema accepts both.
