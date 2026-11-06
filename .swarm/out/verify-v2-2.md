ID: verify-v2-2  STATUS: done  CTX: v2
GOAL CHECK: 13 mutants over 11 rules; primary enforcement point of all 11 KILLED; 2 secondary mutants SURVIVED
CHANGED: none (throwaway .swarm/tmp/mutate-sprint0, status --porcelain empty)
EVIDENCE: logs .swarm/tmp/v2-2/*.log; table .swarm/verify/v2-2.md
NOTES: SURVIVED 5b refunds.service.ts:121 zero-refund guard in refundPayment (>0 -> >=0), no test with amount_received 0. SURVIVED 11b payments.service.ts:152 testConfirm production guard, no test with NODE_ENV=production (Leader grep confirms 0 tests). Weak: idempotent-confirm killed only by unit test (e2e misses duplicate succeeded); audit updateOne mutant caught only by 5 s timeout.
