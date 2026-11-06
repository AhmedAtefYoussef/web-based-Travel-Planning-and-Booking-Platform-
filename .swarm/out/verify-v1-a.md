ID: verify-v1-a  STATUS: done  CTX: v2
GOAL CHECK: 70 V1-A checks judged; 0 FAIL; table .swarm/verify/v1-a.md
CHANGED: none
EVIDENCE: targeted unit specs -> 94/94 (1-unit.log); payments + platform-currency e2e -> 47/47 (2-e2e.log); repo-consistency exit 0
COUNTS P/Pa/F/U: PAY-01 25/2/0/0 · PAY-02 8/2/0/0 · PAY-03 19/1/0/1 · PAY-04 10/2/0/0
NOTES: PARTIAL 01-26 env.schema.ts:70 accepts sk_live_ (test mode not enforced); 01-24 no payment-schema field test; 02-7 snapshot==shown policies unasserted; 02-8 rejected accept stores nothing unasserted; 03-2 no live-policy-change-after-acceptance test; 04-8 amountMinor integer not schema-enforced; 04-12 no-conversion by grep only. UNVERIFIABLE 03-20 no booking-details endpoint at 6efa26b.
