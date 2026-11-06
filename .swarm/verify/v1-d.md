# V1-D Docs and delivery: verification at 6efa26b (2026-11-05)

Worktree: .swarm/tmp/verify-sprint0 (detached 6efa26b). Targeted logs: .swarm/tmp/v1-d/*.log. Gate logs (Leader): .swarm/tmp/gate/*.log.
Paths are repo-relative. gh is authenticated (AhmedAtefYoussef); only read-only calls were made.

| CHK | verdict | code / doc file:line | test file + name | command -> result | asserts statement? |
|---|---|---|---|---|---|
| CHK-TRVL-134-1 | PASS | docs/requirements/traceability.md:1 (47 lines) | n/a (doc) | ls docs/requirements -> traceability.md present | yes |
| CHK-TRVL-134-2 | PARTIAL | traceability.md:16-25 | n/a | grep owner ahmed in reqs.json -> 10 ids (PAY-01..04, ITN-18, GEN-02/05/07/08/13), all 10 have rows with ID, test names and command. repo-consistency.mjs does not check traceability. | Only the 10 Ahmed reqs of 115 have rows. Member reqs have no rows (none merged yet) |
| CHK-TRVL-134-3 | PASS | traceability.md:16-25 | all 45 named tests found (4 are it.each: test/payments.e2e-spec.ts:283-284 "%p", test/foundation.e2e-spec.ts:130 "%s") | 15 row commands run -> all exit 0; matched counts equal the listed names: pay01 5+1, pay02 4, pay03 5+1, pay04 3+2, itn18 5, gen02 1+1, gen05 4, gen07 5, gen08 4, gen13 3+1 (.swarm/tmp/v1-d/*-e2e.log, *-unit.log) | yes |
| CHK-TRVL-134-4 | PASS | docs/architecture/erd.md:1 (345 lines) | n/a | ls -> present | yes |
| CHK-TRVL-134-5 | PASS | docs/architecture/module-map.md:1 | n/a | ls -> present | yes |
| CHK-TRVL-134-6 | PASS | docs/architecture/adr-001-auth-cookies.md:1 "ADR-001: Authentication with httpOnly cookies and rotating refresh tokens" | n/a | ls -> present | yes |
| CHK-TRVL-134-7 | PASS | docs/architecture/adr-002-inventory-concurrency.md:1 | n/a | ls -> present | yes |
| CHK-TRVL-134-8 | PASS | docs/architecture/adr-003-payments-webhook.md:1 | n/a | ls -> present | yes |
| CHK-TRVL-134-9 | PASS | docs/architecture/adr-004-money-and-time.md:1 "Money as integer minor units, time as UTC" | n/a | ls -> present | yes |
| CHK-TRVL-135-1 | PASS | README.md:18-24 "Clone and install ... npm ci" | n/a (doc) | grep -> README.md:23 npm ci | yes |
| CHK-TRVL-135-2 | PASS | README.md:28 "The template is the example env file at the repository root", variable table README.md:34-39 | n/a | grep -> L28, L31 | yes |
| CHK-TRVL-135-3 | PARTIAL | backend/scripts/demo-server.ts exists; documented in docs/api/swagger-demo.md:29 | n/a | ls -> present; grep -i demo README.md -> no match | README does not reference the demo script or swagger-demo.md |
| CHK-TRVL-135-4 | PASS | AI_PROMPTS.txt:1,18,...,171 | repo-consistency.mjs | gate repo.log -> "AI_PROMPTS.txt format and example env keys are consistent."; grep -c ^===== -> 13 (12 entries, shared separators) | yes |
| CHK-TRVL-135-5 | PASS | AI_PROMPTS.txt | same | grep -c ^Date: -> 12 | yes |
| CHK-TRVL-135-6 | PASS | AI_PROMPTS.txt | same | ^Student: -> 12 | yes |
| CHK-TRVL-135-7 | PASS | AI_PROMPTS.txt | same | ^Tool: -> 12 | yes |
| CHK-TRVL-135-8 | PASS | AI_PROMPTS.txt | same | ^Related Requirement: -> 12 | yes |
| CHK-TRVL-135-9 | PASS | AI_PROMPTS.txt | same | ^Prompt: -> 12 | yes |
| CHK-TRVL-135-10 | PASS | AI_PROMPTS.txt | same | ^How the output was used: -> 12 | yes |
| CHK-TRVL-135-11 | PASS | AI_PROMPTS.txt | n/a | grep -iE for mongodb URIs without placeholder, sk_live/sk_test keys, password=, whsec_ -> no match | yes |
| CHK-TRVL-135-12 | PARTIAL | AI_PROMPTS.txt:145-171 (two 2026-11-05 entries, TRVL-1 team process) | n/a | git log -1 -- AI_PROMPTS.txt -> 6dec7cd; later [AGENT] commits 4108a7a, 615263b, b358dca, 213d4e5 do not touch AI_PROMPTS | Spot check only; whether those 4 commits are covered by the existing TRVL-1 entries cannot be told |
| CHK-TRVL-136-1 | FAIL (not yet due) | n/a | n/a | git tag -> none; gh api repos/.../tags -> []; gh api repos/.../releases -> []; no CHANGELOG | Tag v1.0.0-m1 absent (due 2026-11-20) |
| CHK-TRVL-136-2 | UNVERIFIABLE | n/a | n/a | no tag exists | needs the tag |
| CHK-TRVL-136-3 | FAIL | n/a | n/a | gh pr list --state all -> #13 "release: merge develop into main" and #15 "Develop" both MERGED main<-develop before any release tag; origin/main = 019e6bc (2026-11-04) | develop was merged to main twice with no release |
| CHK-TRVL-136-4 | PARTIAL | n/a | n/a | gh pr list -> #18 develop<-main "Main" CLOSED (not merged); no back-merge PR for #13 seen | Back-merge was closed, but no release has happened yet |
| CHK-TRVL-136-5 | UNVERIFIABLE | n/a | n/a | no release commit. gh run list --branch main -> latest is PR Automation failure (run 41844108306, PR #18). develop 6efa26b CI success (run 42072836283) | needs the release commit |
| CHK-TRVL-136-6 | UNVERIFIABLE | n/a | n/a | at 6efa26b: gate openapi:export + git diff --exit-code = 0 (LF->CRLF flag only) | the release commit does not exist yet |
| CHK-TRVL-136-7 | UNVERIFIABLE | n/a | n/a | no tag; today 2026-11-05 < 2026-11-20 | not yet due |
| CHK-TRVL-136-8 | UNVERIFIABLE | n/a | n/a | depends on Jira state | Jira not checked |
| CHK-TRVL-128-1 | PASS | backend/src/config/env.schema.ts:58-63 (.required()) | backend/src/config/env.schema.spec.ts:52 "fails fast listing every missing required variable"; :18 "treats empty values as unset so defaults apply" (empty MONGODB_URI throws, L22-24) | npx jest src/config/env.schema.spec.ts -t (4 names) -> 4 passed, exit 0 (.swarm/tmp/v1-d/trvl128-unit.log) | yes |
| CHK-TRVL-128-2 | PARTIAL | example env file at repo root (tracked, by git ls-files) | n/a | gate repo.log -> example keys match env.schema (MONGODB_URI is in the schema); git grep for user:pass@ connection strings in all tracked files -> none (exit 1) | Placeholder text not viewed (the hook blocks reading the example env file) |
| CHK-TRVL-128-3 | PASS | backend/src/config/env.schema.ts:56-62 (mongodb and mongodb+srv pattern, multi-host allowed) | env.schema.spec.ts:27 "accepts the Atlas SRV and multi-host standard connection strings"; :39 "rejects MONGODB_URI values that are not MongoDB connection strings" | same run -> passed | yes (SRV and 3-host direct forms) |
| CHK-TRVL-128-4 | PASS | n/a | n/a | git grep -nE for mongodb(+srv) URIs with user:pass@ that are not placeholders -> no match (exit 1) | yes |
| CHK-TRVL-128-5 | PASS | .gitignore:4-6, backend/.gitignore:5-7 | n/a | git ls-files over dotfiles, *.pem, *.key -> only the example env file, .gitignore, backend/.gitignore, backend/.prettierrc | yes |
| CHK-TRVL-128-6 | UNVERIFIABLE | n/a | n/a | n/a | needs live Atlas credentials |
| CHK-TRVL-128-7 | UNVERIFIABLE | n/a | n/a | n/a | needs the Atlas console |
| CHK-TRVL-128-8 | UNVERIFIABLE | n/a | n/a | n/a | needs the Atlas console |
| CHK-TRVL-128-9 | UNVERIFIABLE | n/a | n/a | n/a | shared out of band |
| CHK-DLV-1 | FAIL (not yet due) | docs/api/openapi.json | n/a | node count -> 12 paths / 12 operations; docs/requirements/project-description.md:260-438 lists 117 method rows. About 11 PD rows are covered (payments, policies, refunds, currencies, audit-logs, uploads) | Mandatory API tables are mostly unimplemented (M1 due 2026-11-20) |
| CHK-DLV-2 | UNVERIFIABLE | backend/src/config/env.schema.ts:58-63 | n/a | n/a | live Atlas |
| CHK-DLV-3 | PASS | docs/api/openapi.json; docs/api/swagger-demo.md:5 | n/a | demo server GET /api/docs-json -> 200; gate openapi export drift = 0 | yes, for the implemented routes |
| CHK-DLV-4 | PASS | backend/scripts/demo-server.ts:23-64 | n/a | DEMO_IN_MEMORY_DB=true, PORT=3987, npx ts-node scripts/demo-server.ts -> Nest application successfully started; GET /api/docs -> 200 (.swarm/tmp/v1-d/demo-server.log); process killed | yes |
| CHK-DLV-5 | PASS | README.md:18-39 | n/a | see CHK-TRVL-135-1 | yes |
| CHK-DLV-6 | PASS | AI_PROMPTS.txt | n/a | git log -1 -- AI_PROMPTS.txt -> 6dec7cd 2026-11-05; repo-consistency OK | yes |
| CHK-DLV-7 | FAIL | n/a | n/a | git shortlog -sn HEAD -> 33 Ahmed Atef Youssef, no other authors; only other contributor activity is open PR #20 (sandra660) | History shows only one contributor |
| CHK-DLV-8 | FAIL | n/a | n/a | git branch -r filtered -> origin/test/M1-ahmed-acceptance-e2e, origin/feature/SETUP-scaffold-contracts; also fix/build-exclude-scripts (no ID) plus chore/ and docs/ prefixes | Branch names break the feature/ID- / fix/ID- rule |
| CHK-DLV-9 | PARTIAL | n/a | n/a | git log HEAD --format=%s, checked against the regex -> violations: 7decf05 "chore: initial commit with requirements sources" plus 4 GitHub "Merge pull request" commits (#14, #17, #19, #21) | The other 28 commits conform |
| CHK-DLV-10 | PARTIAL | n/a | n/a | gh pr list --json title -> 19 of 21 PR titles carry IDs; #15 "Develop" (merged) and #18 "Main" (closed) do not | merged #15 has no ID |
| CHK-DLV-11 | PARTIAL | n/a | n/a | gh pr list -> all 18 merged PRs mergedBy=AhmedAtefYoussef; every one has reviewDecision=REVIEW_REQUIRED (no approving review) and was authored by Ahmed | Merged by the leader, but none was reviewed |
| CHK-DLV-12 | PASS | .gitignore:4-15 | n/a | see CHK-TRVL-128-4/-5; git ls-files *access*/*cred*/*secret* -> none | yes |
| CHK-DLV-13 | FAIL | n/a | n/a | grep -ril seed / countries / airports / attractions in backend/src, backend/scripts -> no seed script (only stub/demo matches) | Reference datasets are not seeded; seeding on Atlas is unverifiable |
| CHK-DLV-14 | PASS | .github/scripts/repo-consistency.mjs | n/a | gate repo.log -> consistency OK | yes |

## Counts
TRVL-134: 8 PASS / 1 PARTIAL. TRVL-135: 10 PASS / 2 PARTIAL. TRVL-136: 0 PASS / 1 PARTIAL / 2 FAIL / 5 UNVERIFIABLE.
TRVL-128: 4 PASS / 1 PARTIAL / 4 UNVERIFIABLE. DLV: 6 PASS / 3 PARTIAL / 4 FAIL / 1 UNVERIFIABLE.

## Findings (severity order)
1. CHK-TRVL-136-3 FAIL: develop was merged into main by #13 and #15 before any release; this breaks the rule that develop goes to main only at a release.
2. CHK-DLV-13 FAIL: there is no seeding of the official reference datasets (countries, cities, airports, attractions), and no owner is visible.
3. CHK-DLV-1 FAIL (due 11-20): 12 of the ~117 PD API rows are documented in openapi.json.
4. CHK-DLV-7 FAIL: only Ahmed appears in the history; member PRs (e.g. #20) are not merged.
5. CHK-DLV-8 FAIL: test/M1-ahmed-acceptance-e2e, feature/SETUP-scaffold-contracts and fix/build-exclude-scripts break the naming rule.
6. CHK-DLV-11 PARTIAL: no merged PR has an approving review.
7. CHK-TRVL-136-1 FAIL (expected): no tag v1.0.0-m1, no CHANGELOG, no release.
8. CHK-TRVL-135-3 PARTIAL: README does not link the demo script or docs/api/swagger-demo.md.
9. CHK-DLV-9/-10 PARTIAL: initial commit, merge commits and PR #15 have no ID.
10. CHK-TRVL-135-12 PARTIAL: 4 [AGENT] commits came after the last AI_PROMPTS change.
