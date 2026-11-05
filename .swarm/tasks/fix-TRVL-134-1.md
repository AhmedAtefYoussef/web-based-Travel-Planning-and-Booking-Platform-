ID: fix-TRVL-134-1  MODEL: haiku  DEPENDS: none  REQ: TRVL-134, TRVL-135  CTX: v2
BRANCH: docs/TRVL-134-traceability-commands (from origin/develop 6efa26b)
GOAL: Traceability commands run as copied; README links the Swagger demo.
CONTEXT: none
INPUTS: report F10; .swarm/verify/v2-4.md
DELIVER: traceability.md commands that run >=1 test when copied from the raw file (no escaped pipes); rows for TRVL-128 and TRVL-136; README section linking docs/api/swagger-demo.md and the demo script.
OWNS: docs/requirements/traceability.md, README.md
DONE WHEN: each command copied raw runs >=1 test (logs in .swarm/tmp/); node .github/scripts/repo-consistency.mjs
REMEMBER: traceability.md is Leader-only; Ahmed runs or approves this card.
RULES: .swarm/rules.md
