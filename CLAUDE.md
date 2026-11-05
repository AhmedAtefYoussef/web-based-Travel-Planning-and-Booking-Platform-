# Travel Planning & Booking Platform — Claude instructions
Team project, GIU Software Project I. Leader: Ahmed (owns merges, Jira, releases).
M1 backend/API due 2026-11-20 (tag v1.0.0-m1). M2 frontend/integration due 2026-12-11.

## Start of every session
1. Read .swarm/state.md and .swarm/HANDOFF.md (the SessionStart hook prints them).
2. Do not read whole large files. plan.md, reqs.json, openapi.json, erd.md: Grep or use the line index below.
3. One unit of work per session. At ~50% context: run /handoff, then /clear.

## Map
backend/  NestJS 11, TS, Mongoose, Jest   → backend/CLAUDE.md
frontend/ Next.js (M2)                    → frontend/CLAUDE.md
docs/     requirements, architecture, api → docs/CLAUDE.md
.swarm/   orchestration (Leader–worker)   → .swarm/rules.md, config.md, context.md (decisions D1–D10)
.github/  CI (build-lint-test) + PR gate (pr-requirements); see README "Pull requests and merging"
docs/agentic/context-engineering-spec.md  → operating model (read only to change it)

## Non-negotiables
- Money: integer minor units, PLATFORM_CURRENCY (default USD). Per-currency exponent via common/utils/money.ts.
- Modules never import each other: use contracts in backend/src/common/contracts, injected by token.
- Errors: {statusCode,error,message,fieldErrors?,path,timestamp}. Pagination: ?page=N, size fixed 10.
- Tests first for behaviour changes. Never delete or weaken a test to go green.
- Conventional Commits with [REQ-ID]. Branch feature/<ID>-… or fix/<ID>-… off develop. Never push to develop/main; no --force, no --admin.
- Merges: PR into develop, Ahmed approves and merges. develop → main only at a release. Close main → develop back-merge PRs.
- Secrets only in backend/.env. Never read or print .env, team-db-access/, or keys. Test fixtures use <user>:<password>.
- Every AI-assisted change gets an AI_PROMPTS.txt entry (format checked by CI).
- Endpoint changes: Swagger summary starts with [ID]; run npm run openapi:export and commit docs/api/openapi.json (CI drift check).
- Jira writes: main session only, after Ahmed approves in chat.

## Commands (run in backend/)
npm ci · npm run build · npm run lint · npm test · npm run test:e2e · npm run openapi:export
Repo checks (root): node .github/scripts/repo-consistency.mjs
Long output → .swarm/tmp/<name>.log, then read only the tail.

## Where to look (line index, verified 2026-11-05)
plan.md: folder layout L108-165 · cross-cutting decisions L166-337 · data model L338-612 · ownership matrix L613-855 ·
  per-member tasks L856-1369 · contracts L1370-1555 · payment flow L1556-1624 · timeline L1625-1694 ·
  git/env/DoD L1695-1806 (env list L1743-1770, DoD L1793-1806) · docs list L1807-1836 · risks L1837-1943
project-description.md: M1 API tables L260-438 · AI policy L541-577 (AI_PROMPTS format L551-567) · deliverables L596-613
reqs.json: rows by "id"; acceptance in "acceptance"; owner in "owner"
Decisions: docs/architecture/adr-00*.md · .swarm/context.md ## decisions · assumed defaults A1–A9: .swarm/state.md
Traceability: docs/requirements/traceability.md · Module map: docs/architecture/module-map.md
