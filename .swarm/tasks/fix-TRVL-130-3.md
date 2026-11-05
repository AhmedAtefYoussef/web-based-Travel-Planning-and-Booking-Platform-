ID: fix-TRVL-130-3  MODEL: sonnet  DEPENDS: none  REQ: GEN-02, TRVL-130, TRVL-132  CTX: v2
BRANCH: fix/TRVL-130-common-tests (from origin/develop 6efa26b)
GOAL: Close common-layer test gaps and stop duplicate-key detail leaks.
CONTEXT: context.md ## test harness gotchas
INPUTS: report F15; backend/src/common/filters/all-exceptions.filter.ts:82,95
DELIVER: tests first: 500 body has exactly statusCode,error,message,path,timestamp; 11000 error lists no keys/values; /api prefix exercised through the real bootstrap; dates stored UTC; every stub provider resolves its contract token. Then the filter fix.
OWNS: backend/src/common/filters/**, backend/src/common/utils/dates*.ts, backend/src/common/stubs/**, backend/test/foundation.e2e-spec.ts
DONE WHEN: cd backend && npx jest src/common/filters src/common/utils src/common/stubs; npx jest --config test/jest-e2e.json test/foundation.e2e-spec.ts; npm run lint
REMEMBER: error shape {statusCode,error,message,fieldErrors?,path,timestamp}.
RULES: .swarm/rules.md
