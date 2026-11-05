# Sprint 0 atomic checklist (SHA 6efa26b)

Source keys: `M!A<n>` = .swarm/verify/xlsx/Mandatory.csv row (authority); `reqs:<n>` = docs/requirements/reqs.json line ("acceptance");
`PD:L<n>` = docs/requirements/project-description.md; `PL:L<n>` = docs/requirements/plan.md; `CM:L<n>` = /CLAUDE.md;
`BC:L<n>` = backend/CLAUDE.md; `ST:L<n>` = .swarm/state.md (assumed defaults A1-A9); `JIRA` = Jira summary given by the Leader.
e2e = `cd backend && npm run test:e2e`; unit = `cd backend && npm test`. Swagger check = grep docs/api/openapi.json for `"summary": "[<ID>]`.

## V1-A Payments

### PAY-01
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-PAY-01-1 | POST /api/payments creates a Stripe PaymentIntent for the owner's Pending Payment flight booking. | M!A56; reqs:496; PD:L363 | e2e: seed flight booking Pending Payment, POST, assert 201 and fake-Stripe paymentIntents.create called |
| CHK-PAY-01-2 | POST /api/payments creates a PaymentIntent for the owner's Pending Payment hotel reservation. | M!A56; reqs:496 | e2e: same with type hotel, assert 201 |
| CHK-PAY-01-3 | POST /api/payments response returns the PaymentIntent clientSecret. | reqs:496; PL:L944 | e2e: assert body.clientSecret is a non-empty string |
| CHK-PAY-01-4 | No endpoint accepts card number/CVC fields; card data never reaches the backend. | M!A56; PL:L307 | grep -ri "cardNumber\|cvc\|card_number" backend/src returns nothing; DTO forbids unknown fields (400) |
| CHK-PAY-01-5 | PaymentIntent amount equals the booking total in integer minor units. | reqs:496 | unit/e2e: assert create called with amount === booking.totalMinor |
| CHK-PAY-01-6 | PaymentIntent currency equals PLATFORM_CURRENCY. | reqs:496; M!A98 | e2e: assert create called with currency === config PLATFORM_CURRENCY (lowercased per Stripe) |
| CHK-PAY-01-7 | Paying another user's booking is refused. | reqs:496; PL:L184 | e2e: user B POSTs for user A's booking, assert 404 (ownership miss) or 403 |
| CHK-PAY-01-8 | Paying a booking not in Pending Payment status is refused. | reqs:496 | e2e: booking Confirmed/Cancelled, assert 409/400 and no PI created |
| CHK-PAY-01-9 | Paying after the hold expired is refused. | M!A56; reqs:496; PL:L944 | e2e: holdExpiresAt in past, assert 409/400 and no PI created |
| CHK-PAY-01-10 | Paying before policies are accepted is refused (see CHK-PAY-02-9). | reqs:496; PL:L944 | e2e: policiesAcceptedAt null, assert 409/400 |
| CHK-PAY-01-11 | Webhook with an invalid Stripe signature is rejected and changes nothing. | reqs:496; BC:L26 | e2e: POST /api/payments/webhook with bad stripe-signature, assert 400, booking unchanged |
| CHK-PAY-01-12 | Webhook signature is verified against the raw request body (app created with rawBody:true). | BC:L26; PL:L310 | grep "rawBody: true" backend/src/main.ts and test app; e2e signs with real Stripe webhook util |
| CHK-PAY-01-13 | On payment_intent.succeeded the backend re-retrieves the PI and confirms only if status is succeeded. | reqs:496 | unit: retrieve mocked to return processing, assert markConfirmed not called |
| CHK-PAY-01-14 | A verified payment_intent.succeeded confirms the booking via markConfirmed. | M!A56; reqs:496; PD:L175 | e2e: signed succeeded event, assert booking status Confirmed |
| CHK-PAY-01-15 | Duplicate succeeded webhooks call markConfirmed exactly once (idempotent). | reqs:496; BC:L26 | e2e/unit: deliver same event twice, assert markConfirmed called once, single Confirmed state |
| CHK-PAY-01-16 | The booking is never confirmed by POST /api/payments or the client, only by the verified webhook. | M!A56; PD:L370-371 | e2e: after POST /api/payments booking still Pending Payment; grep markConfirmed callers = webhook handler only |
| CHK-PAY-01-17 | payment_intent.payment_failed marks the payment FAILED. | reqs:496; PL:L944 | e2e: signed failed event, assert payment.status FAILED |
| CHK-PAY-01-18 | After payment_failed the booking stays Pending Payment. | M!A56; reqs:496; PD:L177 | e2e: same test, assert booking.status Pending Payment |
| CHK-PAY-01-19 | POST /api/payments/:id/retry succeeds while the hold is unexpired. | M!A56; reqs:496; PD:L364 | e2e: failed payment, retry, assert 201 with new clientSecret |
| CHK-PAY-01-20 | POST /api/payments/:id/retry is refused after the hold expires. | M!A56; reqs:496 | e2e: expire hold, retry, assert 409/400 |
| CHK-PAY-01-21 | Retry cancels the previous PaymentIntent. | BC:L28 | unit: assert paymentIntents.cancel called with old PI id |
| CHK-PAY-01-22 | cancelForExpiredHold(paymentId) cancels the Stripe PaymentIntent. | M!A56; reqs:496; PL:L961 | unit: call method, assert paymentIntents.cancel called |
| CHK-PAY-01-23 | A late or superseded PI success triggers an automatic refund and never confirms the booking. | BC:L27 | e2e/unit: succeeded event for cancelled/expired PI, assert refunds.create called, booking not Confirmed |
| CHK-PAY-01-24 | Payment record stores only Stripe id, amountMinor, currency and status (no card data). | M!A56; reqs:496; PL:L314 | inspect payment schema in a unit test (schema.paths keys) or grep schema file for extra fields |
| CHK-PAY-01-25 | GET /api/payments/:id returns the payment to its owner. | PD:L365 | e2e: owner GET 200; other user 404/403 |
| CHK-PAY-01-26 | Stripe is used in test mode only. | M!A56; PD:L174 | grep .env.example STRIPE key placeholder is sk_test_…; env.schema rejects sk_live (if implemented); else note gap |
| CHK-PAY-01-27 | Swagger summaries of the 4 PAY-01 endpoints start with [PAY-01]. | CM:L27; BC:L30 | grep -c '"\[PAY-01\]' docs/api/openapi.json >= 4 |

### PAY-02
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-PAY-02-1 | GET /api/bookings/flight/:id/policies returns the airline cancellation tiers. | M!A57; reqs:507; PD:L361 | e2e: assert body has cancellation tiers array |
| CHK-PAY-02-2 | GET policies for a flight booking returns the airline baggage policy. | M!A57; reqs:507 | e2e: assert body.baggage present |
| CHK-PAY-02-3 | GET /api/bookings/hotel/:id/policies returns the hotel cancellation tiers. | M!A57; reqs:507 | e2e: assert tiers array |
| CHK-PAY-02-4 | GET policies for a hotel booking returns check-in and check-out times. | M!A57; reqs:507 | e2e: assert checkIn and checkOut fields |
| CHK-PAY-02-5 | Only the booking owner can read its policies. | reqs:507 | e2e: other user gets 404/403 |
| CHK-PAY-02-6 | POST .../accept-policies with accepted=true stores policiesAcceptedAt timestamp. | M!A57; reqs:507; PD:L362,L370 | e2e: assert booking.policiesAcceptedAt is a Date close to now |
| CHK-PAY-02-7 | Accepting policies stores a snapshot of the policies shown. | reqs:507; PL:L934 | e2e: assert booking.policySnapshot equals GET policies body |
| CHK-PAY-02-8 | accept-policies without accepted=true does not record acceptance. | M!A57 | e2e: accepted=false or missing, assert 400 and policiesAcceptedAt still null |
| CHK-PAY-02-9 | POST /api/payments returns 409/400 until policies are accepted. | M!A57; reqs:507 | e2e: pay before accept 409/400; after accept 201 |
| CHK-PAY-02-10 | Swagger summaries of both PAY-02 endpoints start with [PAY-02]. | CM:L27 | grep -c '"\[PAY-02\]' docs/api/openapi.json >= 2 |

### PAY-03
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-PAY-03-1 | RefundsService.refundFor(type,id,reason) exists and is exposed via REFUNDS_SERVICE token. | reqs:518; BC:L13 | grep REFUNDS_SERVICE backend/src/common/contracts; unit test calls refundFor |
| CHK-PAY-03-2 | USER cancellations use the tiers from the booking's accepted policy snapshot, not current policy. | reqs:518 | unit: change live policy after snapshot, assert refund uses snapshot tier |
| CHK-PAY-03-3 | USER refund % = tier with the highest daysBefore <= daysRemaining. | reqs:518; PL:L317-318 | unit: tiers 30/7/1 days, daysRemaining 10, assert 7-day tier % |
| CHK-PAY-03-4 | Exact boundary: daysRemaining equal to a tier's daysBefore selects that tier. | reqs:518 | unit: daysRemaining 7, assert 7-day tier % |
| CHK-PAY-03-5 | USER cancellation with no matching tier refunds 0%. | reqs:518; PL:L319 | unit: daysRemaining below every threshold, assert amount 0 |
| CHK-PAY-03-6 | PROVIDER-initiated cancellation refunds 100%. | M!A58; reqs:518; PL:L319 | unit: reason PROVIDER, assert amount === paid amountMinor |
| CHK-PAY-03-7 | daysRemaining is the calendar-day difference in the provider's time zone. | ST:L17; BC:L23 | unit on utils/dates.ts across a UTC/provider-tz midnight boundary |
| CHK-PAY-03-8 | A zero refund amount calls no Stripe API and creates no refund record. | M!A58; reqs:518 | unit: assert refunds.create not called, Refund model create not called |
| CHK-PAY-03-9 | A positive refund amount calls the Stripe Refunds API. | M!A58; reqs:518 | unit: assert stripe.refunds.create called with payment_intent and amount |
| CHK-PAY-03-10 | Refund amount is integer minor units in PLATFORM_CURRENCY. | M!A98; reqs:890 | unit: assert Number.isInteger(amount) and currency === PLATFORM_CURRENCY |
| CHK-PAY-03-11 | Refund amount is computed from the PaymentIntent amount_received. | BC:L28 | unit: amount_received differs from amount, assert refund uses amount_received |
| CHK-PAY-03-12 | Refunds are deduplicated per PaymentIntent. | BC:L28 | unit: call refundFor twice, assert one Stripe refund |
| CHK-PAY-03-13 | A new refund is recorded with status PENDING. | M!A58; reqs:518 | unit/e2e: assert refund doc status PENDING after refundFor |
| CHK-PAY-03-14 | Refund webhook success updates the refund to REFUNDED. | M!A58; reqs:518 | e2e: signed charge.refunded/refund.updated succeeded event, assert REFUNDED |
| CHK-PAY-03-15 | Refund webhook failure updates the refund to FAILED. | M!A58; reqs:518 | e2e: signed refund failed event, assert FAILED |
| CHK-PAY-03-16 | The user receives an in-app notification for the refund. | M!A58; reqs:518 | unit: assert NOTIFICATIONS_SERVICE.notify called with the booking owner id |
| CHK-PAY-03-17 | GET /api/refunds/:id returns the refund status to the booking owner. | reqs:518; PD:L367 | e2e: owner 200 with status |
| CHK-PAY-03-18 | GET /api/refunds/:id returns the refund status to an admin. | reqs:518 | e2e: admin role 200 |
| CHK-PAY-03-19 | GET /api/refunds/:id refuses other users. | reqs:518 | e2e: unrelated user 404/403 |
| CHK-PAY-03-20 | Refund status is shown on the booking details. | M!A58; PD:L179 | e2e on booking-details endpoint (Karim's module); UNVERIFIABLE in Payments alone if that endpoint is not on develop |
| CHK-PAY-03-21 | Swagger summary of GET /api/refunds/:id starts with [PAY-03]. | CM:L27 | grep '"\[PAY-03\]' docs/api/openapi.json |

### PAY-04
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-PAY-04-1 | PLATFORM_CURRENCY is read from the environment. | reqs:890; PL:L324 | grep PLATFORM_CURRENCY backend/src/config/env.schema.ts |
| CHK-PAY-04-2 | PLATFORM_CURRENCY is validated as an ISO currency code; an invalid value fails startup. | reqs:890; BC:L4 | unit on env schema: "XX1" rejected, "USD" accepted |
| CHK-PAY-04-3 | PLATFORM_CURRENCY defaults to USD. | CM:L19; ST:L14 | unit on env schema: unset value resolves to USD |
| CHK-PAY-04-4 | PLATFORM_CURRENCY is listed in /.env.example. | BC:L4; PD:L436-437 | node .github/scripts/repo-consistency.mjs (env.schema vs .env.example) |
| CHK-PAY-04-5 | PaymentIntents use only PLATFORM_CURRENCY. | M!A98; reqs:890 | see CHK-PAY-01-6 |
| CHK-PAY-04-6 | Payment records store currency = PLATFORM_CURRENCY. | M!A98; reqs:890 | e2e: assert payment.currency |
| CHK-PAY-04-7 | Refund records store currency = PLATFORM_CURRENCY. | M!A98; reqs:890 | unit: assert refund.currency |
| CHK-PAY-04-8 | All money amounts are stored as integer minor units. | reqs:890; CM:L19 | grep schemas for *Minor fields typed Number with integer validator; unit on money.ts |
| CHK-PAY-04-9 | Non-integer money amounts are rejected. | reqs:890 | unit on money.ts / DTO: 10.5 -> error/400 |
| CHK-PAY-04-10 | Negative money amounts are rejected. | reqs:890 | unit on money.ts / DTO: -1 -> error/400 |
| CHK-PAY-04-11 | Minor-unit conversion uses the per-currency exponent from common/utils/money.ts. | CM:L19; BC:L23 | unit: USD exponent 2, JPY exponent 0 (1000 JPY -> 1000 minor) |
| CHK-PAY-04-12 | Flight and hotel booking prices are not converted to other currencies. | M!A69; M!A98 | grep CURRENCY_SERVICE usage: none in payments/refunds/booking price paths |

## V1-B Foundation

### GEN-02
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-GEN-02-1 | Any DTO validation failure returns HTTP 400. | reqs:774 | e2e foundation: POST invalid body, assert 400 |
| CHK-GEN-02-2 | Error body contains statusCode. | reqs:774; CM:L21; PL:L182 | e2e: assert body.statusCode === 400 |
| CHK-GEN-02-3 | Error body contains error. | reqs:774; CM:L21 | e2e: assert typeof body.error === "string" |
| CHK-GEN-02-4 | Error body contains message. | reqs:774; CM:L21 | e2e: assert body.message present |
| CHK-GEN-02-5 | Validation errors include fieldErrors as an array of {field,message}. | M!A86; reqs:774; PL:L183 | e2e: assert fieldErrors[0] has field and message strings |
| CHK-GEN-02-6 | Error body contains path equal to the request path. | reqs:774; CM:L21 | e2e: assert body.path === requested URL |
| CHK-GEN-02-7 | Error body contains an ISO timestamp. | reqs:774; CM:L21 | e2e: assert !isNaN(Date.parse(body.timestamp)) |
| CHK-GEN-02-8 | Nested field errors use dotted paths. | reqs:774 | e2e: invalid nested DTO, assert field like "passengers.0.name" |
| CHK-GEN-02-9 | Non-validation errors use the same shape without fieldErrors. | CM:L21; PL:L178 | e2e: 404 route, assert keys statusCode,error,message,path,timestamp |
| CHK-GEN-02-10 | Duplicate key errors map to 409. | PL:L184 | unit on AllExceptionsFilter with Mongo E11000 error -> 409 |
| CHK-GEN-02-11 | A malformed ObjectId returns 400. | PL:L184 | e2e: GET /api/admin/audit-logs?actor=abc or :id=abc via ParseObjectIdPipe -> 400 |
| CHK-GEN-02-12 | Unhandled exceptions return 500 in the same shape. | PL:L178 | unit on AllExceptionsFilter with plain Error -> 500 shape |

### GEN-05
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-GEN-05-1 | List endpoints accept ?page=N. | reqs:803; CM:L21 | e2e: GET /api/admin/audit-logs?page=2 -> 200, body.page 2 |
| CHK-GEN-05-2 | page defaults to 1 when omitted. | reqs:803 | e2e: no page param, assert body.page === 1 |
| CHK-GEN-05-3 | page below 1 is rejected with 400. | reqs:803 | e2e: page=0 -> 400 |
| CHK-GEN-05-4 | A non-integer page is rejected with 400. | reqs:803 | e2e: page=1.5 -> 400 |
| CHK-GEN-05-5 | Page size is fixed at 10 items. | M!A89; reqs:803; CM:L21 | e2e: seed 11 entries, page 1 has 10 items, page 2 has 1 |
| CHK-GEN-05-6 | A limit parameter other than 10 returns 400. | ST:L19 | e2e: ?limit=50 -> 400 (see notes: conflicts with traceability wording) |
| CHK-GEN-05-7 | Response envelope has items, page, limit, total, totalPages. | reqs:803; PL:L195-196 | e2e: assert all five keys |
| CHK-GEN-05-8 | Response limit is always 10. | reqs:803 | e2e: assert body.limit === 10 |
| CHK-GEN-05-9 | totalPages equals ceil(total/10). | reqs:803 | e2e: total 11 -> totalPages 2 |
| CHK-GEN-05-10 | Every list endpoint uses the shared PaginationQueryDto. | reqs:803; PL:L192-193 | grep "@Get" list handlers in backend/src/modules; each uses PaginationQueryDto |

### GEN-13
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-GEN-13-1 | Global ValidationPipe is registered with whitelist:true. | reqs:910; BC:L5 | grep setup-app.ts; e2e covered by CHK-GEN-13-2 |
| CHK-GEN-13-2 | Unknown body fields are rejected with 400 (forbidNonWhitelisted). | reqs:910 | e2e: extra field -> 400 with fieldErrors |
| CHK-GEN-13-3 | Sending role in a body is rejected with 400 (no mass assignment). | reqs:910; PL:L176 | e2e: body {role:"ADMIN"} -> 400 |
| CHK-GEN-13-4 | ValidationPipe transform is enabled (query strings become typed values). | reqs:910 | e2e: page="2" arrives as number 2 in envelope |
| CHK-GEN-13-5 | Routes require authentication by default (deny-by-default guard). | reqs:910 | e2e: protected route without credentials -> 401 |
| CHK-GEN-13-6 | Routes marked @Public are reachable without authentication. | reqs:910 | e2e: public route without credentials -> 200 |
| CHK-GEN-13-7 | Authorisation is enforced server-side: wrong role gets 403. | M!A100 | e2e: non-admin GET /api/admin/audit-logs -> 403 |
| CHK-GEN-13-8 | Passwords are hashed with salted bcrypt. | M!A100; reqs:910; PL:L228 | unit on PasswordHasher: hash matches /^\$2[aby]\$/ |
| CHK-GEN-13-9 | Hashing the same password twice yields different hashes (salt). | M!A100 | unit: hash(p) !== hash(p), both verify true |
| CHK-GEN-13-10 | Plaintext passwords are never stored. | M!A100; reqs:910 | unit: hash !== plaintext; grep user schema has passwordHash, no password field |

### TRVL-129
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-129-1 | backend/ is a Nest CLI project. | JIRA; PL:L865 | ls backend/nest-cli.json backend/package.json |
| CHK-TRVL-129-2 | frontend/ exists as an M2 placeholder. | PL:L865; PD:L470 | ls frontend/ |
| CHK-TRVL-129-3 | docs/requirements/ exists. | PL:L865 | ls docs/requirements |
| CHK-TRVL-129-4 | docs/api/ exists. | PL:L865 | ls docs/api |
| CHK-TRVL-129-5 | AI_PROMPTS.txt exists at repo root. | PL:L865; PD:L549 | ls AI_PROMPTS.txt |
| CHK-TRVL-129-6 | README.md exists at repo root. | PL:L865 | ls README.md |
| CHK-TRVL-129-7 | .env.example exists at repo root. | PL:L865; PD:L437 | ls .env.example |
| CHK-TRVL-129-8 | .gitignore ignores .env files. | PD:L436 | git check-ignore backend/.env |
| CHK-TRVL-129-9 | Long-lived branches main and develop exist on origin. | PD:L481-483; PL:L883 | git ls-remote --heads origin main develop |
| CHK-TRVL-129-10 | main is protected requiring a PR with 1 approval. | JIRA; PL:L883 | read-only: gh api repos/{owner}/{repo}/branches/main/protection; else UNVERIFIABLE here (needs admin token) |
| CHK-TRVL-129-11 | develop is protected requiring a PR with 1 approval. | JIRA; PL:L883 | read-only: gh api repos/{owner}/{repo}/branches/develop/protection |

### TRVL-130
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-130-1 | Environment config is validated at startup and fails fast on a missing variable. | PL:L888; BC:L4 | unit on env.schema: missing MONGODB_URI -> validation error |
| CHK-TRVL-130-2 | All routes are served under the /api prefix. | PL:L888 | e2e: GET /api/... 200 ; grep setGlobalPrefix('api') |
| CHK-TRVL-130-3 | Global ValidationPipe is applied (see GEN-13). | PL:L888 | see CHK-GEN-13-1..4 |
| CHK-TRVL-130-4 | Global AllExceptionsFilter emits fieldErrors (see GEN-02). | PL:L888 | see CHK-GEN-02-* |
| CHK-TRVL-130-5 | Pagination with page size 10 is provided as a shared DTO (see GEN-05). | PL:L888 | see CHK-GEN-05-* |
| CHK-TRVL-130-6 | ParseObjectIdPipe rejects malformed ids with 400. | PL:L888 | unit on the pipe; see CHK-GEN-02-11 |
| CHK-TRVL-130-7 | Money utilities exist in common/utils/money.ts (see PAY-04). | PL:L888; CM:L19 | ls + unit spec for money.ts |
| CHK-TRVL-130-8 | Date utilities exist and store times in UTC. | PL:L888; BC:L23 | unit spec for utils/dates.ts |
| CHK-TRVL-130-9 | Swagger UI is served by the app. | PL:L894; PD:L236 | e2e: GET Swagger UI path -> 200 HTML |
| CHK-TRVL-130-10 | Swagger declares cookie authentication. | PL:L894 | grep docs/api/openapi.json securitySchemes for an apiKey "in": "cookie" |
| CHK-TRVL-130-11 | ESLint and Prettier are configured and lint passes. | PL:L894 | cd backend && npm run lint (exit 0) |
| CHK-TRVL-130-12 | A pull-request template exists. | PL:L894 | ls .github/pull_request_template.md (or PULL_REQUEST_TEMPLATE/) |
| CHK-TRVL-130-13 | Build succeeds and produces dist/main.js. | BC:L9 | cd backend && npm run build && test -f dist/main.js |
| CHK-TRVL-130-14 | docs/api/openapi.json is in sync with the code. | CM:L27; BC:L31 | cd backend && npm run openapi:export && git diff --exit-code docs/api/openapi.json |
| CHK-TRVL-130-15 | Every Swagger operation summary starts with [ID]. | CM:L27; BC:L30 | node script/grep: every "summary" in openapi.json matches ^\[[A-Z]+-\d+[a-z]?\] |

### TRVL-131
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-131-1 | @Public decorator exists and exempts a route from authentication. | JIRA; PL:L895 | see CHK-GEN-13-6; grep common/decorators |
| CHK-TRVL-131-2 | @Roles decorator restricts a route to listed roles (others 403). | JIRA; PL:L895 | e2e: x-dev-role USER on @Roles(ADMIN) route -> 403 |
| CHK-TRVL-131-3 | @CurrentUser injects the authenticated user into handlers. | JIRA; PL:L895 | unit/e2e: handler receives id from x-dev-user-id |
| CHK-TRVL-131-4 | Temporary DevAuthGuard reads x-dev-user-id, x-dev-role and x-dev-provider headers. | BC:L19 | e2e: headers set -> request authenticated with those values |
| CHK-TRVL-131-5 | Dev headers work only with DEV_AUTH_ENABLED=true and NODE_ENV development or test. | BC:L19 | unit: DEV_AUTH_ENABLED=false -> 401 with headers |
| CHK-TRVL-131-6 | Dev headers are refused in production. | BC:L20 | unit: NODE_ENV=production -> guard rejects or app refuses to start |
| CHK-TRVL-131-7 | Non-public route without dev headers returns 401. | BC:L19; reqs:910 | e2e: no headers -> 401 |
| CHK-TRVL-131-8 | Swagger "Authorize" exposes the dev headers. | BC:L19 | grep openapi.json securitySchemes for x-dev-user-id |

### TRVL-132
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-132-1 | common/contracts defines the PAYABLE_BOOKING token and PayableBooking interface. | JIRA; PL:L928-931; BC:L12 | grep -r PAYABLE_BOOKING backend/src/common/contracts |
| CHK-TRVL-132-2 | common/contracts defines POLICIES_PROVIDER. | BC:L12 | grep |
| CHK-TRVL-132-3 | common/contracts defines NOTIFICATIONS_SERVICE. | BC:L12 | grep |
| CHK-TRVL-132-4 | common/contracts defines PAYMENTS_SERVICE and REFUNDS_SERVICE. | BC:L13 | grep |
| CHK-TRVL-132-5 | common/contracts defines CURRENCY_SERVICE. | BC:L13 | grep |
| CHK-TRVL-132-6 | common/contracts defines AUDIT_SERVICE and UPLOADS_SERVICE. | BC:L13 | grep |
| CHK-TRVL-132-7 | ContractStubsModule provides a stub for every not-yet-implemented token. | BC:L6,L14 | unit: Test.createTestingModule with ContractStubsModule resolves each token |
| CHK-TRVL-132-8 | Real services replace stubs via { provide: TOKEN, useExisting }. | BC:L14 | grep useExisting in backend/src/modules/*/*.module.ts |
| CHK-TRVL-132-9 | No module imports another module's files. | CM:L20 | grep -rE "from '\.\./\.\./modules/|from '\.\./(?!\.)[a-z-]+/" backend/src/modules (expect none across module dirs) |

## V1-C Cross-cutting

### GEN-07
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-GEN-07-1 | AuditService.record accepts actorId, action, targetType, targetId and metadata. | reqs:823; PL:L903 | unit: record() persists all five fields |
| CHK-GEN-07-2 | Audit entries are append-only (no update or delete path). | reqs:823 | grep AuditService/controller for update/delete methods (none); schema immutable or pre-update hook throws |
| CHK-GEN-07-3 | Admin suspensions are recorded in the audit log. | M!A91; ST:L18 | e2e (ACC-15 owner): suspend account, assert audit entry; UNVERIFIABLE if ACC-15 not on develop |
| CHK-GEN-07-4 | Admin deletions are recorded in the audit log. | M!A91; ST:L18 | e2e (GEN-10 owner): delete content, assert audit entry |
| CHK-GEN-07-5 | Other A6 admin actions (reactivate, moderator create, password reset, report resolve, provider deactivate) are recorded. | ST:L18 | grep AUDIT_SERVICE callers per action; flag missing |
| CHK-GEN-07-6 | GET /api/admin/audit-logs is available to admins. | reqs:823; PD:L295 | e2e: admin -> 200 |
| CHK-GEN-07-7 | GET /api/admin/audit-logs returns 403 for non-admins. | reqs:823 | e2e: USER role -> 403 |
| CHK-GEN-07-8 | Audit log list is paginated (GEN-05 envelope). | reqs:823 | e2e: assert envelope keys, limit 10 |
| CHK-GEN-07-9 | Audit log list is ordered newest-first. | reqs:823 | e2e: two entries, assert items[0].createdAt >= items[1].createdAt |
| CHK-GEN-07-10 | Audit log list filters by actor. | reqs:823; PL:L903 | e2e: ?actor=<id> returns only that actor |
| CHK-GEN-07-11 | Audit log list filters by action. | reqs:823 | e2e: ?action=X returns only X |
| CHK-GEN-07-12 | Audit log list filters by date range. | reqs:823 | e2e: from/to excludes out-of-range entries |
| CHK-GEN-07-13 | Swagger summary of the audit-log endpoint starts with [GEN-07]. | CM:L27 | grep '"\[GEN-07\]' docs/api/openapi.json |

### GEN-08
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-GEN-08-1 | JPG uploads are accepted. | M!A92; reqs:834 | e2e/unit: valid JPEG buffer -> 201 with URL |
| CHK-GEN-08-2 | PNG uploads are accepted. | M!A92; reqs:834 | e2e/unit: valid PNG buffer -> 201 |
| CHK-GEN-08-3 | Other formats (e.g. GIF, PDF) are rejected with 400. | M!A92; reqs:834 | unit: GIF buffer -> 400 |
| CHK-GEN-08-4 | File type is verified by MIME type. | reqs:834; PL:L911 | unit: wrong mimetype with PNG bytes -> 400 |
| CHK-GEN-08-5 | File type is verified by magic bytes (renamed non-image rejected). | reqs:834; PL:L911 | unit: text file named x.png with image/png mimetype -> 400 |
| CHK-GEN-08-6 | A file of exactly 5 MB is accepted. | M!A92; reqs:834 | unit: 5*1024*1024 bytes -> accepted |
| CHK-GEN-08-7 | A file over 5 MB is rejected with 400. | M!A92; reqs:834 | unit: 5 MB + 1 byte -> 400 |
| CHK-GEN-08-8 | A post accepts at most 5 images; the 6th is rejected. | M!A92; reqs:834 | unit on UploadsService limit for type post |
| CHK-GEN-08-9 | An activity accepts at most 5 images; the 6th is rejected. | M!A92; reqs:834 | unit for type activity |
| CHK-GEN-08-10 | A hotel accepts at most 5 images; the 6th is rejected. | M!A92; reqs:834 | unit for type hotel |
| CHK-GEN-08-11 | An airline accepts at most 1 logo; a 2nd is rejected. | M!A92; reqs:834 | unit for type airline-logo |
| CHK-GEN-08-12 | Uploaded files are stored on the server under UPLOAD_DIR. | M!A92; reqs:834 | unit/e2e: file exists under UPLOAD_DIR; UPLOAD_DIR in env.schema and .env.example |
| CHK-GEN-08-13 | Uploaded files are served by URL. | M!A92; reqs:834; PL:L911 | e2e: GET returned URL -> 200 image content-type |
| CHK-GEN-08-14 | Rejections return 400 with a clear message in the standard error shape. | M!A92; reqs:834 | e2e: assert message names the violated limit |
| CHK-GEN-08-15 | Upload endpoints' Swagger summaries reference GEN-08 or the owning [ID]. | CM:L27; PD:L386,L420 | grep openapi.json image endpoints summaries |

### ITN-18 (exchange-rates part only)
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-ITN-18-1 | CurrencyService.convert(amountMinor,from,to) returns {amountMinor, rate, rateDate}. | reqs:619; PL:L915 | unit: assert result keys |
| CHK-ITN-18-2 | Converted amountMinor is an integer honoring each currency's exponent. | CM:L19; BC:L23 | unit: USD->JPY conversion uses exponents 2 and 0 |
| CHK-ITN-18-3 | Rates are fetched from FXRatesAPI. | M!A69; PD:L191-192 | unit with mocked HTTP: assert FXRatesAPI URL called |
| CHK-ITN-18-4 | Rates are fetched once per day by a scheduled job. | M!A69; PL:L303 | grep @Cron in currency module (daily expression); unit triggers job |
| CHK-ITN-18-5 | Fetched rates are cached in MongoDB (exchange_rates). | M!A69; reqs:619; PL:L918 | unit/e2e with memory Mongo: after fetch, collection has a doc |
| CHK-ITN-18-6 | The rate date is stored and returned. | M!A69; reqs:619 | unit: rateDate equals fetched rate date |
| CHK-ITN-18-7 | When the API fails, the last cached rates are used. | M!A69; reqs:619; PD:L194 | unit: HTTP mock throws, cached doc exists -> convert succeeds with old rateDate |
| CHK-ITN-18-8 | No cached rates and API down yields a handled error, not a crash. | PD:L194 | unit: empty cache + HTTP failure -> HttpException in error shape |
| CHK-ITN-18-9 | An unsupported currency code returns 400. | reqs:619; PD:L194 | unit/e2e: to="XXX" -> 400 |
| CHK-ITN-18-10 | GET /api/currencies returns the supported currency list. | reqs:619; PL:L915 | e2e: 200 non-empty array of ISO codes |
| CHK-ITN-18-11 | GET /api/currencies/rates returns rates with the rate date. | reqs:619 | e2e: assert rateDate in body |
| CHK-ITN-18-12 | Swagger summaries of currency endpoints start with [ITN-18]. | CM:L27 | grep '"\[ITN-18\]' docs/api/openapi.json >= 2 |

### TRVL-133
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-133-1 | CurrencyModule exists and is wired into app.module.ts. | JIRA; PL:L915 | grep CurrencyModule backend/src/app.module.ts |
| CHK-TRVL-133-2 | CurrencyModule provides CURRENCY_SERVICE with the real service (not the stub). | BC:L13-14 | grep useExisting CURRENCY_SERVICE in currency module |
| CHK-TRVL-133-3 | FXRatesAPI settings come from env and are listed in .env.example. | M!A69 ("configured"); BC:L4 | node .github/scripts/repo-consistency.mjs; grep FX in env.schema |
| CHK-TRVL-133-4 | Tests mock the FXRatesAPI HTTP call (no live network). | BC:L35 | grep currency spec for HTTP mock |
| CHK-TRVL-133-5 | The supported currency list is seeded. | PL:L915 | grep seed script/data for currencies |
| CHK-TRVL-133-6 | Unit tests cover the cached-fallback path. | JIRA | cd backend && npx jest currency -t fallback (passes) |

## V1-D Docs and delivery

### TRVL-134
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-134-1 | docs/requirements/traceability.md exists. | JIRA; PL:L1823 | ls |
| CHK-TRVL-134-2 | Each in-scope requirement has a traceability row with ID, test name and command. | CM (Members: traceability rows); JIRA | node .github/scripts/repo-consistency.mjs; grep each REQ id in traceability.md |
| CHK-TRVL-134-3 | Each traceability command runs green. | JIRA | run each row's jest command; all PASS |
| CHK-TRVL-134-4 | ERD exists at docs/architecture/erd.md. | JIRA; PL:L1821 | ls |
| CHK-TRVL-134-5 | Module map exists at docs/architecture/module-map.md. | PL:L1821 | ls |
| CHK-TRVL-134-6 | An ADR for auth exists. | PL:L1821-1822 | ls docs/architecture/adr-001* |
| CHK-TRVL-134-7 | An ADR for concurrency exists. | PL:L1821-1822 | ls docs/architecture/adr-002* |
| CHK-TRVL-134-8 | An ADR for payments exists. | PL:L1821-1822 | ls docs/architecture/adr-003* |
| CHK-TRVL-134-9 | An ADR for money/time exists. | PL:L1821-1822 | ls docs/architecture/adr-004* |

### TRVL-135
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-135-1 | README contains backend setup instructions. | JIRA; PD:L602 | grep -i "npm ci\|setup" README.md |
| CHK-TRVL-135-2 | README documents the required environment variables via .env.example. | PD:L436-437 | grep .env.example README.md |
| CHK-TRVL-135-3 | A Swagger demo script exists. | JIRA; BC:L9 | ls backend/scripts/demo-server* and README reference |
| CHK-TRVL-135-4 | AI_PROMPTS.txt entries are delimited by ===== separator lines. | PD:L551-567 | node .github/scripts/repo-consistency.mjs (AI_PROMPTS format) |
| CHK-TRVL-135-5 | Every AI_PROMPTS entry has a Date: field. | PD:L553 | same script; grep -c "^Date:" |
| CHK-TRVL-135-6 | Every entry has a Student: field. | PD:L554 | same |
| CHK-TRVL-135-7 | Every entry has a Tool: field. | PD:L555 | same |
| CHK-TRVL-135-8 | Every entry has a Related Requirement: field. | PD:L556 | same |
| CHK-TRVL-135-9 | Every entry has a Prompt: section. | PD:L557 | same |
| CHK-TRVL-135-10 | Every entry has a How the output was used: section. | PD:L559 | same |
| CHK-TRVL-135-11 | AI_PROMPTS.txt contains no secrets, passwords or tokens. | PD:L573 | grep -iE "mongodb(\+srv)?://[^<]|sk_(live|test)_[A-Za-z0-9]|password=" AI_PROMPTS.txt (none) |
| CHK-TRVL-135-12 | Every AI-assisted change has an AI_PROMPTS entry. | CM:L26 | UNVERIFIABLE fully here: spot-check git log [AGENT] commits vs entries |

### TRVL-136
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-136-1 | Tag v1.0.0-m1 exists. | JIRA; PL:L974 | git ls-remote --tags origin v1.0.0-m1 (expected absent before 2026-11-20) |
| CHK-TRVL-136-2 | The tag points to a commit on main. | PL:L974; CM:L24 | git branch -r --contains v1.0.0-m1 includes origin/main |
| CHK-TRVL-136-3 | develop is merged into main by PR only at the release. | CM:L24; PD:L513 | gh pr list --base main --state merged (read-only) |
| CHK-TRVL-136-4 | The main -> develop back-merge PR is closed after release. | CM:L24 | gh pr list --base develop --head main --state all |
| CHK-TRVL-136-5 | CI (build-lint-test) is green on the release commit. | CM Map (.github) | gh run list --branch main --limit 1 (read-only) |
| CHK-TRVL-136-6 | openapi.json has no drift at the release commit. | CM:L27 | see CHK-TRVL-130-14 on the tagged commit |
| CHK-TRVL-136-7 | Release happens by 2026-11-20. | JIRA; PD:L223 | git log -1 --format=%ci v1.0.0-m1 <= 2026-11-20 |
| CHK-TRVL-136-8 | Code freeze and bug bash are completed. | JIRA; PL:L974 | UNVERIFIABLE here: Jira state |

### TRVL-128 (config side)
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-TRVL-128-1 | MONGODB_URI is required by env.schema. | PD:L434; BC:L4 | unit on env schema: missing -> error |
| CHK-TRVL-128-2 | .env.example lists MONGODB_URI with a placeholder, no credentials. | PD:L434-437; CM:L25 | grep MONGODB_URI .env.example shows <user>:<password> style placeholder |
| CHK-TRVL-128-3 | env.schema accepts both mongodb+srv and direct-host URIs. | BC:L40 | unit: both forms validate |
| CHK-TRVL-128-4 | No real connection string is committed in tracked files. | PD:L519; CM:L25 | git grep -nE "mongodb(\+srv)?://[^<\s]+:[^<\s]+@" (expect none) |
| CHK-TRVL-128-5 | .env is gitignored and untracked. | PD:L436 | git ls-files | grep -E "(^|/)\.env$" (none) |
| CHK-TRVL-128-6 | The Atlas cluster is live and reachable. | JIRA; PD:L430 | UNVERIFIABLE here: needs Atlas credentials |
| CHK-TRVL-128-7 | Each member has a database user. | PL:L862 | UNVERIFIABLE here: Atlas console (ST:L21 says confirmations not collected) |
| CHK-TRVL-128-8 | An IP access list is configured. | PL:L862 | UNVERIFIABLE here: Atlas console |
| CHK-TRVL-128-9 | MONGODB_URI was shared privately with members. | JIRA; PD:L431-432 | UNVERIFIABLE here: out-of-band |

### DLV (project-description deliverables)
| CHK id | statement | source | how to verify |
|---|---|---|---|
| CHK-DLV-1 | A NestJS backend implements the mandatory API tables. | PD:L599; PD:L260-438 | compare openapi.json paths to PD API tables (count mandatory rows present) |
| CHK-DLV-2 | The backend connects to MongoDB Atlas. | PD:L600 | UNVERIFIABLE here: live Atlas; app boot uses MONGODB_URI |
| CHK-DLV-3 | REST API is documented with Swagger. | PD:L601 | see CHK-TRVL-130-9, -14 |
| CHK-DLV-4 | Backend is demonstrable through Swagger UI. | PD:L605 | run demo-server script, GET Swagger UI 200 |
| CHK-DLV-5 | README has setup instructions. | PD:L602 | see CHK-TRVL-135-1 |
| CHK-DLV-6 | AI_PROMPTS.txt is updated. | PD:L603 | git log -1 -- AI_PROMPTS.txt recent; format script passes |
| CHK-DLV-7 | Git history shows contributions from team members. | PD:L604; PD:L537 | git shortlog -sn origin/develop |
| CHK-DLV-8 | Feature branches follow feature/<ID>-… or fix/<ID>-… off develop. | PD:L486-491; CM:L23 | git branch -r | grep -vE "feature/[A-Z]+-[0-9]+|fix/|chore/|docs/|main|develop" |
| CHK-DLV-9 | Commits use Conventional Commits with [REQ-ID]. | PD:L523; CM:L23 | git log origin/develop --format=%s | grep -vE "^(feat|fix|docs|chore|refactor|test|ci|build|perf|style)(\(.+\))?!?: .+\[[A-Z]+(-[0-9]+)?\]" |
| CHK-DLV-10 | PRs reference requirement IDs. | PD:L518 | node .github/scripts/pr-requirements.mjs logic; gh pr list --json title,body (read-only) |
| CHK-DLV-11 | PRs are reviewed and merged by the team leader. | PD:L520; CM:L24 | gh pr list --state merged --json mergedBy,reviews |
| CHK-DLV-12 | No secrets or environment files are committed. | PD:L519 | see CHK-TRVL-128-4, -5; git ls-files | grep -iE "\.env$|team-db-access|\.pem$" |
| CHK-DLV-13 | The database is seeded with the official reference datasets (countries, cities, airports, attractions). | PD:L123-127 | grep seed scripts for the 4 datasets; UNVERIFIABLE on Atlas here |
| CHK-DLV-14 | Repo consistency checks pass. | CM Commands | node .github/scripts/repo-consistency.mjs (exit 0) |

## Counts
| REQ | checks |
|---|---|
| PAY-01 | 27 |
| PAY-02 | 10 |
| PAY-03 | 21 |
| PAY-04 | 12 |
| GEN-02 | 12 |
| GEN-05 | 10 |
| GEN-13 | 10 |
| TRVL-129 | 11 |
| TRVL-130 | 15 |
| TRVL-131 | 8 |
| TRVL-132 | 9 |
| GEN-07 | 13 |
| GEN-08 | 15 |
| ITN-18 | 12 |
| TRVL-133 | 6 |
| TRVL-134 | 9 |
| TRVL-135 | 12 |
| TRVL-136 | 8 |
| TRVL-128 | 9 |
| DLV | 14 |
| **Total** | **243** |
