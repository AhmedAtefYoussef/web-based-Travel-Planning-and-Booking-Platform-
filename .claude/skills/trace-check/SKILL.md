---
name: trace-check
description: Use before opening a PR or cutting a release, or when asked to update traceability or prove requirement IDs are covered.
---

# Trace check

Input: the touched requirement IDs (e.g. PAY-01, TRVL-67).

For each ID:
1. Grep `docs/requirements/reqs.json` by `"id"` to get `acceptance` (never read the file whole).
2. Find its row in `docs/requirements/traceability.md`. Row format:
   `ID | Jira | endpoint(s) | code | proof test (file + exact test name) | command | owner | PR | status`
3. Run the exact test name from `backend/`:
   - e2e: `npx jest --config test/jest-e2e.json -t "<name>"`
   - unit: `npx jest -t "<name>"`
   Send output to `.swarm/tmp/trace-<id>.log`; read only the tail.
4. Update the row: exact test name, the command that was run, status.
   - PASS only after that run exits 0 and the named test appears as passed.
   - FAIL if it ran and failed.
   - MISSING if no test exists or the name matches nothing.

## Rules
- Never write PASS without a run in this session.
- Never rename or weaken a test to make a row pass.
- A test name matching zero tests is MISSING, not PASS.
- Swagger summary for the endpoint starts with `[ID]`.

## After
Run `node .github/scripts/repo-consistency.mjs`. Report a one-line-per-ID table: ID | status | test name.
