ID: verify-v2-3  MODEL: opus  DEPENDS: v0  REQ: GEN-13, GEN-08, PAY-01, TRVL-130, TRVL-131  CTX: v2
BRANCH: none, read-only; worktree .swarm/tmp/verify-sprint0 (detached 6efa26b)
GOAL: Security review of the Sprint 0 surface; findings only.
CONTEXT: context.md ## decisions
INPUTS: backend/src/common/** (guards, decorators, filters, pipes), backend/src/config/**, backend/src/main.ts + setup-app, uploads, payments webhook + raw body, swagger setup, .gitignore, .github/workflows
DELIVER: .swarm/verify/v2-3.md findings: severity | file:line | issue | exploit scenario | suggested fix | test that should fail first; rule 7 result block.
OWNS: none. Write only .swarm/verify/v2-3.md (via Leader if no write tool)
DONE WHEN: auth stubs, guard defaults, config validation, uploads, webhook raw body, error leakage, Swagger in production, tracked secret-looking files (names only) all covered.
REMEMBER: never open or print secret values or env files.
RULES: .swarm/rules.md
