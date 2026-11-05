ID: fix-TRVL-130-2  MODEL: sonnet  DEPENDS: none  REQ: TRVL-130, GEN-13  CTX: v2
BRANCH: fix/TRVL-130-swagger-prod (from origin/develop 6efa26b)
GOAL: Swagger declares cookie auth and is not mounted in production.
CONTEXT: context.md ## conventions
INPUTS: report F8; backend/src/common/swagger/setup-swagger.ts:32,46; docs/requirements/plan.md:888-894
DELIVER: failing spec first (production -> no /api/docs; document has a cookie apiKey scheme), then code; regenerate docs/api/openapi.json.
OWNS: backend/src/common/swagger/**, docs/api/openapi.json
DONE WHEN: cd backend && npx jest src/common/swagger; npm run openapi:export; npm run test:e2e
REMEMBER: keep the dev-header schemes for non-production.
RULES: .swarm/rules.md
