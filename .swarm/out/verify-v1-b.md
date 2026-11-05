ID: verify-v1-b  STATUS: done  CTX: v2
GOAL CHECK: 75 V1-B checks judged; table .swarm/verify/v1-b.md
CHANGED: none
EVIDENCE: 10 targeted unit + 3 targeted e2e runs -> green; lint 0 errors; gh api protection -> 1 approval on main and develop, enforce_admins=false
COUNTS P/Pa/F/U: GEN-02 11/1/0/0 · GEN-05 9/1/0/0 · GEN-13 9/1/0/0 · TRVL-129 11/0/0/0 · TRVL-130 10/2/1/2 · TRVL-131 7/1/0/0 · TRVL-132 8/1/0/0
NOTES: FAIL 130-10 no cookie auth scheme (setup-swagger.ts:32 bearer only). PARTIAL GEN-05-10 /api/currencies no PaginationQueryDto; GEN-13-10 no account schema; 130-2 /api prefix in main.ts untested; 131-5 generic throw, prod only; 132-7 stub tokens unresolved in tests; 130-8 UTC unasserted; GEN-02-12 500 body keys partial. UNVERIFIABLE 130-13/14 (shared worktree) -> Leader gate covers.
