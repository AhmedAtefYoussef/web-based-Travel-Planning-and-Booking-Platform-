# V1-A Payments verification (SHA 6efa26b, worktree .swarm/tmp/verify-sprint0)

Runs (logs under .swarm/tmp/v1-a/):
- L1 `npx jest src/modules/payments src/common/utils/money.spec.ts src/common/utils/dates.spec.ts src/config/env.schema.spec.ts --verbose` -> 5 suites, 94/94 pass (1-unit.log)
- L2 `npx jest --config test/jest-e2e.json test/payments.e2e-spec.ts test/platform-currency.e2e-spec.ts --verbose` -> 2 suites, 47/47 pass (2-e2e.log)
- L3 greps (card fields, rawBody, markConfirmed callers, Swagger summaries, CURRENCY_SERVICE consumers) (3-grep.log)
- L4 `node .github/scripts/repo-consistency.mjs` -> exit 0, env keys consistent (4-repo.log)

Abbrev: PS = backend/src/modules/payments/payments.service.ts, PC = .../payments.controller.ts, RS = .../refunds.service.ts, SC = .../schemas.ts, BP = .../booking-policies.service.ts,
E2E = backend/test/payments.e2e-spec.ts, PCE = backend/test/platform-currency.e2e-spec.ts, PSU = .../payments.service.spec.ts, RSU = .../refunds.service.spec.ts.
Note: PAYABLE_BOOKING, POLICIES_PROVIDER and NOTIFICATIONS_SERVICE are still the in-memory stubs (backend/src/common/stubs) at this SHA; tests go through the contracts.

| CHK | verdict | code | test | command -> result | asserts statement? |
|---|---|---|---|---|---|
| CHK-PAY-01-1 | PASS | PS:57-89, PS:307-322 | E2E:179 "creates a PaymentIntent for the accepted owner booking" | L2 -> pass | yes: 201 + paymentIntents.create args |
| CHK-PAY-01-2 | PASS | PS:57-89 | E2E:194 "works for hotel bookings too" | L2 -> pass | yes: 201, amountMinor |
| CHK-PAY-01-3 | PASS | PS:324-334 | E2E:179 (clientSecret any String); PSU:71 "creates an intent with booking total in USD" (clientSecret cs_1) | L1, L2 -> pass | yes |
| CHK-PAY-01-4 | PASS | PC:57-65 (bookingType, bookingId only); no card field in src | E2E:234 "400s on invalid body (bad enum, bad id, extra field)" | L3 grep cardNumber/cvc/card_number -> none; L2 -> pass | yes |
| CHK-PAY-01-5 | PASS | PS:78, PS:315 | E2E:179 (args.amount 31999) | L2 -> pass | yes |
| CHK-PAY-01-6 | PASS | PS:53-55, PS:316 | E2E:179 (usd); PCE:33 "uses EUR on the PaymentIntent, the payment and the refund" | L2 -> pass | yes |
| CHK-PAY-01-7 | PASS | PS:336-345 | E2E:224 "404s for a non-owner and 401s without auth" | L2 -> pass | yes (404) |
| CHK-PAY-01-8 | PASS | PS:363-366 | E2E:207 "409s when the booking is not PENDING_PAYMENT"; PSU:93 "409 on %s" (no create) | L1, L2 -> pass | yes |
| CHK-PAY-01-9 | PASS | PS:367-369 | E2E:212 "409s when the hold has expired (even if policies were accepted)" | L2 -> pass | yes, incl. no PI |
| CHK-PAY-01-10 | PASS | PS:64-66 | E2E:201 "409s until policies are accepted" | L2 -> pass | yes, incl. no PI |
| CHK-PAY-01-11 | PASS | PS:162-175 | E2E:347 "rejects a tampered body, wrong secret and missing signature with 400" | L2 -> pass | yes: 400 + markConfirmed not called |
| CHK-PAY-01-12 | PASS | backend/src/main.ts:9; backend/test/utils/test-app.ts:265, :54, :127 (real webhooks util) | E2E:347 (tampered raw body rejected) | L3 grep; L2 -> pass | yes |
| CHK-PAY-01-13 | PASS | PS:218-220 | PSU:323 "ignores succeeded when re-retrieved PI is not succeeded"; E2E:335 "does not confirm when the re-retrieved PI is not succeeded" | L1, L2 -> pass | yes |
| CHK-PAY-01-14 | PASS | PS:254-267 | E2E:307 "confirms the booking exactly once on payment_intent.succeeded" | L2 -> pass | yes: status CONFIRMED |
| CHK-PAY-01-15 | PASS | PS:235-252 | E2E:307; PSU:244 "succeeded confirms booking exactly once on duplicate events" | L1, L2 -> pass | yes: toHaveBeenCalledTimes(1) |
| CHK-PAY-01-16 | PASS | only caller PS:262 (onSucceeded) | E2E:463 "test-confirm confirms the PI but the booking waits for the webhook" | L3 grep markConfirmed( -> PS:262 only; L2 -> pass | yes |
| CHK-PAY-01-17 | PASS | PS:279-292 | E2E:382 "payment_failed marks the payment FAILED; booking stays pending; retry works until hold expiry" | L2 -> pass | yes |
| CHK-PAY-01-18 | PASS | PS:279-292 | E2E:382 | L2 -> pass | yes |
| CHK-PAY-01-19 | PASS | PS:91-128 | E2E:382 (retry 201 + clientSecret) | L2 -> pass | yes |
| CHK-PAY-01-20 | PASS | PS:100, PS:367 | E2E:382 (409 after expiry); PSU:206 "409 when hold expired" | L1, L2 -> pass | yes |
| CHK-PAY-01-21 | PASS | PS:109, PS:295-305 | PSU:176 "cancels the previous PI and records it in history" | L1 -> pass | yes: cancel(pi_old) |
| CHK-PAY-01-22 | PASS | PS:190-206 | E2E:446 "cancelForExpiredHold cancels the open PaymentIntent"; PSU:365 "cancels the open PI" | L1, L2 -> pass | yes |
| CHK-PAY-01-23 | PASS | PS:222-230, PS:270-276; RS:113-132 | PSU:264 "late success on expired booking refunds fully, no confirm", PSU:288, PSU:301 "superseded PI success is refunded, never confirmed"; RSU:137 (refunds.create) | L1 -> pass | yes (split over two units) |
| CHK-PAY-01-24 | PARTIAL | SC:11-31 | E2E:258 "GET /payments/:id is visible to owner and admin only, stores minimal fields" (response only) | L2 -> pass | no: no test on schema paths; schema also stores bookingType/bookingId/userId/stripeIdHistory (no card data) |
| CHK-PAY-01-25 | PASS | PS:130-148 | E2E:258 | L2 -> pass | yes (owner 200, other 403/404) |
| CHK-PAY-01-26 | PARTIAL | backend/src/config/env.schema.ts:70 pattern ^(sk or rk)_ accepts sk_live_; stripe.provider.ts default sk_test_not_configured; tests use sk_test_ placeholder | none | L3 -> no live-key guard | no: test mode is not enforced |
| CHK-PAY-01-27 | PASS | PC:123,136,167,180,197 | n/a (doc artifact) | grep summary "[PAY-01]" docs/api/openapi.json -> 5 | yes |
| CHK-PAY-02-1 | PASS | BP:31-38 | E2E:103 "returns airline policies to the owner (flight)" | L2 -> pass | yes: tiers |
| CHK-PAY-02-2 | PASS | BP:31-38 | E2E:103 | L2 -> pass | yes: extraBaggage + cabins freeBaggage |
| CHK-PAY-02-3 | PASS | BP:31-38 | E2E:115 "returns hotel policies with check-in/out times (hotel)" | L2 -> pass | yes |
| CHK-PAY-02-4 | PASS | BP:31-38 | E2E:115 | L2 -> pass | yes: HH:MM |
| CHK-PAY-02-5 | PASS | BP:64-73 | E2E:127 "404s for a non-owner and 401s without auth" | L2 -> pass | yes |
| CHK-PAY-02-6 | PASS | BP:40-62 (stored via PAYABLE_BOOKING.recordPolicyAcceptance; stub at this SHA) | E2E:144 "stores acceptance only when accepted === true" | L2 -> pass | yes (Date instance; not "close to now") |
| CHK-PAY-02-7 | PARTIAL | BP:53-60 | E2E:144 | L2 -> pass | no: asserts snapshot tiers length > 0, not equality with the policies shown |
| CHK-PAY-02-8 | PARTIAL | PC:111-113 (throws before svc.accept) | E2E:144 | L2 -> pass | no: asserts 400 but not that policiesAcceptedAt stays null between the rejected calls |
| CHK-PAY-02-9 | PASS | PS:64-66 | E2E:201 (409 before); E2E:179 (201 after accept) | L2 -> pass | yes |
| CHK-PAY-02-10 | PASS | PC:73, PC:93 | n/a | grep "[PAY-02]" openapi.json -> 2 | yes |
| CHK-PAY-03-1 | PASS | backend/src/common/contracts/tokens.ts:15; payments.module.ts:36,38; RS:63 | E2E:545 (app.get(REFUNDS_SERVICE).refundFor) | L2 -> pass | yes |
| CHK-PAY-03-2 | PARTIAL | RS:87-92 (view.policySnapshot.tiers) | none changes the live policy after acceptance | L1, L2 -> pass | no |
| CHK-PAY-03-3 | PASS | RS:44-61 | RSU:65 "picks highest daysBefore <= remaining"; E2E:497 "daysRemaining=%p -> %p%% (%p)"; E2E:579 "USER refund 10 days out uses the 50% tier" | L1, L2 -> pass | yes |
| CHK-PAY-03-4 | PASS | RS:51 | RSU:75 "boundary is inclusive"; E2E:497 (14, 7, 2) | L1, L2 -> pass | yes |
| CHK-PAY-03-5 | PASS | RS:55 | RSU:79 "no tier -> 0% and null tier"; E2E:497 (1, 0, -1) | L1, L2 -> pass | yes |
| CHK-PAY-03-6 | PASS | RS:84-85 | RSU:119 "PROVIDER refunds 100% regardless of tiers"; E2E:592 "PROVIDER refund is always 100%, even right before departure" | L1, L2 -> pass | yes |
| CHK-PAY-03-7 | PASS | backend/src/common/utils/dates.ts:100-109; RS:87 | dates.spec.ts:61 "uses today in the target zone, not UTC", :68 | L1 -> pass | yes |
| CHK-PAY-03-8 | PASS | RS:94 | RSU:127 "zero amount issues nothing"; E2E:585 "USER refund inside the last tier issues nothing and never calls Stripe" | L1, L2 -> pass | yes (no Stripe, no record, no notify) |
| CHK-PAY-03-9 | PASS | RS:159-171 | RSU:93 "USER refund uses tier, calls Stripe, records PENDING, notifies"; E2E:545 | L1, L2 -> pass | yes |
| CHK-PAY-03-10 | PASS | RS:180; money.ts percentOfMinor | E2E:505 "is order-independent and always yields integer minor units"; PCE:33 (EUR refund) | L2 -> pass | yes |
| CHK-PAY-03-11 | PASS | RS:81-82, RS:120 | RSU:188 "refundPayment refunds and records amount_received, not amountMinor"; RSU:213 "refundFor bases the refund on the captured amount of the PI" | L1 -> pass | yes |
| CHK-PAY-03-12 | PASS | RS:78-79, RS:118-119, RS:143-148 | RSU:237 "refundPayment returns the existing refund of the same PI without calling Stripe" | L1 -> pass | yes (refundPayment path; refundFor twice not directly tested) |
| CHK-PAY-03-13 | PASS | RS:182 | RSU:93; E2E:545 "USER refund 40 days out is 100% and creates a PENDING refund via Stripe" | L1, L2 -> pass | yes |
| CHK-PAY-03-14 | PASS | RS:195-207; PS:182-184 | E2E:599 "refund webhooks move the refund to REFUNDED or FAILED" | L2 -> pass | yes |
| CHK-PAY-03-15 | PASS | RS:198-199 | E2E:599 | L2 -> pass | yes |
| CHK-PAY-03-16 | PASS | RS:134-141, RS:210-224 (NOTIFICATIONS_SERVICE stub at this SHA) | E2E:545 (notifications.sent userId USER_ID); RSU:93 | L1, L2 -> pass | yes (contract call; delivery depends on the notifications module) |
| CHK-PAY-03-17 | PASS | PC:219-237 | E2E:545 | L2 -> pass | yes |
| CHK-PAY-03-18 | PASS | PC:225 | E2E:545 (asAdmin 200) | L2 -> pass | yes |
| CHK-PAY-03-19 | PASS | PC:225-227 | E2E:545 (other 403/404) | L2 -> pass | yes |
| CHK-PAY-03-20 | UNVERIFIABLE | no booking-details endpoint outside payments at this SHA | none | L3 grep refund in other modules -> none | booking details belong to the bookings module, not on develop |
| CHK-PAY-03-21 | PASS | PC:215 | n/a | grep "[PAY-03]" openapi.json -> 1 | yes |
| CHK-PAY-04-1 | PASS | backend/src/config/env.schema.ts:18, :68; PS:53-55 | env.schema.spec.ts:9 "applies defaults, including PLATFORM_CURRENCY=USD"; PCE:33 | L1, L2 -> pass | yes |
| CHK-PAY-04-2 | PASS | env.schema.ts:31-37, :85-103 | env.schema.spec.ts:56 "rejects an invalid ISO 4217 platform currency", :65 | L1 -> pass | yes (validateEnv throws; boot wiring by code reading) |
| CHK-PAY-04-3 | PASS | env.schema.ts:68 | env.schema.spec.ts:9, :18 | L1 -> pass | yes |
| CHK-PAY-04-4 | PASS | .github/scripts/repo-consistency.mjs:42-61 (EnvVars keys vs example file) | n/a | L4 -> exit 0 | yes |
| CHK-PAY-04-5 | PASS | PS:316 | see CHK-PAY-01-6; PSU:133 "uses EUR on the intent and the stored payment" | L1, L2 -> pass | yes |
| CHK-PAY-04-6 | PASS | PS:85 | E2E:295 "uses only the platform currency"; PCE:33; PSU:133 | L1, L2 -> pass | yes |
| CHK-PAY-04-7 | PASS | RS:180 | E2E:545 (USD); PCE:33 (EUR) | L2 -> pass | yes |
| CHK-PAY-04-8 | PARTIAL | SC:21, SC:47 (Prop number, no integer validator); PS:372 guards totals | money.spec.ts:39 | L1 -> pass | no: schemas do not enforce integers |
| CHK-PAY-04-9 | PASS | PS:372; money.ts isValidMinor | E2E:283 "rejects a booking total of %p minor units" (10.5, 0.1); money.spec.ts:44 "rejects %p" | L1, L2 -> pass | yes (e2e accepts 500 as a rejection status: weak) |
| CHK-PAY-04-10 | PASS | PS:372 | E2E:283 (-500); money.spec.ts:44 (-1) | L1, L2 -> pass | yes |
| CHK-PAY-04-11 | PASS | backend/src/common/utils/money.ts | money.spec.ts:29 "knows minor digits per currency", :54 "converts major to minor without float error" (JPY 1500 -> 1500) | L1 -> pass | yes |
| CHK-PAY-04-12 | PARTIAL | no CURRENCY_SERVICE consumer outside modules/currency | none | L3 grep -> none | grep only, no test |

Counts: PAY-01 25 PASS / 2 PARTIAL; PAY-02 8 PASS / 2 PARTIAL; PAY-03 19 PASS / 1 PARTIAL / 1 UNVERIFIABLE; PAY-04 10 PASS / 2 PARTIAL. FAIL 0.

Findings (by severity):
1. Medium CHK-PAY-01-26: env.schema.ts:70 accepts sk_live_ keys; "test mode only" is not enforced.
2. Medium CHK-PAY-03-20: refund status on booking details cannot be verified (no booking-details endpoint at 6efa26b).
3. Low CHK-PAY-03-2: no test proves refunds use the accepted snapshot when the live policy changes.
4. Low CHK-PAY-02-7 / 02-8: tests do not assert snapshot equality, or that a rejected accept leaves policiesAcceptedAt null.
5. Low CHK-PAY-04-8: Payment/Refund amountMinor have no schema integer validator.
6. Low CHK-PAY-01-24: no schema-paths test; schema stores linkage fields beyond the 4 named (no card data).
7. Low CHK-PAY-04-12: no-conversion is proved by grep only.
8. Info: E2E:289 allows status 500 as a rejection; GET /payments/:id gives 403 to non-owners where other endpoints give 404.
9. Info: policy acceptance storage and notifications go through in-memory stubs at this SHA; persistence and delivery depend on the owning modules.
