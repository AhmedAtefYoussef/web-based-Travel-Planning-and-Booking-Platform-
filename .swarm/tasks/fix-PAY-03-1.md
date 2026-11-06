ID: fix-PAY-03-1  MODEL: opus  DEPENDS: none  REQ: PAY-03, PAY-01, PAY-04  CTX: v2
BRANCH: fix/PAY-03-refund-dedupe (from origin/develop 6efa26b)
GOAL: Make payments/refunds unique at the DB level and test refund guards.
CONTEXT: context.md ## decisions
INPUTS: report F4,F5,F13; backend/src/modules/payments/refunds.service.ts:78,101,121,127; backend/src/modules/payments/schemas.ts:17
DELIVER: failing specs first: refundFor twice -> one refunds.create; parallel refundFor+refundPayment -> one refund; amount_received 0 -> no Stripe call (kills mutant 5b); non-integer amountMinor rejected. Then: unique stripeId, partial unique PENDING payment per booking, partial unique active refund per paymentIntentId, one idempotency key per PI, integer validator.
OWNS: backend/src/modules/payments/refunds.service.ts, backend/src/modules/payments/refunds.service.spec.ts, backend/src/modules/payments/schemas.ts
DONE WHEN: cd backend && npx jest backend/src/modules/payments/refunds.service.spec.ts; npm test; npm run test:e2e; npm run lint
REMEMBER: never weaken existing tests.
RULES: .swarm/rules.md
