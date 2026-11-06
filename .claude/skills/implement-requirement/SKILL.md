---
name: implement-requirement
description: End-to-end flow to implement one requirement ID (spec, tests first, NestJS code, Swagger, OpenAPI export, traceability, AI_PROMPTS). Use when the user says "implement FLT-11", "build HTL-18", "start my next task" or similar.
---

One requirement ID per run, on its own branch. Stop and ask when a step needs a decision the user has not made.

## 1. Understand
- Run `node .claude/skills/req/req.mjs <ID>`. Confirm the user owns it and the dependencies exist (real or stubbed).
- `git fetch origin && git switch -c feature/<ID>-<slug> origin/develop` (or `fix/`). Never work on `develop`/`main`.

## 2. Spec (docs/specs/<ID>.md)
- Copy `docs/specs/_template.md`. Paste the requirement verbatim and number every acceptance sentence (A1, A2, ...).
- Fill endpoints (match project-description.md §8 paths), DTOs, data (schemas, indexes), business rules, auth (role, ownership,
  provider scope), errors (400/401/403/404/409), and the test list: at least one named test per acceptance sentence.
- Design choices with real trade-offs: use `superpowers:brainstorming`; record the outcome in the spec "Decisions" section.
- Needs a new or changed contract, a new dependency, `app.module.ts` wiring or `.env` variable? Write it in the spec and ask
  Ahmed (PR comment or chat). Do not edit Leader-owned files yourself.

## 3. Tests first
- Write the failing tests named in the spec (`superpowers:test-driven-development`): unit `*.spec.ts` beside the code for rules;
  e2e `backend/test/<module>.e2e-spec.ts` for each endpoint (auth, validation, happy path, each error).
- Concurrency rules (holds, likes, one-review-per-booking) need a test that fires parallel requests and asserts the invariant.
- Run them and see them fail for the right reason.

## 4. Implement
- Follow `.claude/rules/backend.md`. Smallest code that passes; no speculative abstractions.
- Swagger on every route: `@ApiTags`, `@ApiOperation({ summary: '[<ID>] ...' })`, response DTO, `@ApiErrors(...)`.
- `npm run openapi:export` after endpoint changes.

## 5. Verify and record
- Run the `pr-ready` skill. It runs the gates, updates the traceability row and checks the AI_PROMPTS entry.
- Commit `feat(<module>): <summary> [<ID>]`, push, and put the traceability row and Swagger demo steps in the PR body.
