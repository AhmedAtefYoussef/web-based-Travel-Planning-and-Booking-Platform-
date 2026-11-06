# V1-C Cross-cutting verification (GEN-07, GEN-08, ITN-18 rates, TRVL-133)
Worktree: .swarm/tmp/verify-sprint0 @ 6efa26b (detached). Read-only. No live FX network (unit mocks global.fetch; e2e uses a local fake FX server, backend/test/utils/test-app.ts:134-170,246).

Runs (logs under .swarm/tmp/v1-c/):
- L1 npx jest src/modules/audit src/modules/uploads src/modules/currency -> 5 suites, 39/39 pass (1-unit.log)
- L2 npx jest --config test/jest-e2e.json test/audit-uploads-currency.e2e-spec.ts test/currency-no-rates.e2e-spec.ts --verbose -> 2 suites, 20/20 pass (2-e2e.log)
- L3 npx jest currency -t fallback (checklist command) -> 0 tests matched, 11 skipped (3-fallback.log)
- L4 npx jest src/modules/currency -t "uses cached rates" -> 2 pass (4-cached.log)
- L5 node .github/scripts/repo-consistency.mjs -> OK (5-repo.log)

| CHK | verdict | code file:line | test file + name | command -> result | asserts statement? |
|---|---|---|---|---|---|
| CHK-GEN-07-1 | PARTIAL | backend/src/modules/audit/audit.service.ts:23-31 | audit.service.spec.ts "records an entry with a null actor for system actions" | L1 -> pass | Only with metadata undefined; no test asserts a metadata value is persisted/returned (e2e records metadata {i} but never asserts it) |
| CHK-GEN-07-2 | PASS | audit-log.schema.ts:148-166; audit.service.ts:16; audit.controller.ts GET only | audit-log.schema.spec.ts "%s is rejected", "re-saving an existing entry is rejected"; audit.service.spec.ts "exposes no update or delete API"; e2e "exposes no way to modify or delete entries" | L1, L2 -> pass | yes |
| CHK-GEN-07-3 | UNVERIFIABLE | no AUDIT_SERVICE caller outside the audit module | none | n/a | ACC-15 suspension not on develop |
| CHK-GEN-07-4 | UNVERIFIABLE | none | none | n/a | GEN-10 deletion not on develop |
| CHK-GEN-07-5 | UNVERIFIABLE | grep AUDIT_SERVICE: only common/contracts/tokens.ts:17, audit.module.ts:3,18,20 | none | n/a | A6 owning modules not on develop; zero callers today |
| CHK-GEN-07-6 | PASS | audit.controller.ts:71-89 | e2e "is admin only" | L2 -> pass | yes (ADMIN -> 200) |
| CHK-GEN-07-7 | PASS | audit.controller.ts:72 | e2e "is admin only" (USER, HOTEL_MOD -> 403; anon 401); audit.controller.spec.ts "rejects non-admin users with 403" | L1, L2 -> pass | yes |
| CHK-GEN-07-8 | PASS | audit.service.ts:43-53; common/dto/pagination.dto.ts:7-46 | e2e "is paginated newest-first" | L2 -> pass | yes (limit 10, total, totalPages; page 2 has 3) |
| CHK-GEN-07-9 | PASS | audit.service.ts:46 | e2e "is paginated newest-first" | L2 -> pass | yes (createdAt sorted desc, newest first) |
| CHK-GEN-07-10 | PASS | audit.service.ts:35; audit-query.dto.ts:6-9 | e2e "filters by actor and by action" | L2 -> pass | yes; query param is actorId, not actor |
| CHK-GEN-07-11 | PASS | audit.service.ts:36 | e2e "filters by actor and by action" | L2 -> pass | yes |
| CHK-GEN-07-12 | PASS | audit.service.ts:37-42 | e2e "filters by date range"; audit.service.spec.ts "filters by actor, action and date range" | L1, L2 -> pass | yes (future from excludes all; to only via unit mapping) |
| CHK-GEN-07-13 | PASS | audit.controller.ts:76; docs/api/openapi.json:76 | grep | grep -> "[GEN-07] List audit logs" | yes |
| CHK-GEN-08-1 | PASS | uploads.service.ts:31-37,98-120 | uploads.service.spec.ts "accepts PNG and JPG and stores them under UPLOAD_DIR"; e2e "accepts a JPG and exactly 5 MB" | L1, L2 -> pass | yes at service level (no HTTP upload endpoint exists yet) |
| CHK-GEN-08-2 | PASS | uploads.service.ts:23-30 | spec "accepts PNG and JPG..."; e2e "stores a PNG and serves it publicly with the same bytes" | L1, L2 -> pass | yes (service level) |
| CHK-GEN-08-3 | PASS | uploads.service.ts:103-113 | spec "rejects GIF"; e2e "rejects > 5 MB, wrong MIME, ..." (gif, pdf) | L1, L2 -> pass | yes (BadRequestException = 400) |
| CHK-GEN-08-4 | PASS | uploads.service.ts:103-113 | spec "rejects mimetype that disagrees with content" | L1 -> pass | yes |
| CHK-GEN-08-5 | PASS | uploads.service.ts:22-40,114-118 | spec "rejects a text file renamed to .png (bad magic bytes)" | L1 -> pass | yes |
| CHK-GEN-08-6 | PASS | uploads.service.ts:14,100 | spec "rejects files over 5 MB and accepts exactly 5 MB" | L1 -> pass | yes |
| CHK-GEN-08-7 | PASS | uploads.service.ts:100-102 | same spec; e2e MB5+1 | L1, L2 -> pass | yes (message matches 5 MB) |
| CHK-GEN-08-8 | PARTIAL | uploads.service.ts:55-59; common/contracts/uploads.contract.ts:11-14 | e2e six files with max 5 rejected | L2 -> pass | Only a caller-supplied per-call max; no per-type (post) limit; images already on the entity are not counted |
| CHK-GEN-08-9 | PARTIAL | same | same | L2 -> pass | as 8 (activity; ITN-12 not on develop) |
| CHK-GEN-08-10 | PARTIAL | same | same | L2 -> pass | as 8 (hotel; HTL-01 not on develop) |
| CHK-GEN-08-11 | PARTIAL | same | e2e two files with max 1 rejected | L2 -> pass | as 8 (airline logo; FLT-01 not on develop) |
| CHK-GEN-08-12 | PASS | uploads.service.ts:46-48,63-71; config/env.schema.ts:24,76 | spec "accepts PNG and JPG and stores them under UPLOAD_DIR"; e2e readdirSync(t.uploadDir) | L1, L2, L5 -> pass/OK | yes |
| CHK-GEN-08-13 | PASS | uploads.controller.ts:139-157 (public GET :filename) | e2e "stores a PNG and serves it publicly with the same bytes" | L2 -> pass | yes (200, image/png, same bytes) |
| CHK-GEN-08-14 | PARTIAL | uploads.service.ts:54-59,100-118 | spec asserts size and count messages | L1 -> pass | MIME/magic messages not asserted; standard error shape over HTTP never asserted (no upload endpoint) |
| CHK-GEN-08-15 | PARTIAL | docs/api/openapi.json:118 "[GEN-08] Serve a stored image" | grep | grep -> 1 hit | Serve endpoint OK; no upload endpoints exist yet to check |
| CHK-ITN-18-1 | PASS | currency.service.ts:60-80 | currency.service.spec.ts "fetches rates from FX_API_BASE_URL and converts minor units" | L1 -> pass | yes (toEqual amountMinor, rate, rateDate) |
| CHK-ITN-18-2 | PASS | currency.service.ts:74-76; common/utils/money.ts | spec "handles cross rates and zero-decimal currencies"; e2e "respects currency exponents (JPY has none)..." | L1, L2 -> pass | yes |
| CHK-ITN-18-3 | PARTIAL | currency.service.ts:145-155; env.schema.ts:73-75 default https://api.fxratesapi.com | spec "fetches rates from FX_API_BASE_URL..." | L1 -> pass | Test asserts configured base URL + /latest?base=USD&api_key; FXRatesAPI host only via the schema default, not asserted |
| CHK-ITN-18-4 | PARTIAL | currency.service.ts:94-97 (Cron EVERY_DAY_AT_1AM); app.module.ts:28 ScheduleModule.forRoot() | spec "does not refetch when today is already cached" (request path only) | L1 -> pass | No test triggers refreshDaily(); cron is code-read only |
| CHK-ITN-18-5 | PASS | exchange-rate.schema.ts:5 (collection exchange_rates); currency.service.ts:170-176 | spec "persists fetched rates"; e2e (memory Mongo) "keeps serving the last cached rates when the FX API goes down" | L1, L2 -> pass | yes (no in-memory cache, so e2e success after FX down proves Mongo persistence) |
| CHK-ITN-18-6 | PASS | currency.service.ts:169,78 | spec "persists fetched rates" (rateDate=TODAY); "fetches rates..." returns rateDate | L1 -> pass | yes |
| CHK-ITN-18-7 | PASS | currency.service.ts:107-121,131-143 | spec "uses cached rates when the fetch fails" (old rateDate 2020-01-01), "...non-2xx status"; e2e "keeps serving the last cached rates..." | L1, L2, L4 -> pass | yes |
| CHK-ITN-18-8 | PASS | currency.service.ts:115-119 | spec "answers 503 when no rates were ever cached and fetch fails"; currency-no-rates.e2e "GET /currencies/rates is 503; the currency list stays available" | L1, L2 -> pass | yes |
| CHK-ITN-18-9 | PASS | currency.service.ts:99-105 | spec "answers 400 for unsupported codes"; e2e "rejects unsupported codes with 400" | L1, L2 -> pass | yes (service level; no HTTP convert route) |
| CHK-ITN-18-10 | PASS | currency.controller.ts:17-20; currency.service.ts:18-26 | e2e "lists supported currencies publicly" | L2 -> pass | yes (200, 7 ISO codes in body.items) |
| CHK-ITN-18-11 | PASS | currency.controller.ts:25-32; currency.service.ts:82-91 | e2e "exposes base, rateDate and rates" | L2 -> pass | yes |
| CHK-ITN-18-12 | PASS | docs/api/openapi.json:140,165 | grep | grep -> 2 hits | yes |
| CHK-TRVL-133-1 | PASS | backend/src/app.module.ts:11,33 | e2e boots real AppModule (test/utils/test-app.ts:252,260) | L2 -> pass | yes |
| CHK-TRVL-133-2 | PASS | currency.module.ts:19 useExisting CurrencyService | e2e app.get(CURRENCY_SERVICE) "converts minor units using the fetched rate" | L2 -> pass | yes (real rates, not stub) |
| CHK-TRVL-133-3 | PASS | env.schema.ts:22-23,72-75; example env file keys FX_API_KEY, FX_API_BASE_URL | repo-consistency | L5 -> OK | yes |
| CHK-TRVL-133-4 | PASS | currency.service.spec.ts:66-77 (global.fetch mocked and restored); test-app.ts:134-170 local fake FX | all currency tests | L1, L2 -> pass offline | yes |
| CHK-TRVL-133-5 | PARTIAL | currency.service.ts:18-26 hard-coded SUPPORTED_CURRENCIES | spec "lists supported currencies and rates"; e2e "lists supported currencies publicly" | L1, L2 -> pass | List is a code constant, not seeded data |
| CHK-TRVL-133-6 | PASS | currency.service.ts:107-143 | spec "uses cached rates when the fetch fails", "...non-2xx status" | L4 -> 2 pass; L3 checklist cmd -> 0 matched | yes; checklist test-name filter is wrong, not the test |

## Findings (by severity)
1. Medium GEN-08-8..11: per-entity image limits (5 per post/activity/hotel, 1 airline logo) are not enforced by UploadsService; it only checks a caller-supplied per-call max (uploads.service.ts:55-59). Images already on the entity are not counted, so repeated attach calls can exceed 5. Owners must count existing images, or the contract should take the entity type and existing count.
2. Medium GEN-07-3/4/5: AUDIT_SERVICE has zero callers on develop; xlsx GEN-07 (suspensions, deletions) is unproven until ACC-15/ACC-16/GEN-10 land. Each owner PR needs an e2e asserting the audit entry.
3. Low GEN-07-1: no test asserts metadata persistence.
4. Low ITN-18-4: the daily Cron job is untested (no test calls refreshDaily()).
5. Low GEN-08-14: rejection error shape over HTTP not asserted; MIME/magic messages not asserted.
6. Low checklist TRVL-133-6: npx jest currency -t fallback matches 0 tests; use -t "uses cached rates".
7. Info: audit filter param is actorId (checklist says actor); /api/currencies returns {items:[...]}; currency list is a constant, not seeded.

Counts: GEN-07 9 PASS / 1 PARTIAL / 0 FAIL / 3 UNVERIFIABLE; GEN-08 9/6/0/0; ITN-18 10/2/0/0; TRVL-133 5/1/0/0.
