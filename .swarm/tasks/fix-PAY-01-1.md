ID: fix-PAY-01-1  MODEL: opus  DEPENDS: none  REQ: PAY-01, PAY-04  CTX: v2
BRANCH: fix/PAY-01-amount-crosscheck (from origin/develop 6efa26b)
GOAL: Payments confirm only on matching amount/currency, fail closed without webhook secret, prod-guard testConfirm.
CONTEXT: context.md ## decisions; api.md ## payments
INPUTS: docs/verification/sprint0-verification-report.md F1,F2,F3,F17; backend/src/modules/payments/payments.service.ts:68-76,138,152,171,200,219-262
DELIVER: failing specs first, then fixes: amount_received/currency mismatch -> no markConfirmed (refund+log); reused PI with changed total recreated; empty webhook secret -> reject; testConfirm refused in production; 404 for payments of other users; cancelIntent on expiry; no silent placeholder key.
OWNS: backend/src/modules/payments/payments.service.ts, backend/src/modules/payments/payments.service.spec.ts, backend/src/modules/payments/payments.controller.ts, backend/src/modules/payments/stripe.provider.ts
DONE WHEN: cd backend && npx jest backend/src/modules/payments/payments.service.spec.ts; npm run lint; npm test; npm run test:e2e
REMEMBER: Stripe mocked; integer minor units.
RULES: .swarm/rules.md
