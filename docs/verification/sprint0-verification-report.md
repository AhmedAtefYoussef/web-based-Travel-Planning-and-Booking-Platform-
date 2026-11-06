# Sprint 0 verification report

| Field | Value |
|---|---|
| SHA | 6efa26b7590ab87ede4dcbe4b14bfd1f50ae9e34 (origin/develop, merge of PR #21) |
| Date | 2026-11-05 |
| Worktree | .swarm/tmp/verify-sprint0 (detached); mutation copy .swarm/tmp/mutate-sprint0 |
| Verifiers | V1-A..D: 4 opus verifiers; V2-1: opus blind adversarial; V2-2: mutation agent; V2-3: opus security-reviewer; V2-4: traceability audit; Leader resolutions |
| Evidence | .swarm/verify/*.md, .swarm/out/verify-*.md, logs .swarm/tmp/{gate,v1-*,v2-*}/ |

## 1. Gate, scope, evidence rules

### Gate (Leader, at 6efa26b)
- npm ci: OK
- npm run build: exit 0 (dist/main.js present)
- npm run lint: 0 errors / 9 warnings
- unit (npm test): 17 suites, 172/172 pass
- e2e (npm run test:e2e): 6 suites, 87/87 pass
- npm run openapi:export + git diff --exit-code: 0 (only an LF->CRLF status flag on docs/api/openapi.json)
- node .github/scripts/repo-consistency.mjs: OK (exit 0)
- Raw: .swarm/tmp/gate/summary.txt

### Scope (verbatim from .swarm/verify/scope.md)

### (a) xlsx / reqs.json rows owned by Ahmed
xlsx has NO owner column; owner exists only in reqs.json (10 rows, owner=ahmed):
PAY-01 Mandatory!A56 · PAY-02 !A57 · PAY-03 !A58 · ITN-18 !A69 · GEN-02 !A86 · GEN-05 !A89 · GEN-07 !A91 · GEN-08 !A92 · PAY-04 !A98 · GEN-13 !A100
Text drift xlsx vs reqs.json: 0 differences on 115 rows (see drift.md).

### (b) Jira (read-only, 2026-11-05, assignee = Ahmed, 34 issues)
Sprint "Sprint 0 - Foundation" (id 4, state ACTIVE, ended 2026-11-04):
TRVL-97 GEN-02 Done · TRVL-100 GEN-05 Done · TRVL-111 GEN-13 Done · TRVL-128 Atlas Done · TRVL-129 scaffold Done ·
TRVL-130 common Done · TRVL-131 auth stubs Done · TRVL-132 contracts Done · TRVL-134 traceability/ERD/ADRs Done
Ahmed's Done items in LATER sprints (included because the request lists them):
Sprint 1: TRVL-102 GEN-07 · TRVL-103 GEN-08 · TRVL-109 PAY-04 · TRVL-133 currency (ITN-18 rates)
Sprint 2: TRVL-67 PAY-01 · TRVL-68 PAY-02 · TRVL-69 PAY-03 · TRVL-135 README/Swagger/AI_PROMPTS
Hardening: TRVL-136 release (In Progress)
Epics: TRVL-1 Foundation (In Progress, no sprint) · TRVL-6 Payments (Done, no sprint)
Out of scope (Ahmed, To Do, later sprints): FLT-12 TRVL-37, FLT-22 TRVL-42, FLT-23 TRVL-43, HTL-16 TRVL-59, HTL-17 TRVL-60,
HTL-18 TRVL-61, GEN-11 TRVL-106, TRVL-144, TRVL-4 epic, M2 TRVL-11/116/145/146/160.

### Conflicts between sources (not resolved here)
C1 reqs.json owner covers 10 rows; Jira assigns Ahmed 7 more requirement rows (FLT-12/22/23, HTL-16/17/18, GEN-11) -> reqs.json owner field incomplete.
C2 Only GEN-02/05/13 of the 10 owned requirements are in the Sprint 0 sprint; 7 are Done in Sprint 1/2 which are still "future" sprints.
C3 Sprint 0 is still "active" after its end date (2026-11-04).
C4 Labels: TRVL-133/135/136/144 carry label "setup", not "sprint-0", though TRVL-133/135 are Done.
C5 GEN-07/08 stories have parent TRVL-10 (not Ahmed's epic); TRVL-133 parent TRVL-8.
C6 ITN-18: only the "rates" part is Ahmed's (TRVL-133); the itinerary budget part belongs to another owner (see plan.md scout).
C7 plan.md:943-969 lists PAY-01/PAY-03 work under the "## Abdelrahman" heading; Jira + reqs.json say Ahmed.
C8 plan.md Ahmed block (L861-979) has no FLT-12/22/23, HTL-16/17/18; ownership.md:10 (from Jira) has them. ownership.md:4 says Jira wins.
C9 ownership.md has no TRVL-128 row; context-engineering-spec.md:341 says TRVL-128 Ahmed-only.

### (c) plan.md / project-description.md (scout, .swarm/out/verify-v0-scope.md)
plan.md L861-979 Leader block covers: Atlas, scaffold, common layer (GEN-02/05/13), auth stubs, audit (GEN-07), uploads (GEN-08),
currency (ITN-18), PAYMENTS contract (PAY-04), policies (PAY-02), payments/webhook (PAY-01), refunds (PAY-03), release.
project-description: M1 scope L223-236, Atlas L430, AI_PROMPTS L551-574, deliverables L598-605.

### Final in-scope set (union)
PAY-01, PAY-02, PAY-03, PAY-04, GEN-02, GEN-05, GEN-07, GEN-08, GEN-13, ITN-18 (rates part), TRVL-128..136, epics TRVL-1/TRVL-6 (status roll-up only).

### Evidence rules
- (a) PASS needs code file:line plus a targeted, logged test run whose assertions match the statement (not only a green run).
- (b) A green test that does not assert the statement, or evidence from reading code / grep alone, is at most PARTIAL.
- (c) UNVERIFIABLE when the evidence cannot exist or cannot be reached at this SHA (module not merged, live Atlas/console, Jira, release not done). "FAIL (not due)" = deadline 2026-11-20 not reached; not a defect.
- Leader rulings in .swarm/verify/resolutions.md override V1 verdicts (marked "(Leader)" in the matrix).

## 2. Summary per requirement (after resolutions)

Verdict rule: PASS = all PASS; PASS WITH GAPS = only PARTIAL/UNVERIFIABLE (non-critical); FAIL = any FAIL that is not "not due"; TRVL-136 = IN PROGRESS.
Confidence: High = V2-1 agreed and mutants killed; Medium otherwise; Low = many UNVERIFIABLE.

| Requirement | Total | PASS | PARTIAL | FAIL | UNVERIFIABLE | Verdict | Confidence |
|---|---|---|---|---|---|---|---|
| PAY-01 | 27 | 25 | 2 | 0 | 0 | PASS WITH GAPS | Medium (V2-1 disagreed on -26; mutant 11b survived) |
| PAY-02 | 10 | 8 | 2 | 0 | 0 | PASS WITH GAPS | High (V2-1 agreed 10/10; no surviving mutant) |
| PAY-03 | 21 | 18 | 2 | 0 | 1 | PASS WITH GAPS | Medium (V2-1 disagreed on -12; mutant 5b survived) |
| PAY-04 | 12 | 10 | 2 | 0 | 0 | PASS WITH GAPS | High (V2-1 agreed 12/12; mutants 6, 7 killed) |
| GEN-02 | 12 | 11 | 1 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1 re-check) |
| GEN-05 | 10 | 9 | 1 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1; mutant 8 killed) |
| GEN-07 | 13 | 8 | 2 | 0 | 3 | PASS WITH GAPS | Medium (V2-1 disagreed on -2; mutant 9 killed only by timeout; 3 UNVERIFIABLE) |
| GEN-08 | 15 | 9 | 6 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1; mutant 10 killed) |
| GEN-13 | 10 | 9 | 1 | 0 | 0 | PASS WITH GAPS | High (V2-1 agreed on -5..-10; no surviving mutant) |
| ITN-18 | 12 | 10 | 2 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1; mutant 6 killed) |
| TRVL-128 | 9 | 4 | 1 | 0 | 4 | PASS WITH GAPS | Low (4 of 9 UNVERIFIABLE: live Atlas) |
| TRVL-129 | 11 | 11 | 0 | 0 | 0 | PASS | Medium (no V2-1) |
| TRVL-130 | 15 | 12 | 2 | 1 | 0 | FAIL | Medium (no V2-1) |
| TRVL-131 | 8 | 7 | 1 | 0 | 0 | PASS WITH GAPS | Medium (V2-1 disagreed on -5; mutant 11 killed) |
| TRVL-132 | 9 | 8 | 1 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1) |
| TRVL-133 | 6 | 5 | 1 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1) |
| TRVL-134 | 9 | 8 | 1 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1; V2-4 re-ran all 15 commands) |
| TRVL-135 | 12 | 10 | 2 | 0 | 0 | PASS WITH GAPS | Medium (no V2-1) |
| TRVL-136 | 8 | 0 | 2 | 1 (1 not due) | 5 | IN PROGRESS | Low (5 of 8 UNVERIFIABLE: release not done) |
| DLV | 14 | 6 | 3 | 4 (1 not due) | 1 | FAIL | Medium (no V2-1) |
| **Total** | **243** | **188** | **35** | **6 (2 not due)** | **14** | | |

Notes: TRVL-130 FAIL = CHK-TRVL-130-10 (F8). DLV FAIL = DLV-7 (single-author history, F18), DLV-8 (F18), DLV-13 (F11); DLV-1 is not due. TRVL-136-1 is not due.

## 3. Atomic matrix (243 checks)

Evidence prefix = V1 table ([A]..[D] = .swarm/verify/v1-a..d.md). Abbreviations from v1-a: PS payments.service.ts, PC payments.controller.ts, RS refunds.service.ts, SC payments/schemas.ts, BP booking-policies.service.ts (all backend/src/modules/payments/), E2E backend/test/payments.e2e-spec.ts, PCE backend/test/platform-currency.e2e-spec.ts, PSU payments.service.spec.ts, RSU refunds.service.spec.ts. Log keys (L1.., log NN) refer to .swarm/tmp/v1-<x>/. V2-1 column = blind re-verdict ("-" = not re-checked). Text after "--" = verifier note for non-PASS rows and the Leader ruling where one applies.

| CHK | statement | source | evidence (code file:line; test) | command -> result | verdict (final) | V2-1 |
|---|---|---|---|---|---|---|
| PAY-01-1 | POST /api/payments creates a Stripe PaymentIntent for the owner's Pending Payment flight booking. | M!A56; reqs:496; PD:L363 | [A] PS:57-89, PS:307-322; test: E2E:179 "creates a PaymentIntent for the accepted owner booking" | L2 -> pass | **PASS** | PASS |
| PAY-01-2 | POST /api/payments creates a PaymentIntent for the owner's Pending Payment hotel reservation. | M!A56; reqs:496 | [A] PS:57-89; test: E2E:194 "works for hotel bookings too" | L2 -> pass | **PASS** | PASS |
| PAY-01-3 | POST /api/payments response returns the PaymentIntent clientSecret. | reqs:496; PL:L944 | [A] PS:324-334; test: E2E:179 (clientSecret any String); PSU:71 "creates an intent with booking total in USD" (clientSecret cs_1) | L1, L2 -> pass | **PASS** | PASS |
| PAY-01-4 | No endpoint accepts card number/CVC fields; card data never reaches the backend. | M!A56; PL:L307 | [A] PC:57-65 (bookingType, bookingId only); no card field in src; test: E2E:234 "400s on invalid body (bad enum, bad id, extra field)" | L3 grep cardNumber/cvc/card_number -> none; L2 -> pass | **PASS** | PASS |
| PAY-01-5 | PaymentIntent amount equals the booking total in integer minor units. | reqs:496 | [A] PS:78, PS:315; test: E2E:179 (args.amount 31999) | L2 -> pass | **PASS** | PASS |
| PAY-01-6 | PaymentIntent currency equals PLATFORM_CURRENCY. | reqs:496; M!A98 | [A] PS:53-55, PS:316; test: E2E:179 (usd); PCE:33 "uses EUR on the PaymentIntent, the payment and the refund" | L2 -> pass | **PASS** | PASS |
| PAY-01-7 | Paying another user's booking is refused. | reqs:496; PL:L184 | [A] PS:336-345; test: E2E:224 "404s for a non-owner and 401s without auth" | L2 -> pass | **PASS** | PASS |
| PAY-01-8 | Paying a booking not in Pending Payment status is refused. | reqs:496 | [A] PS:363-366; test: E2E:207 "409s when the booking is not PENDING_PAYMENT"; PSU:93 "409 on %s" (no create) | L1, L2 -> pass | **PASS** | PASS |
| PAY-01-9 | Paying after the hold expired is refused. | M!A56; reqs:496; PL:L944 | [A] PS:367-369; test: E2E:212 "409s when the hold has expired (even if policies were accepted)" | L2 -> pass | **PASS** | PASS |
| PAY-01-10 | Paying before policies are accepted is refused (see CHK-PAY-02-9). | reqs:496; PL:L944 | [A] PS:64-66; test: E2E:201 "409s until policies are accepted" | L2 -> pass | **PASS** | PASS |
| PAY-01-11 | Webhook with an invalid Stripe signature is rejected and changes nothing. | reqs:496; BC:L26 | [A] PS:162-175; test: E2E:347 "rejects a tampered body, wrong secret and missing signature with 400" | L2 -> pass | **PASS** | PASS |
| PAY-01-12 | Webhook signature is verified against the raw request body (app created with rawBody:true). | BC:L26; PL:L310 | [A] backend/src/main.ts:9; backend/test/utils/test-app.ts:265, :54, :127 (real webhooks util); test: E2E:347 (tampered raw body rejected) | L3 grep; L2 -> pass | **PASS** | PASS |
| PAY-01-13 | On payment_intent.succeeded the backend re-retrieves the PI and confirms only if status is succeeded. | reqs:496 | [A] PS:218-220; test: PSU:323 "ignores succeeded when re-retrieved PI is not succeeded"; E2E:335 "does not confirm when the re-retrieved PI is not succeeded" | L1, L2 -> pass | **PASS** | PASS |
| PAY-01-14 | A verified payment_intent.succeeded confirms the booking via markConfirmed. | M!A56; reqs:496; PD:L175 | [A] PS:254-267; test: E2E:307 "confirms the booking exactly once on payment_intent.succeeded" | L2 -> pass | **PASS** | PASS |
| PAY-01-15 | Duplicate succeeded webhooks call markConfirmed exactly once (idempotent). | reqs:496; BC:L26 | [A] PS:235-252; test: E2E:307; PSU:244 "succeeded confirms booking exactly once on duplicate events" | L1, L2 -> pass | **PASS** | PASS |
| PAY-01-16 | The booking is never confirmed by POST /api/payments or the client, only by the verified webhook. | M!A56; PD:L370-371 | [A] only caller PS:262 (onSucceeded); test: E2E:463 "test-confirm confirms the PI but the booking waits for the webhook" | L3 grep markConfirmed( -> PS:262 only; L2 -> pass | **PASS** | PASS |
| PAY-01-17 | payment_intent.payment_failed marks the payment FAILED. | reqs:496; PL:L944 | [A] PS:279-292; test: E2E:382 "payment_failed marks the payment FAILED; booking stays pending; retry works until hold expiry" | L2 -> pass | **PASS** | PASS |
| PAY-01-18 | After payment_failed the booking stays Pending Payment. | M!A56; reqs:496; PD:L177 | [A] PS:279-292; test: E2E:382 | L2 -> pass | **PASS** | PASS |
| PAY-01-19 | POST /api/payments/:id/retry succeeds while the hold is unexpired. | M!A56; reqs:496; PD:L364 | [A] PS:91-128; test: E2E:382 (retry 201 + clientSecret) | L2 -> pass | **PASS** | PASS |
| PAY-01-20 | POST /api/payments/:id/retry is refused after the hold expires. | M!A56; reqs:496 | [A] PS:100, PS:367; test: E2E:382 (409 after expiry); PSU:206 "409 when hold expired" | L1, L2 -> pass | **PASS** | PASS |
| PAY-01-21 | Retry cancels the previous PaymentIntent. | BC:L28 | [A] PS:109, PS:295-305; test: PSU:176 "cancels the previous PI and records it in history" | L1 -> pass | **PASS** | PASS |
| PAY-01-22 | cancelForExpiredHold(paymentId) cancels the Stripe PaymentIntent. | M!A56; reqs:496; PL:L961 | [A] PS:190-206; test: E2E:446 "cancelForExpiredHold cancels the open PaymentIntent"; PSU:365 "cancels the open PI" | L1, L2 -> pass | **PASS** | PASS |
| PAY-01-23 | A late or superseded PI success triggers an automatic refund and never confirms the booking. | BC:L27 | [A] PS:222-230, PS:270-276; RS:113-132; test: PSU:264 "late success on expired booking refunds fully, no confirm", PSU:288, PSU:301 "superseded PI success is refunded, never confirmed"; RSU:137 (refunds.create) | L1 -> pass | **PASS** | PASS |
| PAY-01-24 | Payment record stores only Stripe id, amountMinor, currency and status (no card data). | M!A56; reqs:496; PL:L314 | [A] SC:11-31; test: E2E:258 "GET /payments/:id is visible to owner and admin only, stores minimal fields" (response only) | L2 -> pass -- no: no test on schema paths; schema also stores bookingType/bookingId/userId/stripeIdHistory (no card data) | **PARTIAL** | PARTIAL |
| PAY-01-25 | GET /api/payments/:id returns the payment to its owner. | PD:L365 | [A] PS:130-148; test: E2E:258 | L2 -> pass | **PASS** | PASS |
| PAY-01-26 | Stripe is used in test mode only. | M!A56; PD:L174 | [A] backend/src/config/env.schema.ts:70 pattern ^(sk or rk)_ accepts sk_live_; stripe.provider.ts default sk_test_not_configured; tests use sk_test_ placeholder | L3 -> no live-key guard -- no: test mode is not enforced -- Leader: env.schema.ts:70 accepts any sk_/rk_ prefix; no test. Statement "used in test mode only": deployed key not observable here (secret); only enforcement is missing | **PARTIAL (Leader)** | FAIL |
| PAY-01-27 | Swagger summaries of the 4 PAY-01 endpoints start with [PAY-01]. | CM:L27; BC:L30 | [A] PC:123,136,167,180,197; test: n/a (doc artifact) | grep summary "[PAY-01]" docs/api/openapi.json -> 5 | **PASS** | PASS |
| PAY-02-1 | GET /api/bookings/flight/:id/policies returns the airline cancellation tiers. | M!A57; reqs:507; PD:L361 | [A] BP:31-38; test: E2E:103 "returns airline policies to the owner (flight)" | L2 -> pass | **PASS** | PASS |
| PAY-02-2 | GET policies for a flight booking returns the airline baggage policy. | M!A57; reqs:507 | [A] BP:31-38; test: E2E:103 | L2 -> pass | **PASS** | PASS |
| PAY-02-3 | GET /api/bookings/hotel/:id/policies returns the hotel cancellation tiers. | M!A57; reqs:507 | [A] BP:31-38; test: E2E:115 "returns hotel policies with check-in/out times (hotel)" | L2 -> pass | **PASS** | PASS |
| PAY-02-4 | GET policies for a hotel booking returns check-in and check-out times. | M!A57; reqs:507 | [A] BP:31-38; test: E2E:115 | L2 -> pass | **PASS** | PASS |
| PAY-02-5 | Only the booking owner can read its policies. | reqs:507 | [A] BP:64-73; test: E2E:127 "404s for a non-owner and 401s without auth" | L2 -> pass | **PASS** | PASS |
| PAY-02-6 | POST .../accept-policies with accepted=true stores policiesAcceptedAt timestamp. | M!A57; reqs:507; PD:L362,L370 | [A] BP:40-62 (stored via PAYABLE_BOOKING.recordPolicyAcceptance; stub at this SHA); test: E2E:144 "stores acceptance only when accepted === true" | L2 -> pass | **PASS** | PASS |
| PAY-02-7 | Accepting policies stores a snapshot of the policies shown. | reqs:507; PL:L934 | [A] BP:53-60; test: E2E:144 | L2 -> pass -- no: asserts snapshot tiers length > 0, not equality with the policies shown | **PARTIAL** | PARTIAL |
| PAY-02-8 | accept-policies without accepted=true does not record acceptance. | M!A57 | [A] PC:111-113 (throws before svc.accept); test: E2E:144 | L2 -> pass -- no: asserts 400 but not that policiesAcceptedAt stays null between the rejected calls | **PARTIAL** | PARTIAL |
| PAY-02-9 | POST /api/payments returns 409/400 until policies are accepted. | M!A57; reqs:507 | [A] PS:64-66; test: E2E:201 (409 before); E2E:179 (201 after accept) | L2 -> pass | **PASS** | PASS |
| PAY-02-10 | Swagger summaries of both PAY-02 endpoints start with [PAY-02]. | CM:L27 | [A] PC:73, PC:93 | grep "[PAY-02]" openapi.json -> 2 | **PASS** | PASS |
| PAY-03-1 | RefundsService.refundFor(type,id,reason) exists and is exposed via REFUNDS_SERVICE token. | reqs:518; BC:L13 | [A] backend/src/common/contracts/tokens.ts:15; payments.module.ts:36,38; RS:63; test: E2E:545 (app.get(REFUNDS_SERVICE).refundFor) | L2 -> pass | **PASS** | PASS |
| PAY-03-2 | USER cancellations use the tiers from the booking's accepted policy snapshot, not current policy. | reqs:518 | [A] RS:87-92 (view.policySnapshot.tiers); test: none changes the live policy after acceptance | L1, L2 -> pass -- no | **PARTIAL** | PARTIAL |
| PAY-03-3 | USER refund % = tier with the highest daysBefore <= daysRemaining. | reqs:518; PL:L317-318 | [A] RS:44-61; test: RSU:65 "picks highest daysBefore <= remaining"; E2E:497 "daysRemaining=%p -> %p%% (%p)"; E2E:579 "USER refund 10 days out uses the 50% tier" | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-4 | Exact boundary: daysRemaining equal to a tier's daysBefore selects that tier. | reqs:518 | [A] RS:51; test: RSU:75 "boundary is inclusive"; E2E:497 (14, 7, 2) | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-5 | USER cancellation with no matching tier refunds 0%. | reqs:518; PL:L319 | [A] RS:55; test: RSU:79 "no tier -> 0% and null tier"; E2E:497 (1, 0, -1) | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-6 | PROVIDER-initiated cancellation refunds 100%. | M!A58; reqs:518; PL:L319 | [A] RS:84-85; test: RSU:119 "PROVIDER refunds 100% regardless of tiers"; E2E:592 "PROVIDER refund is always 100%, even right before departure" | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-7 | daysRemaining is the calendar-day difference in the provider's time zone. | ST:L17; BC:L23 | [A] backend/src/common/utils/dates.ts:100-109; RS:87; test: dates.spec.ts:61 "uses today in the target zone, not UTC", :68 | L1 -> pass | **PASS** | PASS |
| PAY-03-8 | A zero refund amount calls no Stripe API and creates no refund record. | M!A58; reqs:518 | [A] RS:94; test: RSU:127 "zero amount issues nothing"; E2E:585 "USER refund inside the last tier issues nothing and never calls Stripe" | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-9 | A positive refund amount calls the Stripe Refunds API. | M!A58; reqs:518 | [A] RS:159-171; test: RSU:93 "USER refund uses tier, calls Stripe, records PENDING, notifies"; E2E:545 | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-10 | Refund amount is integer minor units in PLATFORM_CURRENCY. | M!A98; reqs:890 | [A] RS:180; money.ts percentOfMinor; test: E2E:505 "is order-independent and always yields integer minor units"; PCE:33 (EUR refund) | L2 -> pass | **PASS** | PASS |
| PAY-03-11 | Refund amount is computed from the PaymentIntent amount_received. | BC:L28 | [A] RS:81-82, RS:120; test: RSU:188 "refundPayment refunds and records amount_received, not amountMinor"; RSU:213 "refundFor bases the refund on the captured amount of the PI" | L1 -> pass | **PASS** | PASS |
| PAY-03-12 | Refunds are deduplicated per PaymentIntent. | BC:L28 | [A] RS:78-79, RS:118-119, RS:143-148; test: RSU:237 "refundPayment returns the existing refund of the same PI without calling Stripe" | L1 -> pass -- yes (refundPayment path; refundFor twice not directly tested) -- Leader: grep refundFor in *.spec.ts for twice/again/dedup/existing -> 0 hits; only refundPayment dedupe tested (refunds.service.spec "returns the existing refund of the same PI") | **PARTIAL (Leader)** | PARTIAL |
| PAY-03-13 | A new refund is recorded with status PENDING. | M!A58; reqs:518 | [A] RS:182; test: RSU:93; E2E:545 "USER refund 40 days out is 100% and creates a PENDING refund via Stripe" | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-14 | Refund webhook success updates the refund to REFUNDED. | M!A58; reqs:518 | [A] RS:195-207; PS:182-184; test: E2E:599 "refund webhooks move the refund to REFUNDED or FAILED" | L2 -> pass | **PASS** | PASS |
| PAY-03-15 | Refund webhook failure updates the refund to FAILED. | M!A58; reqs:518 | [A] RS:198-199; test: E2E:599 | L2 -> pass | **PASS** | PASS |
| PAY-03-16 | The user receives an in-app notification for the refund. | M!A58; reqs:518 | [A] RS:134-141, RS:210-224 (NOTIFICATIONS_SERVICE stub at this SHA); test: E2E:545 (notifications.sent userId USER_ID); RSU:93 | L1, L2 -> pass | **PASS** | PASS |
| PAY-03-17 | GET /api/refunds/:id returns the refund status to the booking owner. | reqs:518; PD:L367 | [A] PC:219-237; test: E2E:545 | L2 -> pass | **PASS** | PASS |
| PAY-03-18 | GET /api/refunds/:id returns the refund status to an admin. | reqs:518 | [A] PC:225; test: E2E:545 (asAdmin 200) | L2 -> pass | **PASS** | PASS |
| PAY-03-19 | GET /api/refunds/:id refuses other users. | reqs:518 | [A] PC:225-227; test: E2E:545 (other 403/404) | L2 -> pass | **PASS** | PASS |
| PAY-03-20 | Refund status is shown on the booking details. | M!A58; PD:L179 | [A] no booking-details endpoint outside payments at this SHA | L3 grep refund in other modules -> none -- booking details belong to the bookings module, not on develop | **UNVERIFIABLE** | UNVERIFIABLE |
| PAY-03-21 | Swagger summary of GET /api/refunds/:id starts with [PAY-03]. | CM:L27 | [A] PC:215 | grep "[PAY-03]" openapi.json -> 1 | **PASS** | PASS |
| PAY-04-1 | PLATFORM_CURRENCY is read from the environment. | reqs:890; PL:L324 | [A] backend/src/config/env.schema.ts:18, :68; PS:53-55; test: env.schema.spec.ts:9 "applies defaults, including PLATFORM_CURRENCY=USD"; PCE:33 | L1, L2 -> pass | **PASS** | PASS |
| PAY-04-2 | PLATFORM_CURRENCY is validated as an ISO currency code; an invalid value fails startup. | reqs:890; BC:L4 | [A] env.schema.ts:31-37, :85-103; test: env.schema.spec.ts:56 "rejects an invalid ISO 4217 platform currency", :65 | L1 -> pass | **PASS** | PASS |
| PAY-04-3 | PLATFORM_CURRENCY defaults to USD. | CM:L19; ST:L14 | [A] env.schema.ts:68; test: env.schema.spec.ts:9, :18 | L1 -> pass | **PASS** | PASS |
| PAY-04-4 | PLATFORM_CURRENCY is listed in /.env.example. | BC:L4; PD:L436-437 | [A] .github/scripts/repo-consistency.mjs:42-61 (EnvVars keys vs example file) | L4 -> exit 0 | **PASS** | PASS |
| PAY-04-5 | PaymentIntents use only PLATFORM_CURRENCY. | M!A98; reqs:890 | [A] PS:316; test: see CHK-PAY-01-6; PSU:133 "uses EUR on the intent and the stored payment" | L1, L2 -> pass | **PASS** | PASS |
| PAY-04-6 | Payment records store currency = PLATFORM_CURRENCY. | M!A98; reqs:890 | [A] PS:85; test: E2E:295 "uses only the platform currency"; PCE:33; PSU:133 | L1, L2 -> pass | **PASS** | PASS |
| PAY-04-7 | Refund records store currency = PLATFORM_CURRENCY. | M!A98; reqs:890 | [A] RS:180; test: E2E:545 (USD); PCE:33 (EUR) | L2 -> pass | **PASS** | PASS |
| PAY-04-8 | All money amounts are stored as integer minor units. | reqs:890; CM:L19 | [A] SC:21, SC:47 (Prop number, no integer validator); PS:372 guards totals; test: money.spec.ts:39 | L1 -> pass -- no: schemas do not enforce integers | **PARTIAL** | PARTIAL |
| PAY-04-9 | Non-integer money amounts are rejected. | reqs:890 | [A] PS:372; money.ts isValidMinor; test: E2E:283 "rejects a booking total of %p minor units" (10.5, 0.1); money.spec.ts:44 "rejects %p" | L1, L2 -> pass | **PASS** | PASS |
| PAY-04-10 | Negative money amounts are rejected. | reqs:890 | [A] PS:372; test: E2E:283 (-500); money.spec.ts:44 (-1) | L1, L2 -> pass | **PASS** | PASS |
| PAY-04-11 | Minor-unit conversion uses the per-currency exponent from common/utils/money.ts. | CM:L19; BC:L23 | [A] backend/src/common/utils/money.ts; test: money.spec.ts:29 "knows minor digits per currency", :54 "converts major to minor without float error" (JPY 1500 -> 1500) | L1 -> pass | **PASS** | PASS |
| PAY-04-12 | Flight and hotel booking prices are not converted to other currencies. | M!A69; M!A98 | [A] no CURRENCY_SERVICE consumer outside modules/currency | L3 grep -> none -- grep only, no test | **PARTIAL** | PARTIAL |
| GEN-02-1 | Any DTO validation failure returns HTTP 400. | reqs:774 | [B] backend/src/common/pipes/validation.pipe.ts:32-36; test: test/foundation.e2e-spec.ts "returns the standard error body with fieldErrors for a DTO failure" | log 11 -> pass | **PASS** | - |
| GEN-02-2 | Error body contains statusCode. | reqs:774; CM:L21; PL:L182 | [B] backend/src/common/filters/all-exceptions.filter.ts:51-52; test: same | log 11 -> pass | **PASS** | - |
| GEN-02-3 | Error body contains error. | reqs:774; CM:L21 | [B] all-exceptions.filter.ts:53; test: same | log 11 -> pass | **PASS** | - |
| GEN-02-4 | Error body contains message. | reqs:774; CM:L21 | [B] all-exceptions.filter.ts:54; test: same | log 11 -> pass | **PASS** | - |
| GEN-02-5 | Validation errors include fieldErrors as an array of {field,message}. | M!A86; reqs:774; PL:L183 | [B] validation.pipe.ts:10-25; test: same | log 11 -> pass | **PASS** | - |
| GEN-02-6 | Error body contains path equal to the request path. | reqs:774; CM:L21 | [B] all-exceptions.filter.ts:57; test: same + "unknown routes use the same error body shape" (path === /api/no-such-route) | log 11 -> pass | **PASS** | - |
| GEN-02-7 | Error body contains an ISO timestamp. | reqs:774; CM:L21 | [B] all-exceptions.filter.ts:58; test: same | log 11 -> pass | **PASS** | - |
| GEN-02-8 | Nested field errors use dotted paths. | reqs:774 | [B] validation.pipe.ts:16; test: src/common/pipes/validation.pipe.spec.ts "reports dotted-path fieldErrors for nested properties" | log 02 -> pass | **PASS** | - |
| GEN-02-9 | Non-validation errors use the same shape without fieldErrors. | CM:L21; PL:L178 | [B] all-exceptions.filter.ts:56; test: filter spec "shapes HttpExceptions" (all keys, fieldErrors undefined) + e2e "unknown routes use the same error body shape" | logs 01, 11 -> pass | **PASS** | - |
| GEN-02-10 | Duplicate key errors map to 409. | PL:L184 | [B] all-exceptions.filter.ts:33-39,77-85; test: filter spec "maps a Mongo duplicate key error to 409" | log 01 -> pass | **PASS** | - |
| GEN-02-11 | A malformed ObjectId returns 400. | PL:L184 | [B] backend/src/common/pipes/parse-object-id.pipe.ts; test: foundation e2e "400s on a malformed ObjectId path param"; setup-app spec "400 on bad ObjectId, 200 on good one" | logs 11, 04 -> pass | **PASS** | - |
| GEN-02-12 | Unhandled exceptions return 500 in the same shape. | PL:L178 | [B] all-exceptions.filter.ts:99-103; test: filter spec "hides internals of unknown errors as 500" | log 01 -> pass -- partly: asserts 500 + message, not the full key set | **PARTIAL** | - |
| GEN-05-1 | List endpoints accept ?page=N. | reqs:803; CM:L21 | [B] backend/src/common/dto/pagination.dto.ts:8-12; test: audit e2e "is paginated newest-first" (page=2 -> body.page 2) | log 12 -> pass | **PASS** | - |
| GEN-05-2 | page defaults to 1 when omitted. | reqs:803 | [B] pagination.dto.ts:12; test: foundation e2e "returns the envelope with fixed limit 10" (page 1) | log 11 -> pass | **PASS** | - |
| GEN-05-3 | page below 1 is rejected with 400. | reqs:803 | [B] pagination.dto.ts:11; test: foundation e2e "rejects page=N with 400" (0, -1) | log 11 -> pass | **PASS** | - |
| GEN-05-4 | A non-integer page is rejected with 400. | reqs:803 | [B] pagination.dto.ts:10; test: same (1.5, x) | log 11 -> pass | **PASS** | - |
| GEN-05-5 | Page size is fixed at 10 items. | M!A89; reqs:803; CM:L21 | [B] pagination.dto.ts:4; test: audit e2e "is paginated newest-first" (13 rows: 10 then 3) | log 12 -> pass | **PASS** | - |
| GEN-05-6 | A limit parameter other than 10 returns 400. | ST:L19 | [B] pagination.dto.ts:15-18; test: foundation e2e "ignores attempts to change page size" (limit=50 -> 400) | log 11 -> pass | **PASS** | - |
| GEN-05-7 | Response envelope has items, page, limit, total, totalPages. | reqs:803; PL:L195-196 | [B] pagination.dto.ts:34-46; test: foundation e2e "returns the envelope with fixed limit 10" (toEqual 5 keys) | log 11 -> pass | **PASS** | - |
| GEN-05-8 | Response limit is always 10. | reqs:803 | [B] pagination.dto.ts:18; test: same + audit e2e limit 10 | logs 11, 12 -> pass | **PASS** | - |
| GEN-05-9 | totalPages equals ceil(total/10). | reqs:803 | [B] pagination.dto.ts:45; test: audit e2e (total 13 -> totalPages 2); pagination unit "builds the envelope" (25 -> 3) | logs 12, 03 -> pass | **PASS** | - |
| GEN-05-10 | Every list endpoint uses the shared PaginationQueryDto. | reqs:803; PL:L192-193 | [B] backend/src/modules/audit/audit-query.dto.ts:5 uses it; backend/src/modules/currency/currency.controller.ts:20-23 GET /api/currencies returns {items} without PaginationQueryDto; test: grep only | grep -> 1 of 2 list endpoints -- no test; currencies list (7 fixed items, currency.service.ts:18-26) misses the checklist wording; meets xlsx M!A89 (lists longer than 10 rows) | **PARTIAL** | - |
| GEN-13-1 | Global ValidationPipe is registered with whitelist:true. | reqs:910; BC:L5 | [B] backend/src/bootstrap/setup-app.ts:10; validation.pipe.ts:28-31; test: foundation e2e "rejects unknown fields (whitelist + forbidNonWhitelisted)" | log 11 -> pass | **PASS** | - |
| GEN-13-2 | Unknown body fields are rejected with 400 (forbidNonWhitelisted). | reqs:910 | [B] validation.pipe.ts:30; test: same; setup-app spec "returns the standard error shape with fieldErrors" | logs 11, 04 -> pass | **PASS** | - |
| GEN-13-3 | Sending role in a body is rejected with 400 (no mass assignment). | reqs:910; PL:L176 | [B] validation.pipe.ts:30; test: foundation e2e "rejects unknown fields..." (role ADMIN -> 400, fieldErrors has role) | log 11 -> pass | **PASS** | - |
| GEN-13-4 | ValidationPipe transform is enabled (query strings become typed values). | reqs:910 | [B] validation.pipe.ts:31; test: audit e2e (page=2 -> body.page toBe(2) number); pagination unit "coerces page from a query string" | logs 12, 03 -> pass | **PASS** | - |
| GEN-13-5 | Routes require authentication by default (deny-by-default guard). | reqs:910 | [B] backend/src/common/guards/dev-auth.guard.ts:43-46; backend/src/app.module.ts:36; test: foundation e2e "401 for protected routes without dev headers" | log 11 -> pass | **PASS** | PASS |
| GEN-13-6 | Routes marked @Public are reachable without authentication. | reqs:910 | [B] dev-auth.guard.ts:38-40; test: foundation e2e "@Public routes are open" (/api/currencies 200) | log 11 -> pass | **PASS** | PASS |
| GEN-13-7 | Authorisation is enforced server-side: wrong role gets 403. | M!A100 | [B] dev-auth.guard.ts:49-55; test: foundation e2e "enforces roles"; audit e2e "is admin only" | logs 11, 12 -> pass | **PASS** | PASS |
| GEN-13-8 | Passwords are hashed with salted bcrypt. | M!A100; reqs:910; PL:L228 | [B] backend/src/common/security/password-hasher.ts:4-10; test: password-hasher.spec "hashes to something other than the plain text" (bcrypt 2a/2b/2y prefix) | log 08 -> pass | **PASS** | PASS |
| GEN-13-9 | Hashing the same password twice yields different hashes (salt). | M!A100 | [B] password-hasher.ts:9; test: password-hasher.spec "salts: same input hashes differently" + "verifies correct and rejects wrong passwords" | log 08 -> pass | **PASS** | PASS |
| GEN-13-10 | Plaintext passwords are never stored. | M!A100; reqs:910 | [B] password-hasher.ts; test: password-hasher.spec (hash not equal plaintext) | log 08 -> pass -- partly: no account schema exists yet at 6efa26b (no auth/accounts module), so never-stored cannot be shown | **PARTIAL** | PARTIAL |
| TRVL-129-1 | backend/ is a Nest CLI project. | JIRA; PL:L865 | [B] backend/nest-cli.json, backend/package.json | ls-files -> both tracked | **PASS** | - |
| TRVL-129-2 | frontend/ exists as an M2 placeholder. | PL:L865; PD:L470 | [B] frontend/README.md, frontend/CLAUDE.md | ls-files frontend -> 2 files | **PASS** | - |
| TRVL-129-3 | docs/requirements/ exists. | PL:L865 | [B] docs/requirements/ | ls -> reqs.json, plan.md, traceability.md | **PASS** | - |
| TRVL-129-4 | docs/api/ exists. | PL:L865 | [B] docs/api/openapi.json | ls -> openapi.json, swagger-demo.md | **PASS** | - |
| TRVL-129-5 | AI_PROMPTS.txt exists at repo root. | PL:L865; PD:L549 | [B] AI_PROMPTS.txt | ls-files -> tracked | **PASS** | - |
| TRVL-129-6 | README.md exists at repo root. | PL:L865 | [B] README.md | ls-files -> tracked | **PASS** | - |
| TRVL-129-7 | .env.example exists at repo root. | PL:L865; PD:L437 | [B] repo-root example env file | ls -a root -> present | **PASS** | - |
| TRVL-129-8 | .gitignore ignores .env files. | PD:L436 | [B] root ignore file lines 4-6 (ignores the secrets file and variants, un-ignores the example) | Grep of the ignore file -> lines 4-6; check-ignore blocked by guard hook | **PASS** | - |
| TRVL-129-9 | Long-lived branches main and develop exist on origin. | PD:L481-483; PL:L883 | [B] - | ls-remote --heads origin main develop -> both present (develop 6efa26b, main 019e6bc) | **PASS** | - |
| TRVL-129-10 | main is protected requiring a PR with 1 approval. | JIRA; PL:L883 | [B] - | gh api .../branches/main/protection -> required_approving_review_count 1, dismiss_stale true, checks [build-lint-test, pr-requirements], enforce_admins false | **PASS** | - |
| TRVL-129-11 | develop is protected requiring a PR with 1 approval. | JIRA; PL:L883 | [B] - | gh api .../branches/develop/protection -> same as main | **PASS** | - |
| TRVL-130-1 | Environment config is validated at startup and fails fast on a missing variable. | PL:L888; BC:L4 | [B] backend/src/config/env.schema.ts; app.module.ts:17-21 (validate: validateEnv); test: src/config/env.schema.spec.ts "fails fast listing every missing required variable" | log 06 -> pass | **PASS** | - |
| TRVL-130-2 | All routes are served under the /api prefix. | PL:L888 | [B] backend/src/main.ts:6,10; test: e2e routes all under /api | log 11 -> pass -- partly: e2e harness sets the prefix itself (backend/test/utils/test-app.ts:266), so main.ts:10 is not exercised by any test | **PARTIAL** | - |
| TRVL-130-3 | Global ValidationPipe is applied (see GEN-13). | PL:L888 | [B] see GEN-13-1..4 | logs 11, 12 | **PASS** | - |
| TRVL-130-4 | Global AllExceptionsFilter emits fieldErrors (see GEN-02). | PL:L888 | [B] see GEN-02-* | logs 01, 11 | **PASS** | - |
| TRVL-130-5 | Pagination with page size 10 is provided as a shared DTO (see GEN-05). | PL:L888 | [B] see GEN-05-1..9 | logs 03, 11, 12 | **PASS** | - |
| TRVL-130-6 | ParseObjectIdPipe rejects malformed ids with 400. | PL:L888 | [B] parse-object-id.pipe.ts; test: parse-object-id.pipe.spec "rejects ... with 400" | log 07 -> 5/5 | **PASS** | - |
| TRVL-130-7 | Money utilities exist in common/utils/money.ts (see PAY-04). | PL:L888; CM:L19 | [B] backend/src/common/utils/money.ts; test: backend/src/common/utils/money.spec.ts | log 10 -> 23/23 | **PASS** | - |
| TRVL-130-8 | Date utilities exist and store times in UTC. | PL:L888; BC:L23 | [B] backend/src/common/utils/dates.ts; test: dates.spec.ts (12/12) | log 09 -> pass -- partly: utilities exist and tz/calendar maths tested; UTC storage not asserted anywhere | **PARTIAL** | - |
| TRVL-130-9 | Swagger UI is served by the app. | PL:L894; PD:L236 | [B] backend/src/common/swagger/setup-swagger.ts:46-49; test: foundation e2e "serves the UI and the JSON document"; setup-app spec "serves swagger json and UI" | logs 11, 04 -> pass | **PASS** | - |
| TRVL-130-10 | Swagger declares cookie authentication. | PL:L894 | [B] setup-swagger.ts:32 (addBearerAuth only) | node read docs/api/openapi.json securitySchemes -> bearer + 3 dev-header apiKeys; no apiKey with in=cookie -- statement not met -- Leader: setup-swagger.ts:32 addBearerAuth only; openapi securitySchemes = bearer + 3 dev headers; plan.md:888-894 "Swagger with cookie auth" | **FAIL (Leader)** | - |
| TRVL-130-11 | ESLint and Prettier are configured and lint passes. | PL:L894 | [B] backend eslint flat config | npm run lint -> exit 0, 0 errors, 9 warnings (log 14) | **PASS** | - |
| TRVL-130-12 | A pull-request template exists. | PL:L894 | [B] .github/pull_request_template.md | ls-files -> tracked | **PASS** | - |
| TRVL-130-13 | Build succeeds and produces dist/main.js. | BC:L9 | [B] backend/dist/main.js exists (Nov 5 22:57) | not rebuilt: shared worktree, other verifiers running; Leader gate reports build OK -- n/a -- Leader: Leader gate: build exit 0, dist/main.js present; openapi:export + git diff --exit-code = 0 | **PASS (Leader)** | - |
| TRVL-130-14 | docs/api/openapi.json is in sync with the code. | CM:L27; BC:L31 | [B] - | npm run openapi:export rewrites a tracked file (forbidden here); Leader gate reports no drift -- n/a -- Leader: Leader gate: build exit 0, dist/main.js present; openapi:export + git diff --exit-code = 0 | **PASS (Leader)** | - |
| TRVL-130-15 | Every Swagger operation summary starts with [ID]. | CM:L27; BC:L30 | [B] docs/api/openapi.json | node script over all paths -> 12 operations, 0 summaries failing the [ID] prefix regex | **PASS** | - |
| TRVL-131-1 | @Public decorator exists and exempts a route from authentication. | JIRA; PL:L895 | [B] backend/src/common/decorators/public.decorator.ts:3-6; test: foundation e2e "@Public routes are open"; guard spec "allows @Public routes without a user" | logs 11, 05 -> pass | **PASS** | PASS |
| TRVL-131-2 | @Roles decorator restricts a route to listed roles (others 403). | JIRA; PL:L895 | [B] backend/src/common/decorators/roles.decorator.ts:7; test: foundation e2e "enforces roles" (USER 403, ADMIN 200); guard spec "enforces @Roles" | logs 11, 05 -> pass | **PASS** | PASS |
| TRVL-131-3 | @CurrentUser injects the authenticated user into handlers. | JIRA; PL:L895 | [B] backend/src/common/decorators/current-user.decorator.ts:13-18; used at backend/src/modules/payments/payments.controller.ts:85; test: payments e2e "returns airline policies to the owner (flight)" vs "404s for a non-owner and 401s without auth" | log 13 -> pass | **PASS** | PASS |
| TRVL-131-4 | Temporary DevAuthGuard reads x-dev-user-id, x-dev-role and x-dev-provider headers. | BC:L19 | [B] dev-auth.guard.ts:15-17,59-81; test: guard spec "attaches the dev user from headers" (id, role, assignedProvider) | log 05 -> pass | **PASS** | PASS |
| TRVL-131-5 | Dev headers work only with DEV_AUTH_ENABLED=true and NODE_ENV development or test. | BC:L19 | [B] dev-auth.guard.ts:61-67; test: guard spec "ignores dev headers unless DEV_AUTH_ENABLED is true" | log 05 -> pass -- partly: asserts toThrow() (not 401); NODE_ENV allow-list only tested for production -- Leader: rerun dev-auth.guard.spec -t "dev headers" -> 2/2 pass (.swarm/tmp/leader/131-5.log); flag-off asserts generic toThrow (L74-78); only "production" tested, not other NODE_ENV values | **PARTIAL (Leader)** | PASS |
| TRVL-131-6 | Dev headers are refused in production. | BC:L20 | [B] dev-auth.guard.ts:64; test: guard spec "ignores dev headers in production" (UnauthorizedException) | log 05 -> pass | **PASS** | PASS |
| TRVL-131-7 | Non-public route without dev headers returns 401. | BC:L19; reqs:910 | [B] dev-auth.guard.ts:44-46; test: foundation e2e "401 for protected routes without dev headers" | log 11 -> pass | **PASS** | PASS |
| TRVL-131-8 | Swagger "Authorize" exposes the dev headers. | BC:L19 | [B] setup-swagger.ts:36-43 | node read openapi.json securitySchemes -> x-dev-user-id, x-dev-role, x-dev-provider apiKeys | **PASS** | PASS |
| TRVL-132-1 | common/contracts defines the PAYABLE_BOOKING token and PayableBooking interface. | JIRA; PL:L928-931; BC:L12 | [B] backend/src/common/contracts/tokens.ts:11; booking.contract.ts:41; test: foundation e2e resolves app.get(PAYABLE_BOOKING) | grep + log 11 -> pass | **PASS** | - |
| TRVL-132-2 | common/contracts defines POLICIES_PROVIDER. | BC:L12 | [B] tokens.ts:12 | grep | **PASS** | - |
| TRVL-132-3 | common/contracts defines NOTIFICATIONS_SERVICE. | BC:L12 | [B] tokens.ts:13 | grep | **PASS** | - |
| TRVL-132-4 | common/contracts defines PAYMENTS_SERVICE and REFUNDS_SERVICE. | BC:L13 | [B] tokens.ts:14-15 | grep | **PASS** | - |
| TRVL-132-5 | common/contracts defines CURRENCY_SERVICE. | BC:L13 | [B] tokens.ts:16 | grep | **PASS** | - |
| TRVL-132-6 | common/contracts defines AUDIT_SERVICE and UPLOADS_SERVICE. | BC:L13 | [B] tokens.ts:17-18 | grep | **PASS** | - |
| TRVL-132-7 | ContractStubsModule provides a stub for every not-yet-implemented token. | BC:L6,L14 | [B] backend/src/common/stubs/contract-stubs.module.ts:18-26 (stubs for PAYABLE_BOOKING, POLICIES_PROVIDER, NOTIFICATIONS_SERVICE; other 5 tokens are real); test: no unit test builds ContractStubsModule and resolves each token | e2e boots AppModule (log 11), indirect only -- partly | **PARTIAL** | - |
| TRVL-132-8 | Real services replace stubs via { provide: TOKEN, useExisting }. | BC:L14 | [B] modules/audit/audit.module.ts:18; currency.module.ts:19; payments.module.ts:35-36; uploads.module.ts:11 | grep useExisting -> 5 bindings | **PASS** | - |
| TRVL-132-9 | No module imports another module's files. | CM:L20 | [B] backend/src/modules/** | grep of relative imports in modules -> only common/** targets; no cross-module imports | **PASS** | - |
| GEN-07-1 | AuditService.record accepts actorId, action, targetType, targetId and metadata. | reqs:823; PL:L903 | [C] backend/src/modules/audit/audit.service.ts:23-31; test: audit.service.spec.ts "records an entry with a null actor for system actions" | L1 -> pass -- Only with metadata undefined; no test asserts a metadata value is persisted/returned (e2e records metadata {i} but never asserts it) | **PARTIAL** | PARTIAL |
| GEN-07-2 | Audit entries are append-only (no update or delete path). | reqs:823 | [C] audit-log.schema.ts:148-166; audit.service.ts:16; audit.controller.ts GET only; test: audit-log.schema.spec.ts "%s is rejected", "re-saving an existing entry is rejected"; audit.service.spec.ts "exposes no update or delete API"; e2e "exposes no way to modify or delete entries" | L1, L2 -> pass -- yes -- Leader: audit-log.schema.ts:33-42 BLOCKED list lacks bulkWrite (and insertMany is fine); V2-1 probe: Model.bulkWrite updates bypass hooks | **PARTIAL (Leader)** | PARTIAL |
| GEN-07-3 | Admin suspensions are recorded in the audit log. | M!A91; ST:L18 | [C] no AUDIT_SERVICE caller outside the audit module | n/a -- ACC-15 suspension not on develop | **UNVERIFIABLE** | - |
| GEN-07-4 | Admin deletions are recorded in the audit log. | M!A91; ST:L18 | [C] none | n/a -- GEN-10 deletion not on develop | **UNVERIFIABLE** | - |
| GEN-07-5 | Other A6 admin actions (reactivate, moderator create, password reset, report resolve, provider deactivate) are recorded. | ST:L18 | [C] grep AUDIT_SERVICE: only common/contracts/tokens.ts:17, audit.module.ts:3,18,20 | n/a -- A6 owning modules not on develop; zero callers today | **UNVERIFIABLE** | - |
| GEN-07-6 | GET /api/admin/audit-logs is available to admins. | reqs:823; PD:L295 | [C] audit.controller.ts:71-89; test: e2e "is admin only" | L2 -> pass | **PASS** | PASS |
| GEN-07-7 | GET /api/admin/audit-logs returns 403 for non-admins. | reqs:823 | [C] audit.controller.ts:72; test: e2e "is admin only" (USER, HOTEL_MOD -> 403; anon 401); audit.controller.spec.ts "rejects non-admin users with 403" | L1, L2 -> pass | **PASS** | PASS |
| GEN-07-8 | Audit log list is paginated (GEN-05 envelope). | reqs:823 | [C] audit.service.ts:43-53; common/dto/pagination.dto.ts:7-46; test: e2e "is paginated newest-first" | L2 -> pass | **PASS** | - |
| GEN-07-9 | Audit log list is ordered newest-first. | reqs:823 | [C] audit.service.ts:46; test: e2e "is paginated newest-first" | L2 -> pass | **PASS** | - |
| GEN-07-10 | Audit log list filters by actor. | reqs:823; PL:L903 | [C] audit.service.ts:35; audit-query.dto.ts:6-9; test: e2e "filters by actor and by action" | L2 -> pass | **PASS** | - |
| GEN-07-11 | Audit log list filters by action. | reqs:823 | [C] audit.service.ts:36; test: e2e "filters by actor and by action" | L2 -> pass | **PASS** | - |
| GEN-07-12 | Audit log list filters by date range. | reqs:823 | [C] audit.service.ts:37-42; test: e2e "filters by date range"; audit.service.spec.ts "filters by actor, action and date range" | L1, L2 -> pass | **PASS** | - |
| GEN-07-13 | Swagger summary of the audit-log endpoint starts with [GEN-07]. | CM:L27 | [C] audit.controller.ts:76; docs/api/openapi.json:76; test: grep | grep -> "[GEN-07] List audit logs" | **PASS** | - |
| GEN-08-1 | JPG uploads are accepted. | M!A92; reqs:834 | [C] uploads.service.ts:31-37,98-120; test: uploads.service.spec.ts "accepts PNG and JPG and stores them under UPLOAD_DIR"; e2e "accepts a JPG and exactly 5 MB" | L1, L2 -> pass | **PASS** | - |
| GEN-08-2 | PNG uploads are accepted. | M!A92; reqs:834 | [C] uploads.service.ts:23-30; test: spec "accepts PNG and JPG..."; e2e "stores a PNG and serves it publicly with the same bytes" | L1, L2 -> pass | **PASS** | - |
| GEN-08-3 | Other formats (e.g. GIF, PDF) are rejected with 400. | M!A92; reqs:834 | [C] uploads.service.ts:103-113; test: spec "rejects GIF"; e2e "rejects > 5 MB, wrong MIME, ..." (gif, pdf) | L1, L2 -> pass | **PASS** | - |
| GEN-08-4 | File type is verified by MIME type. | reqs:834; PL:L911 | [C] uploads.service.ts:103-113; test: spec "rejects mimetype that disagrees with content" | L1 -> pass | **PASS** | - |
| GEN-08-5 | File type is verified by magic bytes (renamed non-image rejected). | reqs:834; PL:L911 | [C] uploads.service.ts:22-40,114-118; test: spec "rejects a text file renamed to .png (bad magic bytes)" | L1 -> pass | **PASS** | - |
| GEN-08-6 | A file of exactly 5 MB is accepted. | M!A92; reqs:834 | [C] uploads.service.ts:14,100; test: spec "rejects files over 5 MB and accepts exactly 5 MB" | L1 -> pass | **PASS** | - |
| GEN-08-7 | A file over 5 MB is rejected with 400. | M!A92; reqs:834 | [C] uploads.service.ts:100-102; test: same spec; e2e MB5+1 | L1, L2 -> pass | **PASS** | - |
| GEN-08-8 | A post accepts at most 5 images; the 6th is rejected. | M!A92; reqs:834 | [C] uploads.service.ts:55-59; common/contracts/uploads.contract.ts:11-14; test: e2e six files with max 5 rejected | L2 -> pass -- Only a caller-supplied per-call max; no per-type (post) limit; images already on the entity are not counted | **PARTIAL** | - |
| GEN-08-9 | An activity accepts at most 5 images; the 6th is rejected. | M!A92; reqs:834 | [C] same; test: same | L2 -> pass -- as 8 (activity; ITN-12 not on develop) | **PARTIAL** | - |
| GEN-08-10 | A hotel accepts at most 5 images; the 6th is rejected. | M!A92; reqs:834 | [C] same; test: same | L2 -> pass -- as 8 (hotel; HTL-01 not on develop) | **PARTIAL** | - |
| GEN-08-11 | An airline accepts at most 1 logo; a 2nd is rejected. | M!A92; reqs:834 | [C] same; test: e2e two files with max 1 rejected | L2 -> pass -- as 8 (airline logo; FLT-01 not on develop) | **PARTIAL** | - |
| GEN-08-12 | Uploaded files are stored on the server under UPLOAD_DIR. | M!A92; reqs:834 | [C] uploads.service.ts:46-48,63-71; config/env.schema.ts:24,76; test: spec "accepts PNG and JPG and stores them under UPLOAD_DIR"; e2e readdirSync(t.uploadDir) | L1, L2, L5 -> pass/OK | **PASS** | - |
| GEN-08-13 | Uploaded files are served by URL. | M!A92; reqs:834; PL:L911 | [C] uploads.controller.ts:139-157 (public GET :filename); test: e2e "stores a PNG and serves it publicly with the same bytes" | L2 -> pass | **PASS** | - |
| GEN-08-14 | Rejections return 400 with a clear message in the standard error shape. | M!A92; reqs:834 | [C] uploads.service.ts:54-59,100-118; test: spec asserts size and count messages | L1 -> pass -- MIME/magic messages not asserted; standard error shape over HTTP never asserted (no upload endpoint) | **PARTIAL** | - |
| GEN-08-15 | Upload endpoints' Swagger summaries reference GEN-08 or the owning [ID]. | CM:L27; PD:L386,L420 | [C] docs/api/openapi.json:118 "[GEN-08] Serve a stored image"; test: grep | grep -> 1 hit -- Serve endpoint OK; no upload endpoints exist yet to check | **PARTIAL** | - |
| ITN-18-1 | CurrencyService.convert(amountMinor,from,to) returns {amountMinor, rate, rateDate}. | reqs:619; PL:L915 | [C] currency.service.ts:60-80; test: currency.service.spec.ts "fetches rates from FX_API_BASE_URL and converts minor units" | L1 -> pass | **PASS** | - |
| ITN-18-2 | Converted amountMinor is an integer honoring each currency's exponent. | CM:L19; BC:L23 | [C] currency.service.ts:74-76; common/utils/money.ts; test: spec "handles cross rates and zero-decimal currencies"; e2e "respects currency exponents (JPY has none)..." | L1, L2 -> pass | **PASS** | - |
| ITN-18-3 | Rates are fetched from FXRatesAPI. | M!A69; PD:L191-192 | [C] currency.service.ts:145-155; env.schema.ts:73-75 default https://api.fxratesapi.com; test: spec "fetches rates from FX_API_BASE_URL..." | L1 -> pass -- Test asserts configured base URL + /latest?base=USD&api_key; FXRatesAPI host only via the schema default, not asserted | **PARTIAL** | - |
| ITN-18-4 | Rates are fetched once per day by a scheduled job. | M!A69; PL:L303 | [C] currency.service.ts:94-97 (Cron EVERY_DAY_AT_1AM); app.module.ts:28 ScheduleModule.forRoot(); test: spec "does not refetch when today is already cached" (request path only) | L1 -> pass -- No test triggers refreshDaily(); cron is code-read only | **PARTIAL** | - |
| ITN-18-5 | Fetched rates are cached in MongoDB (exchange_rates). | M!A69; reqs:619; PL:L918 | [C] exchange-rate.schema.ts:5 (collection exchange_rates); currency.service.ts:170-176; test: spec "persists fetched rates"; e2e (memory Mongo) "keeps serving the last cached rates when the FX API goes down" | L1, L2 -> pass | **PASS** | - |
| ITN-18-6 | The rate date is stored and returned. | M!A69; reqs:619 | [C] currency.service.ts:169,78; test: spec "persists fetched rates" (rateDate=TODAY); "fetches rates..." returns rateDate | L1 -> pass | **PASS** | - |
| ITN-18-7 | When the API fails, the last cached rates are used. | M!A69; reqs:619; PD:L194 | [C] currency.service.ts:107-121,131-143; test: spec "uses cached rates when the fetch fails" (old rateDate 2020-01-01), "...non-2xx status"; e2e "keeps serving the last cached rates..." | L1, L2, L4 -> pass | **PASS** | - |
| ITN-18-8 | No cached rates and API down yields a handled error, not a crash. | PD:L194 | [C] currency.service.ts:115-119; test: spec "answers 503 when no rates were ever cached and fetch fails"; currency-no-rates.e2e "GET /currencies/rates is 503; the currency list stays available" | L1, L2 -> pass | **PASS** | - |
| ITN-18-9 | An unsupported currency code returns 400. | reqs:619; PD:L194 | [C] currency.service.ts:99-105; test: spec "answers 400 for unsupported codes"; e2e "rejects unsupported codes with 400" | L1, L2 -> pass | **PASS** | - |
| ITN-18-10 | GET /api/currencies returns the supported currency list. | reqs:619; PL:L915 | [C] currency.controller.ts:17-20; currency.service.ts:18-26; test: e2e "lists supported currencies publicly" | L2 -> pass | **PASS** | - |
| ITN-18-11 | GET /api/currencies/rates returns rates with the rate date. | reqs:619 | [C] currency.controller.ts:25-32; currency.service.ts:82-91; test: e2e "exposes base, rateDate and rates" | L2 -> pass | **PASS** | - |
| ITN-18-12 | Swagger summaries of currency endpoints start with [ITN-18]. | CM:L27 | [C] docs/api/openapi.json:140,165; test: grep | grep -> 2 hits | **PASS** | - |
| TRVL-133-1 | CurrencyModule exists and is wired into app.module.ts. | JIRA; PL:L915 | [C] backend/src/app.module.ts:11,33; test: e2e boots real AppModule (test/utils/test-app.ts:252,260) | L2 -> pass | **PASS** | - |
| TRVL-133-2 | CurrencyModule provides CURRENCY_SERVICE with the real service (not the stub). | BC:L13-14 | [C] currency.module.ts:19 useExisting CurrencyService; test: e2e app.get(CURRENCY_SERVICE) "converts minor units using the fetched rate" | L2 -> pass | **PASS** | - |
| TRVL-133-3 | FXRatesAPI settings come from env and are listed in .env.example. | M!A69 ("configured"); BC:L4 | [C] env.schema.ts:22-23,72-75; example env file keys FX_API_KEY, FX_API_BASE_URL; test: repo-consistency | L5 -> OK | **PASS** | - |
| TRVL-133-4 | Tests mock the FXRatesAPI HTTP call (no live network). | BC:L35 | [C] currency.service.spec.ts:66-77 (global.fetch mocked and restored); test-app.ts:134-170 local fake FX; test: all currency tests | L1, L2 -> pass offline | **PASS** | - |
| TRVL-133-5 | The supported currency list is seeded. | PL:L915 | [C] currency.service.ts:18-26 hard-coded SUPPORTED_CURRENCIES; test: spec "lists supported currencies and rates"; e2e "lists supported currencies publicly" | L1, L2 -> pass -- List is a code constant, not seeded data | **PARTIAL** | - |
| TRVL-133-6 | Unit tests cover the cached-fallback path. | JIRA | [C] currency.service.ts:107-143; test: spec "uses cached rates when the fetch fails", "...non-2xx status" | L4 -> 2 pass; L3 checklist cmd -> 0 matched | **PASS** | - |
| TRVL-134-1 | docs/requirements/traceability.md exists. | JIRA; PL:L1823 | [D] docs/requirements/traceability.md:1 (47 lines); test: n/a (doc) | ls docs/requirements -> traceability.md present | **PASS** | - |
| TRVL-134-2 | Each in-scope requirement has a traceability row with ID, test name and command. | CM (Members: traceability rows); JIRA | [D] traceability.md:16-25 | grep owner ahmed in reqs.json -> 10 ids (PAY-01..04, ITN-18, GEN-02/05/07/08/13), all 10 have rows with ID, test names and command. repo-consistency.mjs does not check traceability. -- Only the 10 Ahmed reqs of 115 have rows. Member reqs have no rows (none merged yet) | **PARTIAL** | - |
| TRVL-134-3 | Each traceability command runs green. | JIRA | [D] traceability.md:16-25; test: all 45 named tests found (4 are it.each: test/payments.e2e-spec.ts:283-284 "%p", test/foundation.e2e-spec.ts:130 "%s") | 15 row commands run -> all exit 0; matched counts equal the listed names: pay01 5+1, pay02 4, pay03 5+1, pay04 3+2, itn18 5, gen02 1+1, gen05 4, gen07 5, gen08 4, gen13 3+1 (.swarm/tmp/v1-d/*-e2e.log, *-unit.log) | **PASS** | - |
| TRVL-134-4 | ERD exists at docs/architecture/erd.md. | JIRA; PL:L1821 | [D] docs/architecture/erd.md:1 (345 lines) | ls -> present | **PASS** | - |
| TRVL-134-5 | Module map exists at docs/architecture/module-map.md. | PL:L1821 | [D] docs/architecture/module-map.md:1 | ls -> present | **PASS** | - |
| TRVL-134-6 | An ADR for auth exists. | PL:L1821-1822 | [D] docs/architecture/adr-001-auth-cookies.md:1 "ADR-001: Authentication with httpOnly cookies and rotating refresh tokens" | ls -> present | **PASS** | - |
| TRVL-134-7 | An ADR for concurrency exists. | PL:L1821-1822 | [D] docs/architecture/adr-002-inventory-concurrency.md:1 | ls -> present | **PASS** | - |
| TRVL-134-8 | An ADR for payments exists. | PL:L1821-1822 | [D] docs/architecture/adr-003-payments-webhook.md:1 | ls -> present | **PASS** | - |
| TRVL-134-9 | An ADR for money/time exists. | PL:L1821-1822 | [D] docs/architecture/adr-004-money-and-time.md:1 "Money as integer minor units, time as UTC" | ls -> present | **PASS** | - |
| TRVL-135-1 | README contains backend setup instructions. | JIRA; PD:L602 | [D] README.md:18-24 "Clone and install ... npm ci"; test: n/a (doc) | grep -> README.md:23 npm ci | **PASS** | - |
| TRVL-135-2 | README documents the required environment variables via .env.example. | PD:L436-437 | [D] README.md:28 "The template is the example env file at the repository root", variable table README.md:34-39 | grep -> L28, L31 | **PASS** | - |
| TRVL-135-3 | A Swagger demo script exists. | JIRA; BC:L9 | [D] backend/scripts/demo-server.ts exists; documented in docs/api/swagger-demo.md:29 | ls -> present; grep -i demo README.md -> no match -- README does not reference the demo script or swagger-demo.md | **PARTIAL** | - |
| TRVL-135-4 | AI_PROMPTS.txt entries are delimited by ===== separator lines. | PD:L551-567 | [D] AI_PROMPTS.txt:1,18,...,171; test: repo-consistency.mjs | gate repo.log -> "AI_PROMPTS.txt format and example env keys are consistent."; grep -c ^===== -> 13 (12 entries, shared separators) | **PASS** | - |
| TRVL-135-5 | Every AI_PROMPTS entry has a Date: field. | PD:L553 | [D] AI_PROMPTS.txt; test: same | grep -c ^Date: -> 12 | **PASS** | - |
| TRVL-135-6 | Every entry has a Student: field. | PD:L554 | [D] AI_PROMPTS.txt; test: same | ^Student: -> 12 | **PASS** | - |
| TRVL-135-7 | Every entry has a Tool: field. | PD:L555 | [D] AI_PROMPTS.txt; test: same | ^Tool: -> 12 | **PASS** | - |
| TRVL-135-8 | Every entry has a Related Requirement: field. | PD:L556 | [D] AI_PROMPTS.txt; test: same | ^Related Requirement: -> 12 | **PASS** | - |
| TRVL-135-9 | Every entry has a Prompt: section. | PD:L557 | [D] AI_PROMPTS.txt; test: same | ^Prompt: -> 12 | **PASS** | - |
| TRVL-135-10 | Every entry has a How the output was used: section. | PD:L559 | [D] AI_PROMPTS.txt; test: same | ^How the output was used: -> 12 | **PASS** | - |
| TRVL-135-11 | AI_PROMPTS.txt contains no secrets, passwords or tokens. | PD:L573 | [D] AI_PROMPTS.txt | grep -iE for mongodb URIs without placeholder, sk_live/sk_test keys, password=, whsec_ -> no match | **PASS** | - |
| TRVL-135-12 | Every AI-assisted change has an AI_PROMPTS entry. | CM:L26 | [D] AI_PROMPTS.txt:145-171 (two 2026-11-05 entries, TRVL-1 team process) | git log -1 -- AI_PROMPTS.txt -> 6dec7cd; later [AGENT] commits 4108a7a, 615263b, b358dca, 213d4e5 do not touch AI_PROMPTS -- Spot check only; whether those 4 commits are covered by the existing TRVL-1 entries cannot be told | **PARTIAL** | - |
| TRVL-136-1 | Tag v1.0.0-m1 exists. | JIRA; PL:L974 | [D] n/a | git tag -> none; gh api repos/.../tags -> []; gh api repos/.../releases -> []; no CHANGELOG -- Tag v1.0.0-m1 absent (due 2026-11-20) -- Leader: due 2026-11-20 | **FAIL (not due) (Leader)** | - |
| TRVL-136-2 | The tag points to a commit on main. | PL:L974; CM:L24 | [D] n/a | no tag exists -- needs the tag | **UNVERIFIABLE** | - |
| TRVL-136-3 | develop is merged into main by PR only at the release. | CM:L24; PD:L513 | [D] n/a | gh pr list --state all -> #13 "release: merge develop into main" and #15 "Develop" both MERGED main<-develop before any release tag; origin/main = 019e6bc (2026-11-04) -- develop was merged to main twice with no release -- Leader: HANDOFF records #13/#15 as releases, untagged | **PARTIAL (Leader)** | - |
| TRVL-136-4 | The main -> develop back-merge PR is closed after release. | CM:L24 | [D] n/a | gh pr list -> #18 develop<-main "Main" CLOSED (not merged); no back-merge PR for #13 seen -- Back-merge was closed, but no release has happened yet | **PARTIAL** | - |
| TRVL-136-5 | CI (build-lint-test) is green on the release commit. | CM Map (.github) | [D] n/a | no release commit. gh run list --branch main -> latest is PR Automation failure (run 41844108306, PR #18). develop 6efa26b CI success (run 42072836283) -- needs the release commit | **UNVERIFIABLE** | - |
| TRVL-136-6 | openapi.json has no drift at the release commit. | CM:L27 | [D] n/a | at 6efa26b: gate openapi:export + git diff --exit-code = 0 (LF->CRLF flag only) -- the release commit does not exist yet | **UNVERIFIABLE** | - |
| TRVL-136-7 | Release happens by 2026-11-20. | JIRA; PD:L223 | [D] n/a | no tag; today 2026-11-05 < 2026-11-20 -- not yet due | **UNVERIFIABLE** | - |
| TRVL-136-8 | Code freeze and bug bash are completed. | JIRA; PL:L974 | [D] n/a | depends on Jira state -- Jira not checked | **UNVERIFIABLE** | - |
| TRVL-128-1 | MONGODB_URI is required by env.schema. | PD:L434; BC:L4 | [D] backend/src/config/env.schema.ts:58-63 (.required()); test: backend/src/config/env.schema.spec.ts:52 "fails fast listing every missing required variable"; :18 "treats empty values as unset so defaults apply" (empty MONGODB_URI throws, L22-24) | npx jest src/config/env.schema.spec.ts -t (4 names) -> 4 passed, exit 0 (.swarm/tmp/v1-d/trvl128-unit.log) | **PASS** | - |
| TRVL-128-2 | .env.example lists MONGODB_URI with a placeholder, no credentials. | PD:L434-437; CM:L25 | [D] example env file at repo root (tracked, by git ls-files) | gate repo.log -> example keys match env.schema (MONGODB_URI is in the schema); git grep for user:pass@ connection strings in all tracked files -> none (exit 1) -- Placeholder text not viewed (the hook blocks reading the example env file) | **PARTIAL** | - |
| TRVL-128-3 | env.schema accepts both mongodb+srv and direct-host URIs. | BC:L40 | [D] backend/src/config/env.schema.ts:56-62 (mongodb and mongodb+srv pattern, multi-host allowed); test: env.schema.spec.ts:27 "accepts the Atlas SRV and multi-host standard connection strings"; :39 "rejects MONGODB_URI values that are not MongoDB connection strings" | same run -> passed | **PASS** | - |
| TRVL-128-4 | No real connection string is committed in tracked files. | PD:L519; CM:L25 | [D] n/a | git grep -nE for mongodb(+srv) URIs with user:pass@ that are not placeholders -> no match (exit 1) | **PASS** | - |
| TRVL-128-5 | .env is gitignored and untracked. | PD:L436 | [D] .gitignore:4-6, backend/.gitignore:5-7 | git ls-files over dotfiles, *.pem, *.key -> only the example env file, .gitignore, backend/.gitignore, backend/.prettierrc | **PASS** | - |
| TRVL-128-6 | The Atlas cluster is live and reachable. | JIRA; PD:L430 | [D] n/a | n/a -- needs live Atlas credentials | **UNVERIFIABLE** | - |
| TRVL-128-7 | Each member has a database user. | PL:L862 | [D] n/a | n/a -- needs the Atlas console | **UNVERIFIABLE** | - |
| TRVL-128-8 | An IP access list is configured. | PL:L862 | [D] n/a | n/a -- needs the Atlas console | **UNVERIFIABLE** | - |
| TRVL-128-9 | MONGODB_URI was shared privately with members. | JIRA; PD:L431-432 | [D] n/a | n/a -- shared out of band | **UNVERIFIABLE** | - |
| DLV-1 | A NestJS backend implements the mandatory API tables. | PD:L599; PD:L260-438 | [D] docs/api/openapi.json | node count -> 12 paths / 12 operations; docs/requirements/project-description.md:260-438 lists 117 method rows. About 11 PD rows are covered (payments, policies, refunds, currencies, audit-logs, uploads) -- Mandatory API tables are mostly unimplemented (M1 due 2026-11-20) -- Leader: due 2026-11-20 | **FAIL (not due) (Leader)** | - |
| DLV-2 | The backend connects to MongoDB Atlas. | PD:L600 | [D] backend/src/config/env.schema.ts:58-63 | n/a -- live Atlas | **UNVERIFIABLE** | - |
| DLV-3 | REST API is documented with Swagger. | PD:L601 | [D] docs/api/openapi.json; docs/api/swagger-demo.md:5 | demo server GET /api/docs-json -> 200; gate openapi export drift = 0 | **PASS** | - |
| DLV-4 | Backend is demonstrable through Swagger UI. | PD:L605 | [D] backend/scripts/demo-server.ts:23-64 | DEMO_IN_MEMORY_DB=true, PORT=3987, npx ts-node scripts/demo-server.ts -> Nest application successfully started; GET /api/docs -> 200 (.swarm/tmp/v1-d/demo-server.log); process killed | **PASS** | - |
| DLV-5 | README has setup instructions. | PD:L602 | [D] README.md:18-39 | see CHK-TRVL-135-1 | **PASS** | - |
| DLV-6 | AI_PROMPTS.txt is updated. | PD:L603 | [D] AI_PROMPTS.txt | git log -1 -- AI_PROMPTS.txt -> 6dec7cd 2026-11-05; repo-consistency OK | **PASS** | - |
| DLV-7 | Git history shows contributions from team members. | PD:L604; PD:L537 | [D] n/a | git shortlog -sn HEAD -> 33 Ahmed Atef Youssef, no other authors; only other contributor activity is open PR #20 (sandra660) -- History shows only one contributor | **FAIL** | - |
| DLV-8 | Feature branches follow feature/<ID>-… or fix/<ID>-… off develop. | PD:L486-491; CM:L23 | [D] n/a | git branch -r filtered -> origin/test/M1-ahmed-acceptance-e2e, origin/feature/SETUP-scaffold-contracts; also fix/build-exclude-scripts (no ID) plus chore/ and docs/ prefixes -- Branch names break the feature/ID- / fix/ID- rule | **FAIL** | - |
| DLV-9 | Commits use Conventional Commits with [REQ-ID]. | PD:L523; CM:L23 | [D] n/a | git log HEAD --format=%s, checked against the regex -> violations: 7decf05 "chore: initial commit with requirements sources" plus 4 GitHub "Merge pull request" commits (#14, #17, #19, #21) -- The other 28 commits conform | **PARTIAL** | - |
| DLV-10 | PRs reference requirement IDs. | PD:L518 | [D] n/a | gh pr list --json title -> 19 of 21 PR titles carry IDs; #15 "Develop" (merged) and #18 "Main" (closed) do not -- merged #15 has no ID | **PARTIAL** | - |
| DLV-11 | PRs are reviewed and merged by the team leader. | PD:L520; CM:L24 | [D] n/a | gh pr list -> all 18 merged PRs mergedBy=AhmedAtefYoussef; every one has reviewDecision=REVIEW_REQUIRED (no approving review) and was authored by Ahmed -- Merged by the leader, but none was reviewed | **PARTIAL** | - |
| DLV-12 | No secrets or environment files are committed. | PD:L519 | [D] .gitignore:4-15 | see CHK-TRVL-128-4/-5; git ls-files *access*/*cred*/*secret* -> none | **PASS** | - |
| DLV-13 | The database is seeded with the official reference datasets (countries, cities, airports, attractions). | PD:L123-127 | [D] n/a | grep -ril seed / countries / airports / attractions in backend/src, backend/scripts -> no seed script (only stub/demo matches) -- Reference datasets are not seeded; seeding on Atlas is unverifiable | **FAIL** | - |
| DLV-14 | Repo consistency checks pass. | CM Commands | [D] .github/scripts/repo-consistency.mjs | gate repo.log -> consistency OK | **PASS** | - |

## 4. Findings (severity order; Leader list)

### MEDIUM

**F1 Payment confirmation does not cross-check amount/currency** (PAY-01, PAY-04; card fix-PAY-01-1)
- Where: backend/src/modules/payments/payments.service.ts:219-262 (onSucceeded ignores amount_received/currency); :68-76 (reused PENDING PI not re-checked against current totalMinor). Source: V2-3 S3, S4.
- Violated: CHK-PAY-01-5: "PaymentIntent amount equals the booking total in integer minor units."; CHK-PAY-04-5: "PaymentIntents use only PLATFORM_CURRENCY."
- Test that should fail first: unit "succeeded with amount_received < amountMinor does not markConfirmed"; unit "createForBooking after a total change returns the new amount".

**F2 Webhook secret falls back to '' outside production** (PAY-01; card fix-PAY-01-1)
- Where: payments.service.ts:171 -- forgeable events in dev/staging. Source: V2-3 S2 (inferred from stripe-node behaviour, not exploited).
- Violated: CHK-PAY-01-11: "Webhook with an invalid Stripe signature is rejected and changes nothing."
- Test that should fail first: unit "handleWebhook with no configured secret rejects an ''-signed event".

**F3 Mutation survivor: testConfirm production guard untested** (PAY-01 / A3; card fix-PAY-01-1)
- Where: payments.service.ts:152 (mutant 11b SURVIVED). The checklist also lacked an A3 "404 in production" row.
- Violated: A3 (state.md): test-confirm is dev-only and returns 404 in production; related CHK-PAY-01-16: "The booking is never confirmed by POST /api/payments or the client, only by the verified webhook."
- Test that should fail first: unit "testConfirm with NODE_ENV=production throws NotFoundException and never calls paymentIntents.confirm".

**F4 No uniqueness for payments/refunds** (PAY-01, PAY-03; card fix-PAY-03-1)
- Where: payments/schemas.ts:17 (stripeId not unique; no partial unique PENDING-per-booking index); refunds.service.ts:78,101,127 (read-then-create dedupe, different idempotency keys per path: refund-pi-PI-REASON vs refund-pi-PI). refundFor-twice untested -> CHK-PAY-03-12 PARTIAL. Source: V2-3 S5, S6; V2-1.
- Violated: CHK-PAY-03-12: "Refunds are deduplicated per PaymentIntent."
- Test that should fail first: unit "refundFor twice for the same booking issues one refunds.create"; "parallel refundFor + refundPayment -> one refund"; "concurrent createForBooking leaves one payment doc".

**F5 Mutation survivor: zero-refund guard in refundPayment untested** (PAY-03; card fix-PAY-03-1)
- Where: refunds.service.ts:121 (mutant 5b SURVIVED).
- Violated: CHK-PAY-03-8: "A zero refund amount calls no Stripe API and creates no refund record."
- Test that should fail first: unit "refundPayment(pay, {amount_received: 0}) returns null and never calls stripe.refunds.create".

**F6 Config hardening** (PAY-01, GEN-13; card fix-TRVL-130-1)
- Where: backend/src/config/env.schema.ts:48-50 (NODE_ENV defaults to development); :70 (any sk_/rk_ key accepted, live keys included -> CHK-PAY-01-26 PARTIAL); :69 (COOKIE_SECURE=false allowed in production). Source: V2-3 S1, S9; V1-A, V2-1.
- Violated: CHK-PAY-01-26: "Stripe is used in test mode only."; CHK-TRVL-131-6: "Dev headers are refused in production."
- Test that should fail first: env.schema.spec "missing NODE_ENV throws outside tests"; "sk_live_ key rejected outside production"; "production with COOKIE_SECURE=false throws".

**F7 Audit immutability bypass via Model.bulkWrite** (GEN-07; card fix-GEN-07-1)
- Where: backend/src/modules/audit/audit-log.schema.ts:33-42 (BLOCKED list lacks bulkWrite; V2-1 probe reached the driver). updateOne mutant 9 killed only by a 5 s timeout. Metadata persistence untested (CHK-GEN-07-1, -2 PARTIAL).
- Violated: CHK-GEN-07-2: "Audit entries are append-only (no update or delete path)."; CHK-GEN-07-1: "AuditService.record accepts actorId, action, targetType, targetId and metadata."
- Test that should fail first: audit-log.schema.spec "bulkWrite updateOne is rejected with 'Audit log entries are immutable'"; audit e2e "record with metadata returns the same metadata".

**F8 Swagger mounted in production; cookie auth scheme missing** (TRVL-130; card fix-TRVL-130-2)
- Where: backend/src/common/swagger/setup-swagger.ts:46 (mounted unconditionally); :32 addBearerAuth only (CHK-TRVL-130-10 FAIL; plan.md:888-894 "Swagger with cookie auth"). Source: V1-B, V2-3 S7.
- Violated: CHK-TRVL-130-10: "Swagger declares cookie authentication."
- Test that should fail first: e2e "GET /api/docs is 404 when NODE_ENV=production"; unit "document declares a cookie apiKey security scheme".

**F9 Upload limits and error shape** (GEN-08; card fix-GEN-08-1)
- Where: backend/src/modules/uploads/uploads.service.ts:55-59 (only a caller-supplied per-call max; no per-entity-type limits; existing images not counted -> CHK-GEN-08-8..11 PARTIAL); :100 (size checked after buffering; no shared multer limits). MIME/magic-byte messages and HTTP error shape untested (CHK-GEN-08-14/15). Source: V1-C, V2-3 S8.
- Violated: CHK-GEN-08-8: "A post accepts at most 5 images; the 6th is rejected."; CHK-GEN-08-11: "An airline accepts at most 1 logo; a 2nd is rejected."; CHK-GEN-08-14: "Rejections return 400 with a clear message in the standard error shape."
- Test that should fail first: unit "hotel with 4 stored images rejects 2 more"; e2e "6 MB upload -> 413/400 before the service"; e2e "spoofed magic bytes returns standard error body with message".

**F10 Traceability commands and README gaps** (TRVL-134, TRVL-135; card fix-TRVL-134-1)
- Where: docs/requirements/traceability.md -- multi-name commands copied from the raw markdown (`\|`) run 0 tests and exit 0 (V2-4 logs 16, 17); TRVL-128/136 rows missing; README.md has no reference to backend/scripts/demo-server.ts or docs/api/swagger-demo.md (CHK-TRVL-135-3).
- Violated: CHK-TRVL-134-3: "Each traceability command runs green."; CHK-TRVL-135-3: "A Swagger demo script exists."
- Test that should fail first: repo-consistency check "every traceability command, run as written, executes >= 1 test" (exits non-zero on the raw `\|` form).

**F11 No reference-dataset seeding** (DLV-13 FAIL; card fix-DLV-13-1, owner TBD)
- Where: no seed script in backend/src or backend/scripts (V1-D grep). Owner is not Ahmed per docs/team/ownership.md; needs assignment.
- Violated: CHK-DLV-13: "The database is seeded with the official reference datasets (countries, cities, airports, attractions)."
- Test that should fail first: e2e/seed test "after npm run seed, countries/cities/airports/attractions collections are non-empty".

### LOW

**F12 Weak policy-acceptance and idempotency tests** (PAY-02, PAY-03, PAY-01; card fix-PAY-02-1)
- Where: test/payments.e2e-spec.ts:144 (snapshot tiers length > 0 only; no check that a rejected accept stores nothing); no test changes live policy after acceptance (refunds.service.ts:87-92); idempotent-confirm e2e does not assert no refund on a duplicate succeeded event (mutant 2 killed only by unit test).
- Violated: CHK-PAY-02-7: "Accepting policies stores a snapshot of the policies shown."; CHK-PAY-02-8: "accept-policies without accepted=true does not record acceptance."; CHK-PAY-03-2: "USER cancellations use the tiers from the booking's accepted policy snapshot, not current policy."; CHK-PAY-01-15: "Duplicate succeeded webhooks call markConfirmed exactly once (idempotent)."
- Test that should fail first: e2e "snapshot equals the policies returned by GET"; "rejected accept leaves policiesAcceptedAt null"; "refund uses snapshot after live policy changes"; e2e duplicate succeeded -> `refunds.create` not called.

**F13 amountMinor integer not enforced in schema** (PAY-04; card fix-PAY-03-1)
- Where: payments/schemas.ts:21, :47 (Prop number, no integer/min validator).
- Violated: CHK-PAY-04-8: "All money amounts are stored as integer minor units."
- Test that should fail first: schema unit "saving Payment with amountMinor 10.5 fails validation".

**F14 Dev-auth guard tests** (TRVL-131; card fix-TRVL-131-1)
- Where: backend/src/common/guards/dev-auth.guard.spec.ts:74-78 (flag-off asserts generic toThrow); NODE_ENV allow-list (dev-auth.guard.ts:62-67) only tested for production.
- Violated: CHK-TRVL-131-5: "Dev headers work only with DEV_AUTH_ENABLED=true and NODE_ENV development or test."
- Test that should fail first: guard spec "NODE_ENV=staging with flag on -> UnauthorizedException (401)".

**F15 Common-layer test gaps** (TRVL-130, TRVL-132, GEN-02; card fix-TRVL-130-3)
- Where: /api prefix set in backend/src/main.ts:10 but tests set it in test/utils/test-app.ts:266 (CHK-TRVL-130-2); UTC storage unasserted (130-8); ContractStubsModule tokens never resolved in a test (132-7); 500 body keys partly asserted (GEN-02-12); duplicate-key 409 message leaks field names (backend/src/common/filters/all-exceptions.filter.ts:82,95; V2-3 S13).
- Violated: CHK-TRVL-130-2: "All routes are served under the /api prefix."; CHK-TRVL-130-8: "Date utilities exist and store times in UTC."; CHK-TRVL-132-7: "ContractStubsModule provides a stub for every not-yet-implemented token."; CHK-GEN-02-12: "Unhandled exceptions return 500 in the same shape."
- Test that should fail first: bootstrap test using main.ts setup asserts /api prefix; filter spec "500 body has exactly statusCode,error,message,path,timestamp"; filter spec "11000 message names no field".

**F16 Currency gaps** (GEN-05, ITN-18, TRVL-133; card fix-ITN-18-1)
- Where: backend/src/modules/currency/currency.controller.ts:20-23 (GET /api/currencies bypasses PaginationQueryDto, GEN-05-10); currency.service.ts:94-97 daily @Cron untested (ITN-18-4); FXRatesAPI only as env default env.schema.ts:73-75 (ITN-18-3); currency.service.ts:18-26 list hard-coded, not seeded (TRVL-133-5).
- Violated: CHK-GEN-05-10: "Every list endpoint uses the shared PaginationQueryDto."; CHK-ITN-18-4: "Rates are fetched once per day by a scheduled job."; CHK-ITN-18-3: "Rates are fetched from FXRatesAPI."; CHK-TRVL-133-5: "The supported currency list is seeded."
- Test that should fail first: unit "refreshDaily() fetches and caches once"; e2e "GET /api/currencies?limit=20 -> 400".

**F17 Payments minor** (PAY-01; card fix-PAY-01-1)
- Where: payments.service.ts:138 vs payments.controller.ts:225 (403 vs 404 for other users' payments, S11); payments.service.ts:200 cancelForExpiredHold raw cancel (S12); payments/stripe.provider.ts:12 silent placeholder key (S10).
- Violated: CHK-PAY-01-7: "Paying another user's booking is refused."; CHK-PAY-01-22: "cancelForExpiredHold(paymentId) cancels the Stripe PaymentIntent."
- Test that should fail first: unit "getForUser other user's id -> 404"; unit "cancelForExpiredHold on a succeeded PI does not throw".

**F18 Process** (Ahmed actions, no card)
- Branches test/M1-ahmed-acceptance-e2e, feature/SETUP-scaffold-contracts, fix/build-exclude-scripts break naming (CHK-DLV-8: "Feature branches follow feature/<ID>-… or fix/<ID>-… off develop.").
- 18 merged PRs with no approving review (CHK-DLV-11: "PRs are reviewed and merged by the team leader.").
- develop->main #13/#15 merged without a tag (CHK-TRVL-136-3 PARTIAL: develop is merged into main by PR only at the release.).
- Branch protection enforce_admins=false; no helmet/rate limiting (V2-3 S14, needs a dependency decision).

**F19 Historical inline credential** (Ahmed action)
- Commit ce0a259 added a mongodb+srv URI with inline credentials to backend/src/config/env.schema.spec.ts (removed in 2e264c6). Value not printed here. Confirm it is not a real Atlas password; rotate it in Atlas if it is.
- Violated: CHK-DLV-12: "No secrets or environment files are committed."

## 5. Cross-checks

### xlsx vs reqs.json drift
- 0 text differences on 115 rows (Mandatory 104, Bonus 11); see .swarm/verify/drift.md.
- xlsx has no owner, priority or acceptance columns; owner exists only in reqs.json, on 10 rows (all ahmed). No priority field in either source.
- C1: Jira assigns Ahmed 7 more requirement rows (FLT-12/22/23, HTL-16/17/18, GEN-11), so the reqs.json owner field is incomplete.

### Jira vs reality
- Jira: all 10 requirement stories and TRVL-128..135 are Done; TRVL-136 In Progress.
- Mismatches:
  - GEN-07 (TRVL-102) Done, but suspension/deletion audit calls are UNVERIFIABLE (CHK-GEN-07-3/4/5: no AUDIT_SERVICE callers yet).
  - TRVL-130 Done with 1 FAIL (CHK-TRVL-130-10, cookie auth scheme).
  - GEN-08 (TRVL-103) Done with 6 PARTIAL (CHK-GEN-08-8..11, -14, -15).
  - TRVL-128 Done without member connection confirmations (state.md A9).
  - TRVL-135 Done, but README lacks the Swagger demo (CHK-TRVL-135-3).
  - Sprint 0 is still active after its 2026-11-04 end date (C3).
  - 7 Done stories sit in future sprints: Sprint 1 TRVL-102, TRVL-103, TRVL-109, TRVL-133; Sprint 2 TRVL-67, TRVL-68, TRVL-69 (C2). TRVL-135 (Sprint 2) is also Done.

### Mutation results (V2-2, .swarm/verify/v2-2.md)
Result: 13 mutants over 11 rules; KILLED 11, SURVIVED 2 (5b, 11b). Every rule was killed at its primary site.

| # | rule | file:line mutated | minimal diff (one line) | proving test file + name | result | restored |
|---|------|-------------------|-------------------------|--------------------------|--------|----------|
| 1 | webhook signature verification | src/modules/payments/payments.service.ts:174 | `throw new BadRequestException('Invalid webhook signature')` -> `event = JSON.parse(rawBody.toString()) as Stripe.Event` | payments.service.spec.ts "rejects bad signature with 400"; test/payments.e2e-spec.ts "rejects a tampered body, wrong secret and missing signature with 400", "is reachable without auth headers (public)" | KILLED | yes |
| 2 | idempotent confirm (redelivered succeeded) | src/modules/payments/payments.service.ts:252 | `if (view.paymentId === paymentId) return;` -> `if (false && view.paymentId === paymentId) return;` | payments.service.spec.ts "PAY-01 F2 ... redelivery when booking was confirmed by this payment does nothing" (e2e payments all passed, see note a) | KILLED | yes |
| 3 | refund tier selection | src/modules/payments/refunds.service.ts:51 | `t.daysBefore > tier.daysBefore` -> `t.daysBefore < tier.daysBefore` | refunds.service.spec.ts "picks highest daysBefore <= remaining", "boundary is inclusive"; e2e payments quote() tier boundaries (6), "USER refund 40 days out...", "USER refund 10 days out uses the 50% tier" | KILLED | yes |
| 4 | provider-initiated cancel = 100% | src/modules/payments/refunds.service.ts:84 | `if (reason === 'PROVIDER') {` -> `if (false && reason === 'PROVIDER') {` | refunds.service.spec.ts "PROVIDER refunds 100% regardless of tiers" (+2); e2e "PROVIDER refund is always 100%, even right before departure" | KILLED | yes |
| 5 | zero refund -> no Stripe call (refundFor) | src/modules/payments/refunds.service.ts:94 | `if (!(amountMinor > 0)) return null;` -> `if (!(amountMinor >= 0)) return null;` | refunds.service.spec.ts "zero amount issues nothing"; e2e "USER refund inside the last tier issues nothing and never calls Stripe" | KILLED | yes |
| 5b | zero refund -> no Stripe call (refundPayment, alt site) | src/modules/payments/refunds.service.ts:121 | `if (!(amountMinor > 0)) return null;` -> `if (!(amountMinor >= 0)) return null;` | refunds.service.spec.ts, payments.service.spec.ts, e2e payments: all pass | SURVIVED (NO-TEST for refundPayment with amount_received 0) | yes |
| 6 | minor units / per-currency exponent | src/common/utils/money.ts:29 | `assertCurrency(currency);` -> `assertCurrency(currency); return 2;` | money.spec.ts "knows minor digits per currency" (+3 toMinor/fromMinor); refunds.service.spec.ts "formats a zero-decimal currency (JPY)..."; e2e audit-uploads-currency "respects currency exponents (JPY has none)..." | KILLED | yes |
| 7 | PLATFORM_CURRENCY used (not hard-coded USD) | src/modules/payments/payments.service.ts:54 | `return this.config.getOrThrow<string>('PLATFORM_CURRENCY');` -> `return 'USD';` | payments.service.spec.ts "PAY-04 ... uses EUR on the intent and the stored payment"; test/platform-currency.e2e-spec.ts "uses EUR on the PaymentIntent, the payment and the refund" (Expected EUR, Received USD) | KILLED | yes |
| 8 | pagination size fixed at 10 (limit != 10 -> 400) | src/common/dto/pagination.dto.ts:17 | `@Equals(DEFAULT_PAGE_SIZE)` -> `@IsInt()` | pagination.dto.spec.ts "does not let clients change the page size"; test/foundation.e2e-spec.ts "GEN-05 pagination > ignores attempts to change page size" | KILLED | yes |
| 9 | audit log append-only | src/modules/audit/audit-log.schema.ts:34 | `'updateOne',` -> `// 'updateOne',` | audit-log.schema.spec.ts "updateOne is rejected" (see note b) | KILLED | yes |
| 10 | upload magic-byte check | src/modules/uploads/uploads.service.ts:114 | `if (sniff(file.buffer) !== declared) {` -> `if (false && sniff(file.buffer) !== declared) {` | uploads.service.spec.ts "rejects a text file renamed to .png (bad magic bytes)", "rejects mimetype that disagrees with content"; e2e "rejects > 5 MB, wrong MIME, spoofed magic bytes and too many files with 400" | KILLED | yes |
| 11 | dev auth guard refused in production | src/common/guards/dev-auth.guard.ts:64 | `(env !== 'development' && env !== 'test')` -> `(env !== 'development' && env !== 'test' && env !== 'production')` | dev-auth.guard.spec.ts "ignores dev headers in production" | KILLED | yes |
| 11b | dev-only test-confirm refused in production (alt site) | src/modules/payments/payments.service.ts:152 | `if (this.config.get<string>('NODE_ENV') === 'production') {` -> `if (false && this.config.get<string>('NODE_ENV') === 'production') {` | payments.service.spec.ts, e2e payments: all pass | SURVIVED (NO-TEST) | yes |

Notes
- a. Mutant 2: the e2e "confirms the booking exactly once" still passed because removing the early return sends the redelivery to the late-payment refund branch, not to a second markConfirmed. Only the unit test (asserts no refund on redelivery) catches it. The e2e does not assert that a duplicate succeeded event issues no refund. Suggest adding `expect(t.stripe.refunds.create).not.toHaveBeenCalled()` to that e2e.
- b. Mutant 9: the test fails because the unhooked updateOne reaches Mongoose buffering (no DB) and the test times out (5000 ms) instead of rejecting with "Audit log entries are immutable". It still fails, so KILLED, but the failure shows as a timeout, not as a clear assertion message.
- 5b finding: RefundsService.refundPayment zero-amount guard (L121) is unprotected. No test calls refundPayment with amount_received 0. Suggest a unit test: refundPayment(pay, {id, amount_received: 0}) returns null, and stripe.refunds.create is not called.
- 11b finding: PaymentsService.testConfirm production guard (L152) is unprotected. No test sets NODE_ENV=production for POST test-confirm. Suggest a unit test: production config gives NotFoundException, and stripe.paymentIntents.confirm is not called.
- Every mutant compiled under ts-jest (no TS errors in the logs); every failure was an assertion about the rule (or the timeout in note b).

#### Rule-7 block
KILLED 11 / SURVIVED 2 (13 mutants; all 11 named rules killed on their primary site).
- SURVIVED/NO-TEST 5b: zero-refund guard in RefundsService.refundPayment (refunds.service.ts:121) has no test.
- SURVIVED/NO-TEST 11b: production guard on PaymentsService.testConfirm (payments.service.ts:152) has no test.
- Weak: idempotent-confirm e2e misses a spurious refund on redelivery (the unit test kills it); the audit hook test fails only by timeout.

### Security findings (V2-3, .swarm/verify/v2-3.md; no Critical/High)
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

History scan (Leader, .swarm/verify/v2-3-history.md):
- Tracked tree at 6efa26b: 0 matches for Stripe live/test secret keys, webhook secrets, or mongodb URIs with inline user:password (git grep).
- Files ever added with secret-like names: only tokens.ts (DI tokens), password-hasher(.spec).ts — benign.
- History: 0 commits with sk_live_ / whsec_ patterns.
- History: commit ce0a259 (2026-11-04, fix(config): multi-host MongoDB) added a mongodb+srv URI with inline credentials to backend/src/config/env.schema.spec.ts
  (username "user", 6-char alphanumeric password, *.mongodb.net host); replaced by placeholders in 2e264c6 the same day. Value not printed.
  Finding (Low, Ahmed-only): confirm the value is not a real Atlas user password; if it is, rotate it in Atlas (history is public to repo readers).

### Traceability audit (V2-4, .swarm/verify/v2-4.md)
Method: each named test grepped in backend/src and backend/test; each row command re-run once from backend/ with
the GFM-rendered regex (`\|` -> `|`), logs in .swarm/tmp/v2-4/NN.log. Logs 16-17 re-run the raw markdown-source form.

| ID | claimed | named tests exist (file:line) | re-run (log -> jest Tests:) | match? |
|---|---|---|---|---|
| PAY-01 | PASS | test/payments.e2e-spec.ts:179,258,307,382,446; src/modules/payments/payments.service.spec.ts:244 | 01 -> 5 passed/41 skipped; 02 -> 1 passed | yes |
| PAY-02 | PASS | test/payments.e2e-spec.ts:103,115,144,201 | 03 -> 4 passed | yes |
| PAY-03 | PASS | test/payments.e2e-spec.ts:545,579,585,592,599; src/modules/payments/refunds.service.spec.ts:93 | 04 -> 5 passed; 05 -> 1 passed | yes |
| PAY-04 | PASS | "-500"/"10.5" names are generated by it.each at test/payments.e2e-spec.ts:283-284 ('rejects a booking total of %p minor units'; literal grep NOT FOUND); :295; src/config/env.schema.spec.ts:9,56 | 06 -> 3 passed; 07 -> 2 passed | yes |
| ITN-18 | PASS | test/audit-uploads-currency.e2e-spec.ts:275,285,292,313,322 | 08 -> 5 passed | yes |
| GEN-02 | PASS | test/foundation.e2e-spec.ts:33; src/common/pipes/validation.pipe.spec.ts:32 | 09 -> 1 passed; 10 -> 1 passed | yes |
| GEN-05 | PASS | test/foundation.e2e-spec.ts:116,137; "page=0"/"page=1.5" generated by it.each at :130 ('rejects page=%s with 400'; literal grep NOT FOUND) | 11 -> 4 passed | yes |
| GEN-07 | PASS | test/audit-uploads-currency.e2e-spec.ts:87,97,120,140,161 | 12 -> 5 passed | yes |
| GEN-08 | PASS | test/audit-uploads-currency.e2e-spec.ts:175,196,204,245 | 13 -> 4 passed | yes |
| GEN-13 | PASS | test/foundation.e2e-spec.ts:57,91,160; src/common/security/password-hasher.spec.ts:12 | 14 -> 3 passed; 15 -> 1 passed | yes |

Every run executed >=1 test, passed count equals the number of cited names, 0 failures, exit 0.

#### Command column "as written"
- Rendered (GitHub table, `\|` -> `|`): all 15 commands run and pass as above.
- Raw markdown source copied literally (`\|` kept): every multi-name command matches 0 tests and still exits 0
  (16.log foundation GEN-05 form -> "16 skipped, 16 total"; 17.log env.schema PAY-04 form -> "9 skipped, 9 total").
  Affects multi-name commands in PAY-01..04, ITN-18, GEN-05, GEN-07, GEN-08, GEN-13. Single-name commands are unaffected.

#### In-scope ids missing from traceability.md
- Requirements: none missing (PAY-01, PAY-02, PAY-03, PAY-04, GEN-02, GEN-05, GEN-07, GEN-08, GEN-13, ITN-18 all present).
- Jira: TRVL-128 and TRVL-136 absent. TRVL-129..135 present (Sprint-0 table L39-45; TRVL-133 also on ITN-18 row L20).

#### Findings (by severity)
1. MEDIUM: raw-source commands with `\|` run 0 tests and exit 0 (silent false green if copied from the .md source or a terminal cat).
2. LOW: TRVL-128 and TRVL-136 have no row in traceability.md.
3. LOW: PAY-04 and GEN-05 cite it.each-generated names; they run, but the literal names do not exist in source. it.each extras (0.1 minor units; page=x, page=-1) are not cited.
4. INFO: unescaped `.` in "10.5"/"1.5" and generic names like "is admin only" are regex-loose; counts still matched exactly here.

## 6. Ahmed-only actions

- TRVL-128: get each member to confirm they can connect to Atlas (A9). Tighten Atlas roles and the network access list (state.md risks).
- TRVL-136: code freeze 2026-11-18, bug bash, develop->main PR, tag v1.0.0-m1 on 2026-11-20, release notes. Close the main->develop back-merge PR.
- F18: rename or retire the off-pattern branches. Get approving reviews on PRs (or record the single-reviewer exception). Decide on enforce_admins and on adding helmet/@nestjs/throttler. Before 2026-11-20, make sure every member has merged commits under their own name (DLV-7: today git shortlog shows only Ahmed).
- F19: check commit ce0a259's credential against Atlas users; rotate it if real.
- Jira corrections (only after approval in chat): close Sprint 0. Move the 7 Done stories into Sprint 0 or record why they were done early. Reopen or annotate TRVL-130 (F8), TRVL-103 (F9), TRVL-102 (GEN-07-3..5), TRVL-135 (README demo) and TRVL-128 (A9). Assign the DLV-13 seeding owner.

### UNVERIFIABLE rows (14)
| CHK | statement | reason (V1) | how Ahmed verifies |
|---|---|---|---|
| PAY-03-20 | Refund status is shown on the booking details. | booking details belong to the bookings module, not on develop | After the bookings module merges: open a refunded booking in Swagger (GET booking details as owner) and check the refund status field; `grep -rn "REFUNDS_SERVICE" backend/src/modules --include=*.ts | grep -v modules/payments` must show the bookings consumer. |
| GEN-07-3 | Admin suspensions are recorded in the audit log. | ACC-15 suspension not on develop | After ACC-15 merges: suspend a user in Swagger as ADMIN, then GET /api/admin/audit-logs?action=<suspend action> shows one entry with actorId/targetId; `grep -rn "AUDIT_SERVICE" backend/src/modules | grep -v modules/audit` lists the caller. |
| GEN-07-4 | Admin deletions are recorded in the audit log. | GEN-10 deletion not on develop | After GEN-10 merges: delete a user/content item as ADMIN, then GET /api/admin/audit-logs filtered by that action returns the entry. |
| GEN-07-5 | Other A6 admin actions (reactivate, moderator create, password reset, report resolve, provider deactivate) are recorded. | A6 owning modules not on develop; zero callers today | As each A6 action merges (reactivate, moderator create, password reset, report resolve, provider deactivate): perform it in Swagger and confirm an audit entry; same grep as GEN-07-3. |
| TRVL-136-2 | The tag points to a commit on main. | needs the tag | After tagging: `git fetch --tags && git merge-base --is-ancestor v1.0.0-m1 origin/main && echo on-main`. |
| TRVL-136-5 | CI (build-lint-test) is green on the release commit. | needs the release commit | `gh run list --branch main --limit 1 --json headSha,conclusion` and compare headSha with `git rev-list -n1 v1.0.0-m1`; conclusion must be success. |
| TRVL-136-6 | openapi.json has no drift at the release commit. | the release commit does not exist yet | `git checkout v1.0.0-m1 && cd backend && npm ci && npm run openapi:export && git diff --exit-code ../docs/api/openapi.json` (exit 0). |
| TRVL-136-7 | Release happens by 2026-11-20. | not yet due | `git log -1 --format=%cI v1.0.0-m1` is on or before 2026-11-20; `gh release view v1.0.0-m1` shows release notes. |
| TRVL-136-8 | Code freeze and bug bash are completed. | Jira not checked | Jira: freeze announced 2026-11-18, bug-bash issues all Done; `gh pr list --base develop --state merged --search "merged:>2026-11-18"` lists only fix/ PRs. |
| TRVL-128-6 | The Atlas cluster is live and reachable. | needs live Atlas credentials | Atlas UI > Database > cluster status Active; locally `cd backend && npm run start:dev` with your own backend/.env and see Mongoose connect (do not paste the URI anywhere). |
| TRVL-128-7 | Each member has a database user. | needs the Atlas console | Atlas UI > Security > Database Access: one user per member, role limited to readWrite on the project database. |
| TRVL-128-8 | An IP access list is configured. | needs the Atlas console | Atlas UI > Security > Network Access: entries listed; no 0.0.0.0/0 unless deliberately accepted. |
| TRVL-128-9 | MONGODB_URI was shared privately with members. | shared out of band | Ask each member to confirm in the team chat that they received the URI privately and `npm run start:dev` connects (state.md A9). |
| DLV-2 | The backend connects to MongoDB Atlas. | live Atlas | `cd backend && npm run start:dev` with the Atlas URI in backend/.env; boot logs show MongooseModule initialised and GET /api/currencies/rates returns 200 (reads exchange_rates). |
