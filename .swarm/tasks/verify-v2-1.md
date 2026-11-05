ID: verify-v2-1  MODEL: opus  DEPENDS: v0  REQ: PAY-01, PAY-02, PAY-03, PAY-04, GEN-13, GEN-07, TRVL-131  CTX: v2
BRANCH: none, read-only; shared worktree .swarm/tmp/verify-sprint0 (detached 6efa26b)
GOAL: Independently re-verify the critical checks from scratch, blind to other verdicts.
CONTEXT: context.md ## test harness gotchas
INPUTS: .swarm/verify/checklist.md:L8-95 (PAY-*), rows CHK-GEN-13-5..10 (L135-140), CHK-TRVL-131-1..8 (L179-186), CHK-GEN-07-1,2,6,7 (L206-212)
DELIVER: .swarm/verify/v2-1.md table CHK | verdict | code file:line | test + name | command -> result | asserts? ; rule 7 result block.
OWNS: none. Write only .swarm/verify/v2-1.md and .swarm/tmp/v2-1/*.log
DONE WHEN: every listed row judged with a targeted test run per PASS.
REMEMBER: do not open .swarm/verify/v1-*.md or .swarm/out/; disagreements must arise independently.
RULES: .swarm/rules.md; no edits to tracked files; no network to Stripe
