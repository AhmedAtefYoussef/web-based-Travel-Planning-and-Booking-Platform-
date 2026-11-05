# V2-3 security review — Sprint 0 surface (security-reviewer, opus, SHA 6efa26b)
Paths under backend/src/. Leader has NOT yet re-checked these; see report for confirmation status.

| # | Sev | file:line | Issue | Exploit scenario | Fix | Test that should fail first |
|---|---|---|---|---|---|---|
| S1 | Medium | config/env.schema.ts:48-50 | NODE_ENV defaults to development | Prod deploy without NODE_ENV runs as dev: test-confirm live, Stripe secrets optional, dev auth needs only the flag | No default / fail at boot when unset outside tests | env.schema.spec: missing NODE_ENV throws |
| S2 | Medium | payments/payments.service.ts:171 | Webhook secret falls back to '' outside production | Forge payment_intent.succeeded / refund.updated signed with empty key (dev/staging) | Fail closed when secret empty | handleWebhook with no secret rejects ''-signed event |
| S3 | Medium | payments/payments.service.ts:68-76 | Reused PENDING PI not checked against current totalMinor | Total changes after first create; user pays old amount; booking confirmed | Compare; cancel+recreate on mismatch | createForBooking after total change returns new amount |
| S4 | Medium | payments/payments.service.ts:219-262 | onSucceeded does not compare amount_received/currency to payment | Mismatch still confirms booking | Require equality else refund+log | succeeded with amount_received < amountMinor does not markConfirmed |
| S5 | Medium | payments/schemas.ts:17 | stripeId not unique; no partial unique PENDING-per-booking index | Concurrent POST /payments -> two docs share one PI | Unique stripeId + partial unique index | concurrent createForBooking leaves one doc |
| S6 | Medium | payments/refunds.service.ts:78,101,127 | Refund dedupe is read-then-create; different idempotency keys per path | refundFor + late-success refundPayment race -> duplicate local refunds/notifications | Unique partial index on paymentIntentId; one key per PI | parallel refundFor+refundPayment -> one refunds.create |
| S7 | Medium | common/swagger/setup-swagger.ts:46 | /api/docs mounted in production | Full API surface published in prod | Skip when NODE_ENV=production or flag | e2e: GET /api/docs 404 in production |
| S8 | Medium | modules/uploads/uploads.service.ts:100 | Size checked after full buffering; no multer limits in contract | Future route without limits -> memory exhaustion | Shared multer limits in uploads contract | 6 MB upload -> 413 before service |
| S9 | Low | config/env.schema.ts:69 | COOKIE_SECURE default false allowed in prod | Cookies over HTTP once ACC-11 lands | Force true in production | prod env COOKIE_SECURE=false throws |
| S10 | Low | payments/stripe.provider.ts:12 | Silent placeholder key | Misconfig surfaces as runtime 500s | Fail at boot outside test | boot test |
| S11 | Low | payments.service.ts:138 vs controller:225 | 403 vs 404 for others' payments | id probing | 404 for both | getForUser other id -> 404 |
| S12 | Low | payments/payments.service.ts:200 | cancelForExpiredHold uses raw cancel | throws on unexpected PI state, local status not updated | use cancelIntent | cancel on succeeded PI does not throw |
| S13 | Low | common/filters/all-exceptions.filter.ts:82,95 | 11000 leaks field names; validator messages may echo values | schema disclosure | generic messages | filter spec on 11000 |
| S14 | Low | whole tree | no helmet / rate limit / CORS policy | brute force once auth exists | helmet + throttler | n/a |

Passed: deny-by-default global guard; dev headers need DEV_AUTH_ENABLED===true AND NODE_ENV dev/test per request, flag forced false in prod (env.schema.ts:52-54); webhook raw body + signature required + PI re-read; late/superseded success refunded; refund <= amount_received, percent clamped; uploads magic bytes + UUID names + nosniff; 500s generic; test-confirm 404 in prod; no tracked secret files.
History scan (Leader): see v2-3-history.md.

ID: verify-v2-3  STATUS: done  CTX: v2
GOAL CHECK: all 8 areas covered at 6efa26b; no Critical/High
CHANGED: none
EVIDENCE: Read guard/env/filter/swagger/uploads/payments/refunds/schemas -> findings above; Glob secret-like files -> none tracked
NOTES: pass-with-notes; empty-secret forgery inferred from stripe-node behaviour, not tested.
