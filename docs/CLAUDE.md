# docs/ — documentation rules

## requirements/
- reqs.json is the source of truth (workbook export). Do not edit it (guard hook blocks it unless ALLOW_REQS_EDIT=1).
- plan.md and project-description.md are large: use the line index in /CLAUDE.md or Grep, never read them whole.
- traceability.md: one row per requirement ID: ID | Jira | endpoint(s) | code | proof test (file + exact test name) | command | owner | PR | status.
  Status PASS only after running that exact test (npx jest … -t "<name>") and seeing it pass. Otherwise FAIL or MISSING.

## architecture/
- erd.md: Mermaid erDiagram; every block must parse (balanced braces). Owner per collection.
- module-map.md: modules, DI tokens, who replaces which stub.
- ADRs: adr-00N-<slug>.md with Context, Decision, Consequences. A new cross-cutting decision gets an ADR or a line in .swarm/context.md ## decisions.

## api/
- openapi.json is generated: cd backend && npm run openapi:export. Never hand-edit; CI fails on drift.
- swagger-demo.md: call order for demos (dev Authorize headers, stripe listen, test-confirm).

## agentic/
- context-engineering-spec.md (operating model) and handoff-prompt.md. Read only to change the operating model.

## AI_PROMPTS.txt (repo root)
Format per project-description.md L551-567: entries separated by a line of "=", each with Date (YYYY-MM-DD), Student, Tool,
Related Requirement, Prompt, How the output was used. Real dates only. CI (repo-consistency.mjs) checks the format.
