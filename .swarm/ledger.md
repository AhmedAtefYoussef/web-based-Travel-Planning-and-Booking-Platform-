7decf05 initial commit: .gitignore, docs/requirements/*
99a5426 PR#1 t0: backend skeleton, common/{contracts,stubs,guards,decorators,dto,utils}, config/env.schema, .env.example, PR template
0573569 PR#2 Leader: backend deps (mongoose, swagger11, stripe, bcrypt, cookie-parser, schedule, luxon, memory-server)
d9 PR#3 Leader: DevAuthGuard opt-in DEV_AUTH_ENABLED; env schema; test/setup-env.ts; .env.example
PR#4 t3: modules/{audit,uploads,currency} (not yet wired into AppModule)
PR#5 fix: currency cooldown + uploads module sources + .gitignore anchored
PR#6 t1+Leader: foundation (setupApp, filter, pipes, swagger, hasher, mongo) + AppModule wiring + e2e globalSetup
PR#7 t6+Leader: docs/architecture ERD+ADR1-4, README, AI_PROMPTS (hand-corrected)
PR#8 t2+t2b: modules/payments (+wiring). Refund.paymentIntentId required
PR#9 t4+t5: backend/test acceptance suite (86 e2e), PAY-04 invalid total fix, hasher fn exports
PR#10 t7: traceability.md, docs/api/{openapi.json,swagger-demo.md}, scripts/{export-openapi,demo-server}.ts, erd refresh
PR#11 t8: swagger decorators/DTOs on Ahmed controllers, dev auth schemes, openapi regen
PR#12 t9: verifier fixes (PLATFORM_CURRENCY, refund notify, trace owner/PR, module map)
PR#13 Ahmed: release develop -> main (2026-11-03)
PR#14 Leader: backend/tsconfig.build.json excludes scripts (start:dev/start:prod fix)
PR#15 Ahmed: release develop -> main (2026-11-04)
PR#17 Leader: .github/{workflows/ci,pr-open,pr-automation.yml,scripts/pr-requirements.mjs,repo-consistency.mjs,CODEOWNERS}, README merging section
PR#19 Leader: backend/src/config/env.schema(.spec).ts MONGODB_URI pattern (multi-host)
#18 closed (main -> develop back-merge, no files)
PR#21 Leader: v2 operating model (CLAUDE.md files, .claude/ hooks/skills/agents, .swarm refresh) merged -> develop 6efa26b
