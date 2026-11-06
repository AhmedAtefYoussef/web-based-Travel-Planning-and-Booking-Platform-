ID: verify-v1-b  MODEL: opus  DEPENDS: v0  REQ: GEN-02, GEN-05, GEN-13, TRVL-129, TRVL-130, TRVL-131, TRVL-132  CTX: v2
BRANCH: none, read-only; shared worktree .swarm/tmp/verify-sprint0 (detached 6efa26b, npm ci done)
GOAL: Give every check in .swarm/verify/checklist.md section "## V1-B Foundation" (L96-200) an evidence-backed verdict.
CONTEXT: context.md ## test harness gotchas
INPUTS: .swarm/verify/checklist.md:L96-200; reqs.json by id (Grep)
DELIVER: .swarm/verify/v1-b.md table: CHK | verdict PASS/PARTIAL/FAIL/UNVERIFIABLE | code file:line | test file + name | command -> result | asserts statement? ; plus rule 7 result block.
OWNS: none. Write only .swarm/verify/v1-b.md and .swarm/tmp/v1-b/*.log
DONE WHEN: every row judged; each PASS cites a targeted run (npx jest <file> -t "<name>" or e2e config) logged under .swarm/tmp/v1-b/.
REMEMBER: reading code alone = max PARTIAL; check the test asserts the statement, not only that it is green.
RULES: .swarm/rules.md; no edits to tracked files; no network to Stripe/FXRatesAPI; no secrets files
