ID: verify-v2-4  MODEL: opus  DEPENDS: v1  REQ: PAY-01, PAY-02, PAY-03, PAY-04, GEN-02, GEN-05, GEN-07, GEN-08, GEN-13, ITN-18  CTX: v2
BRANCH: none, read-only; worktree .swarm/tmp/verify-sprint0 (detached 6efa26b)
GOAL: Audit docs/requirements/traceability.md against real tests and the checklist.
CONTEXT: none
INPUTS: docs/requirements/traceability.md (47 lines); .swarm/verify/checklist.md CHK ids only (Grep "^| CHK-")
DELIVER: .swarm/verify/v2-4.md: per traceability row: ID | claimed status | named test exists (file:line) | re-run result | match?; then in-scope REQ/TRVL ids missing from traceability; rule 7 block.
OWNS: none. Write only .swarm/verify/v2-4.md, .swarm/tmp/v2-4/*.log
DONE WHEN: every PASS row's test name found by Grep and re-run once with -t.
REMEMBER: a PASS row whose test name does not exist or does not run = finding.
RULES: .swarm/rules.md; no edits to tracked files
