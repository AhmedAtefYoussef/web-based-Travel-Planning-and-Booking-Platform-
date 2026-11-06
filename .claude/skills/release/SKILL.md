---
name: release
description: Leader only. Milestone release checklist (code freeze, full verification against the workbook, README/Swagger/AI_PROMPTS deliverables, develop -> main PR, tag). Use for v1.0.0-m1 (2026-11-20) and the M2 release (2026-12-11).
---

## Freeze (M1: 2026-11-18, M2: 2026-12-09)
- Announce the freeze; only `fix/` PRs merge after it.
- List mandatory IDs of the milestone without a PASS traceability row:
  `node .claude/skills/req/req.mjs --owner <slug>` per member, compared with `docs/requirements/traceability.md`.

## Verify on a clean clone of `origin/develop`
- `npm ci`, lint, build, `npm test`, `npm run test:e2e`, OpenAPI drift, `node .github/scripts/repo-consistency.mjs`.
- Run the `requirement-verifier` agent per module (accounts, flights, hotels, bookings, payments, itineraries, blog, cross-cutting).
  Every mandatory ID must be PASS; anything else becomes a `fix/` PR or is reported as a known gap.
- Swagger walkthrough of the demo script `docs/api/swagger-demo.md` against Atlas with Stripe CLI forwarding.
- `npm audit --omit=dev`: no critical; highs documented.

## Deliverables (brief §13)
- M1: backend, Atlas integration, Swagger, README setup steps, AI_PROMPTS.txt up to date, team Git history.
- M2: frontend, integration, all mandatory role workflows, final README, AI_PROMPTS.txt, history.

## Ship
- PR `develop -> main` titled `release: v1.0.0-m1` (or `v2.0.0-m2`), merge commit. Ahmed tags `v1.0.0-m1` on main and pushes the tag.
- Back-merge is not needed (main only receives release merges); close any automatic main -> develop PR.
