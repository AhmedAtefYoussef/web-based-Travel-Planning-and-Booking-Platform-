ID: fix-TRVL-130-1  MODEL: opus  DEPENDS: none  REQ: GEN-13, PAY-01, TRVL-130  CTX: v2
BRANCH: fix/TRVL-130-env-hardening (from origin/develop 6efa26b)
GOAL: Config schema fails closed for unsafe production settings.
CONTEXT: context.md ## decisions
INPUTS: report F6; backend/src/config/env.schema.ts:48-50,69,70
DELIVER: failing env.schema specs first: missing NODE_ENV throws (outside test bootstrap); live Stripe keys (sk_live_/rk_live_) rejected unless explicitly allowed; production with COOKIE_SECURE=false throws. Then schema changes. New keys: report in NOTES (Leader edits the example env file).
OWNS: backend/src/config/**
DONE WHEN: cd backend && npx jest src/config; npm test; npm run test:e2e; node .github/scripts/repo-consistency.mjs
REMEMBER: test bootstrap must still boot; report needed test/setup-env.ts changes in NOTES.
RULES: .swarm/rules.md
