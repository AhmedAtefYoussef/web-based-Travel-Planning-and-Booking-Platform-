v2
## repo
Monorepo: backend/ (NestJS 11, TS, Mongoose 8, Jest), frontend/ (M2), docs/{requirements,architecture,api,agentic}, .github/.
Requirements: docs/requirements/reqs.json ("acceptance"/"owner" on Ahmed rows). Plan: docs/requirements/plan.md (line index in CLAUDE.md).
## conventions
Prefix /api. Money: integer minor units in PLATFORM_CURRENCY; per-currency exponent in common/utils/money.ts.
Errors {statusCode,error,message,fieldErrors?,path,timestamp}. Pagination ?page=N, size 10, {items,page,limit,total,totalPages}.
Conventional Commits with [ID]; branches feature|fix|refactor|docs|test|chore|ci/<ID>-slug off develop. Secrets only in backend/.env.
## backend layout (v2, develop c1cc80b)
src/config/env.schema.ts (Joi; MONGODB_URI by pattern, multi-host ok; DEV_AUTH_ENABLED refused in production).
src/bootstrap/setup-app.ts (ValidationPipe, AllExceptionsFilter, cookie-parser, Swagger /api/docs + /api/docs-json, dev auth schemes).
src/common/{contracts,stubs,decorators,guards,filters,pipes,dto,security,swagger,utils}. Inject contracts by token from contracts/tokens.ts.
src/modules/{payments,audit,uploads,currency} (Ahmed). app.module.ts: Config, Mongoose, Schedule, Security, ContractStubs, Audit, Uploads, Currency, Payments.
scripts/{export-openapi,demo-server}.ts (ts-node; excluded from build). test/: global-setup replica set, utils/test-app.ts (require(), fake Stripe).
## decisions (since v1)
D1 Dev header auth opt-in: DEV_AUTH_ENABLED=true and NODE_ENV development|test only (PR#3).
D2 Stripe: success only PENDING/FAILED -> SUCCEEDED for current PI; late or superseded success -> automatic refund, never confirm;
   retry cancels old PI (keeps stripeIdHistory); refunds deduped per PaymentIntent for amount_received (PR#8, #12).
D3 Build excludes backend/scripts; CI asserts dist/main.js (PR#14, #17).
D4 PR gate: pr-requirements reads rules + reqs.json from BASE branch; pr-open.yml separate so the check runs once (PR#17).
D5 No auto-merge; CODEOWNERS * -> Ahmed; dismiss stale; last-push approval; Ahmed merges every PR.
D6 Default branch develop. D7 main strict=false; back-merge PRs (main->develop) are closed, not merged.
D8 MONGODB_URI validated by pattern, not Joi.uri() (PR#19). D9 Atlas db travel_platform; members readWriteAnyDatabase (risk).
D10 .swarm tracked in git except tmp/ and web/; Claude settings deny pushes to develop/main and force pushes only.
## contracts and owners
PAYABLE_BOOKING (stub -> Karim), POLICIES_PROVIDER (stub -> Joudy airline, Sandra hotel), NOTIFICATIONS_SERVICE (stub -> Karim);
PAYMENTS_SERVICE, REFUNDS_SERVICE, CURRENCY_SERVICE, AUDIT_SERVICE, UPLOADS_SERVICE real (Ahmed). Karim's expiry job calls cancelForExpiredHold;
cancellations call refundFor. Refund notification types REFUND_COMPLETED / REFUND_FAILED.
## test harness gotchas
App must be created with {rawBody:true}. e2e: memory-server replica set via jest globalSetup; DEV_AUTH_ENABLED=true in setup-env.
ts-jest rejects dynamic import(): use require(). Fixtures use <user>:<password> (secret scanner). openapi:export sets its own env.
## web cache (.swarm/web/, not committed)
Stripe webhooks/testing/refunds/API, Nest raw-body and file-upload, fxratesapi (thin: GET {FX_API_BASE_URL}/latest?base=USD&api_key).
## History
Wave 0-3 cards/results: .swarm/archive/wave-1-3/. Session digest: .swarm/archive/handoff-2026-11/session-digest.md.
