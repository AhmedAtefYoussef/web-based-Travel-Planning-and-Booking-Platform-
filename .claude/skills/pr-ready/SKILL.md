---
name: pr-ready
description: Pre-push verification for a branch - runs build, lint, unit and e2e tests, OpenAPI drift and repo checks, then reviews the diff against the requirement, traceability, AI_PROMPTS and PR rules. Use before every push or PR, or when the user asks "is this ready?".
---

Report evidence, not opinions: every claim is a command and its result. Do not push; the user does.

## Gates (in `backend/`, logs to a temp file, read the tail)
1. `npm run lint` (0 errors) · `npm run build` · `npm test -- --runInBand` · `npm run test:e2e -- --runInBand`
2. `npm run openapi:export` then `git diff --exit-code -- ../docs/api/openapi.json` (commit the file if it changed)
3. From the root: `node .github/scripts/repo-consistency.mjs`

## Diff review (`git diff origin/develop...HEAD`)
- Only files for this one requirement; nothing under another member's module, `common/contracts`, `app.module.ts`, `.github/`,
  `docs/requirements/` or `.claude/` unless Ahmed asked for it.
- Every acceptance sentence in `docs/specs/<ID>.md` has a test whose exact name is in the spec; run them by name
  (`npx jest -t "<name>"`) and confirm they pass.
- No secrets, `.env`, `uploads/`, `console.log`, `any` without reason, skipped tests (`.skip`, `.only`, `xit`).
- Money as integer minor units; ownership/role checks on every non-public route; DTOs validated; Swagger summary starts with `[ID]`.
- Security-sensitive diff (auth, payments, uploads, ownership): run the `security-reviewer` agent and fix its blocking findings.

## Records
- `docs/requirements/traceability.md`: one row for the ID with endpoints, code, proof test names, the exact command, status PASS
  only if you just ran that command and it passed. Members: put the row in the PR body; Ahmed merges it into the file.
- `AI_PROMPTS.txt`: one entry appended at the end for this change (format in `.claude/rules/docs.md`), your own name in `Student:`.
- Commits: `type(scope): summary [ID]`. Branch `feature/<ID>-…` or `fix/<ID>-…`, rebased or merged on current `origin/develop`.

## Output
A table `check | command | result`, then `READY` or `NOT READY` with the list of fixes.
