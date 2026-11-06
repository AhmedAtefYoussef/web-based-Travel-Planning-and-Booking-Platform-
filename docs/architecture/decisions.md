# Decisions log

Short, durable project decisions. Bigger ones have ADRs (`adr-00N-*.md`). Newest last. Each line: what, why, where.

## Platform and conventions
- D1 Money: integer minor units in `PLATFORM_CURRENCY` (default USD, env-driven); per-currency exponent in `common/utils/money.ts`. (ADR-004, PAY-04)
- D2 Time: stored UTC; daysRemaining = calendar-day difference in the provider's IANA zone (`common/utils/dates.ts`). (ADR-004, GEN-06)
- D3 Errors `{statusCode,error,message,fieldErrors?,path,timestamp}`; pagination `?page=N`, size fixed at 10, `limit` other than 10 → 400. (GEN-02, GEN-05)
- D4 Auth: httpOnly cookies (ADR-001). Until ACC-11 ships a temporary deny-by-default guard accepts `x-dev-*` headers only with
  `DEV_AUTH_ENABLED=true` and `NODE_ENV` development|test; the app refuses to boot with it in production.
- D5 Modules talk only through `common/contracts` tokens; stubs in `ContractStubsModule` until the owner's module lands.
- D6 Inventory concurrency: atomic conditional `$inc` for seats; `room_nights` unique `{roomId,date}` + transaction for hotels;
  expiry job every 30 s. Tests use a mongodb-memory-server replica set. (ADR-002)
- D7 Env validation fails closed: `NODE_ENV` required; live Stripe keys need `STRIPE_ALLOW_LIVE_KEYS=true`; production needs
  `COOKIE_SECURE=true`; `MONGODB_URI` validated by pattern (multi-host allowed for networks that break `mongodb+srv`).
- D8 Swagger stays mounted at `/api/docs` in every environment: Milestone 1 is evaluated through Swagger UI (brief §13.1).

## Payments (ADR-003)
- D9 A booking is confirmed only by the signed `payment_intent.succeeded` webhook after re-reading the PaymentIntent; amount
  received, currency, stored amount and booking total must all match, else full refund. Late or superseded success → refund.
- D10 One PENDING payment per booking and one payment per PaymentIntent (unique indexes); retry cancels the old intent and keeps
  `stripeIdHistory`; a changed total opens a new intent.
- D11 Refund slot claimed in the DB before calling Stripe (one PENDING/REFUNDED refund per PaymentIntent); an ambiguous Stripe
  error keeps the claim and the webhook links it through `metadata.refundId`.
- D12 Dev-only `POST /api/payments/:id/test-confirm` (404 in production) confirms the intent with a test card; the webhook still
  confirms the booking.
- D13 Audit log is append-only (no update/delete paths, bulkWrite limited to insertOne). Audited actions: suspend/reactivate
  account, provider deactivate/reactivate, moderator create, admin password reset, report resolve, content hide/delete. (GEN-07)

## Process
- D14 Jira is the source of truth for ownership and sprints; `docs/requirements/jira-map.json` is its dated snapshot.
- D15 PRs into `develop`; Ahmed reviews and merges (CODEOWNERS, 1 approval, stale reviews dismissed). `develop → main` only at
  releases. PR conflicts: merge `develop` into the branch, no rebase + force-push.
- D16 AI_PROMPTS.txt conflicts: keep both entries in date order; never `merge=union`.
- D17 Local Jest on Windows runs `--runInBand`; CI (Linux) is unaffected.
- D18 2026-11-06: Claude setup reset to `CLAUDE.md` + `.claude/{rules,skills,agents,hooks}` + `docs/specs`; the earlier `.swarm/`
  orchestration, role-identity hooks and `plan.md` were retired (still in git history before this change).

## Open (Leader decisions needed)
- O1 `PAYABLE_BOOKING` is one token but flight and hotel bookings live in two modules. Before FLT-22/HTL-18: either a router in
  the payments module that injects `FLIGHT_PAYABLE` and `HOTEL_PAYABLE` tokens, or one bookings facade. Recommended: two tokens
  with the same interface plus a router; no change for payments callers.
- O2 GEN-08 per-entity image limits must count existing images: callers pass `max = limit - existingCount`, or the contract
  takes `{entityType, existingCount}`. Recommended: the latter, so the rule lives in one place.
- O3 Merge strategy: PRs #1-#21 were squashed, #22+ merge commits. Pick one (recommended: squash for feature PRs).
