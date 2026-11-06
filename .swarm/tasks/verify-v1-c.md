ID: verify-v1-c  MODEL: opus  DEPENDS: v0  REQ: GEN-07, GEN-08, ITN-18, TRVL-133  CTX: v2
BRANCH: none, read-only; shared worktree .swarm/tmp/verify-sprint0 (detached 6efa26b, npm ci done)
GOAL: Give every check in .swarm/verify/checklist.md section "## V1-C Cross-cutting" (L201-264) an evidence-backed verdict.
CONTEXT: context.md ## test harness gotchas
INPUTS: .swarm/verify/checklist.md:L201-264; reqs.json by id (Grep)
DELIVER: .swarm/verify/v1-c.md table: CHK | verdict PASS/PARTIAL/FAIL/UNVERIFIABLE | code file:line | test file + name | command -> result | asserts statement? ; plus rule 7 result block.
OWNS: none. Write only .swarm/verify/v1-c.md and .swarm/tmp/v1-c/*.log
DONE WHEN: every row judged; each PASS cites a targeted run (npx jest <file> -t "<name>" or e2e config) logged under .swarm/tmp/v1-c/.
REMEMBER: reading code alone = max PARTIAL; check the test asserts the statement, not only that it is green.
RULES: .swarm/rules.md; no edits to tracked files; no network to Stripe/FXRatesAPI; no secrets files
