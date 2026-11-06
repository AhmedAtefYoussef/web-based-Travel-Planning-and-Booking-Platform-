ID: fix-TRVL-131-1  MODEL: sonnet  DEPENDS: none  REQ: TRVL-131, GEN-13  CTX: v2
BRANCH: fix/TRVL-131-dev-guard-tests (from origin/develop 6efa26b)
GOAL: Dev-auth guard tests pin the exact allow-list.
CONTEXT: context.md ## decisions
INPUTS: report F14; backend/src/common/guards/dev-auth.guard.ts:61-67; dev-auth.guard.spec.ts:74-86
DELIVER: tests: flag off -> UnauthorizedException (not generic); flag on with NODE_ENV staging/production/unset -> 401; flag on with development/test -> authenticated. Code change only if a test fails.
OWNS: backend/src/common/guards/**
DONE WHEN: cd backend && npx jest src/common/guards; npm run lint
REMEMBER: deny by default.
RULES: .swarm/rules.md
