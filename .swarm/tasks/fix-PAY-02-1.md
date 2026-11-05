ID: fix-PAY-02-1  MODEL: sonnet  DEPENDS: none  REQ: PAY-02, PAY-03, PAY-01  CTX: v2
BRANCH: fix/PAY-02-policy-tests (from origin/develop 6efa26b)
GOAL: Close policy/confirm test gaps; production code only if a new test fails.
CONTEXT: context.md ## test harness gotchas
INPUTS: report F12; checklist CHK-PAY-02-7, CHK-PAY-02-8, CHK-PAY-03-2
DELIVER: e2e asserting: accepted snapshot equals policies shown; rejected accept stores nothing; refund uses the accepted snapshot after live policy changes; duplicate payment_intent.succeeded -> one confirmation, no refund, one notification.
OWNS: backend/src/modules/payments/booking-policies.service.ts, backend/test/payments.e2e-spec.ts
DONE WHEN: cd backend && npx jest --config test/jest-e2e.json test/payments.e2e-spec.ts; npm run lint
REMEMBER: tests assert the xlsx statement, not the implementation.
RULES: .swarm/rules.md
