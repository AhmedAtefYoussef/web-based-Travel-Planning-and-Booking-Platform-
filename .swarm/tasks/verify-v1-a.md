ID: verify-v1-a  MODEL: opus  DEPENDS: v0  REQ: PAY-01, PAY-02, PAY-03, PAY-04  CTX: v2
BRANCH: none, read-only; shared worktree .swarm/tmp/verify-sprint0 (detached 6efa26b, npm ci done)
GOAL: Give every check in .swarm/verify/checklist.md section "## V1-A Payments" (L8-95) an evidence-backed verdict.
CONTEXT: context.md ## test harness gotchas
INPUTS: .swarm/verify/checklist.md:L8-95; reqs.json by id (Grep)
DELIVER: .swarm/verify/v1-a.md table: CHK | verdict PASS/PARTIAL/FAIL/UNVERIFIABLE | code file:line | test file + name | command -> result | asserts statement? ; plus rule 7 result block.
OWNS: none. Write only .swarm/verify/v1-a.md and .swarm/tmp/v1-a/*.log
DONE WHEN: every row judged; each PASS cites a targeted run (npx jest <file> -t "<name>" or e2e config) logged under .swarm/tmp/v1-a/.
REMEMBER: reading code alone = max PARTIAL; check the test asserts the statement, not only that it is green.
RULES: .swarm/rules.md; no edits to tracked files; no network to Stripe/FXRatesAPI; no secrets files
