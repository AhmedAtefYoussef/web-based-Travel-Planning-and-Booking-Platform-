---
paths:
  - "backend/**/*.spec.ts"
  - "backend/test/**"
---
# Testing rules (Jest 30, ts-jest, supertest, mongodb-memory-server)

- Unit tests `*.spec.ts` beside the code: business rules with mocked models/contracts. e2e `backend/test/*.e2e-spec.ts`:
  the real Nest app via `test/utils/test-app.ts` on an in-memory replica set (transactions work), Stripe faked.
- Name tests after the behaviour in the requirement ("rejects a 6th image for a post with 400"), so traceability can run them
  by exact name. Keep names unique across the repo.
- For every endpoint cover: 401 without auth, 403 wrong role, 404 not owner / unknown id, 400 invalid DTO (assert `fieldErrors`),
  409 rule conflicts, and the happy path response shape.
- Concurrency rules: fire N parallel requests with `Promise.all` and assert the invariant (seats never negative, one winner).
- Time: never depend on the wall clock near boundaries; pass dates explicitly or use Jest fake timers.
- Fakes must behave like the real service where it matters (status values, idempotency, events). If production code depends
  on a provider behaviour, the fake models it; otherwise the test proves nothing.
- `require()` instead of dynamic `import()` in tests (ts-jest). App under test is created with `{ rawBody: true }`.
- Never `.only`, `.skip`, `xit`, or loosen an assertion to make a test pass. A failing test is a finding: fix the code or ask.
- Windows: run with `--runInBand`.
