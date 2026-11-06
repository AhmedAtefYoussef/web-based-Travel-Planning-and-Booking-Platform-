# Travel Planning & Booking Platform

GIU Software Project I (Winter 2026), team of 7. Leader: Ahmed (reviews and merges every PR, owns Jira and releases).
M1 backend + Swagger due **2026-11-20** (tag `v1.0.0-m1`). M2 Next.js frontend + integration due **2026-12-11**.
Stack (fixed by the brief): NestJS 11 + Mongoose on one shared MongoDB Atlas db, Next.js App Router, Stripe test mode, FXRatesAPI.

## Sources of truth (in this order; when they disagree, the higher one wins)
1. `docs/requirements/reqs.json`: the official workbook (`Final__SP1_Reviewed_Requirements.xlsx`, 104 mandatory + 11 bonus) as JSON.
   Look up one ID with the `req` skill or `node .claude/skills/req/req.mjs FLT-22`. Never read the file whole. Never edit it.
2. `docs/requirements/project-description.md`: the brief (endpoint table §8, rendering §9, Git rules §10, AI policy §11).
3. Jira project TRVL (who owns what, which sprint). Snapshot: `docs/requirements/jira-map.json`, summary `docs/team/ownership.md`.
4. `docs/architecture/` (ADRs, `decisions.md`, ERD, module map), then the code.
Mandatory before bonus. A bonus feature never replaces or weakens a mandatory one.

## Repository map
```
backend/      NestJS API. src/common (contracts, guards, pipes, filters, utils), src/modules/<feature>, test/ (e2e)
frontend/     Next.js (M2, not scaffolded yet)
docs/         requirements/ · architecture/ · api/openapi.json (generated) · specs/ (one per requirement) · team/ · reviews/
.claude/      rules/ (path-scoped rules, loaded automatically) · skills/ · agents/ · hooks/
.github/      CI (build-lint-test) and the PR gate (pr-requirements)
```

## Non-negotiables
- **Requirement IDs everywhere**: branch `feature/<ID>-slug` or `fix/<ID>-slug` off `develop`; commits `type(scope): summary [ID]`;
  Swagger summary starts with `[ID]`; PR title/body names the ID and the Jira key.
- **Tests first** for every behaviour change; each acceptance sentence of the requirement maps to at least one named test.
  Never delete, skip or weaken a test to go green.
- **Modules never import each other.** Cross-module calls go through `backend/src/common/contracts` tokens. Contract changes are Leader-only.
- **Money** is integer minor units in `PLATFORM_CURRENCY` (USD); use `common/utils/money.ts`. **Time** is stored UTC; show airport/hotel local time.
- **Errors** `{statusCode,error,message,fieldErrors?,path,timestamp}`. **Lists** `?page=N`, size fixed at 10, `{items,page,limit,total,totalPages}`.
- **Backend enforces** validation, roles, ownership and provider scope (GEN-13, ACC-11). Frontend checks never replace it.
- **Secrets** live only in `backend/.env`. Never read, print or commit `.env`, `team-db-access/` or keys. Fixtures use `<user>:<password>`.
- **AI_PROMPTS.txt**: append one entry per AI-assisted change (format in `.claude/rules/docs.md`; CI checks it).
- **Endpoint change** → `cd backend && npm run openapi:export`, commit `docs/api/openapi.json` (CI fails on drift).
- Never push to `develop`/`main`, never force-push, never `--no-verify`. Jira writes only after Ahmed approves in chat.
- `.claude/hooks/guard.mjs` enforces the secret, push and source rules. Agents cannot edit `.claude/settings*.json`,
  `.claude/hooks/`, `.git/`, the official requirement files, or files outside the project (except the OS temp dir and
  `~/.claude/projects/`), whether through Edit/Write or the shell; a person changes those.

## Workflow for one requirement (one ID = one branch = one PR)
1. `req <ID>`: read the verbatim requirement, Jira key, owner, dependencies. Confirm you own it (`docs/team/ownership.md`).
2. Spec: copy `docs/specs/_template.md` to `docs/specs/<ID>.md`. Acceptance verbatim → endpoints → data → rules → tests → edge cases.
   Non-trivial design? Use `superpowers:brainstorming` first.
3. Build test-first (`superpowers:test-driven-development`), small commits.
4. `pr-ready <ID>` before pushing: gates, traceability row, AI_PROMPTS entry, OpenAPI export, self-review.
5. Push; the PR opens automatically into `develop`. Ahmed reviews and merges. Ask Ahmed in the PR for any contract or wiring change.
Keep each session to one requirement; at ~60% context run `handoff`, then `/clear`.

## Commands (run in `backend/`)
`npm ci` · `npm run build` · `npm run lint` · `npm test` · `npm run test:e2e` · `npm run openapi:export`
On Windows run Jest with `--runInBand` (MongoMemoryServer start timeout). Root check: `node .github/scripts/repo-consistency.mjs`.
Long output → a file in your OS temp dir; read only the tail.

## Project skills (`.claude/skills/`, invoke by name)
| Skill | Use it to |
|---|---|
| `req` | Print one requirement verbatim with Jira key, owner, sprint, deps and traceability status |
| `implement-requirement` | Run the full spec → TDD → Swagger → traceability flow for one ID |
| `pr-ready` | Run every gate and checklist item CI and the reviewer will check |
| `handoff` | Save a short local handoff (`.claude/handoff/<you>.md`, gitignored) before `/clear` |
| `jira-sync` | Leader only: compare Jira with the repo, propose transitions, refresh `jira-map.json` |
| `release` | Leader only: M1/M2 freeze, verification and tagging checklist |

Project agents (`.claude/agents/`): `scout` (cheap lookups), `requirement-verifier` (independent PASS/FAIL against the workbook),
`security-reviewer` (auth, ownership, money, Stripe, uploads). Use them for review, never to write code in parallel on shared files.

## Recommended installed skills (use when installed; the project works without them)
| Task | Skill |
|---|---|
| Design a feature, plan, debug | `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:systematic-debugging` |
| Build and finish | `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review` |
| NestJS / API / MongoDB | `ecc:nestjs-patterns`, `ecc:api-design`, `mongodb-atlas:mongodb-schema-design`, `mongodb-atlas:mongodb-query-optimizer` |
| Security and review | `security-review`, `ecc:security-review`, `code-review`, `pr-review-toolkit:review-pr` |
| Frontend (M2) | `impeccable:impeccable`, `taste-skill:design-taste-frontend`, `anthropic-skills:frontend-design`, `ecc:nextjs-turbopack`, `ecc:react-patterns`, `design:accessibility-review` |
| Context and agents | `context-engineering:context-optimization`, `context-engineering:multi-agent-patterns`, `superpowers:dispatching-parallel-agents` |
