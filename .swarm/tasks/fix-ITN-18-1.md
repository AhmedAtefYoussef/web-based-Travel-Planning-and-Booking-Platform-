ID: fix-ITN-18-1  MODEL: sonnet  DEPENDS: none  REQ: ITN-18, GEN-05, TRVL-133  CTX: v2
BRANCH: fix/ITN-18-currency-gaps (from origin/develop 6efa26b)
GOAL: Currency endpoint paginated; daily refresh and provider config tested.
CONTEXT: context.md ## test harness gotchas
INPUTS: report F16; .swarm/verify/xlsx/Mandatory.csv rows 69, 89
DELIVER: tests first: GET /api/currencies uses PaginationQueryDto (limit!=10 -> 400); the @Cron daily job calls the refresh; FXRatesAPI base URL from config is used (mocked HTTP). Decide seeded vs constant currency list in the PR text.
OWNS: backend/src/modules/currency/**, backend/test/currency-no-rates.e2e-spec.ts
DONE WHEN: cd backend && npx jest src/modules/currency; npx jest --config test/jest-e2e.json test/currency-no-rates.e2e-spec.ts; npm run lint
REMEMBER: no network to FXRatesAPI.
RULES: .swarm/rules.md
