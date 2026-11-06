---
paths:
  - "docs/**"
  - "AI_PROMPTS.txt"
  - "README.md"
---
# Documentation rules

## Read-only sources
- `docs/requirements/reqs.json`, the `.xlsx` files and `project-description.md` are copies of official material. Never edit them.
- `docs/api/openapi.json` is generated (`cd backend && npm run openapi:export`). Never hand-edit.
- `docs/requirements/jira-map.json` is a Jira snapshot refreshed by the Leader (`jira-sync` skill).

## Specs (`docs/specs/<ID>.md`)
- One per requirement, from `_template.md`, written before the code. The verbatim requirement and numbered acceptance
  sentences come first; every sentence maps to a named test. Update the spec in the same PR when the design changes.

## Traceability (`docs/requirements/traceability.md`)
- One row per requirement: ID | Jira | endpoints | code | proof tests (file: exact names) | command | status | owner | PR.
- PASS only after running exactly that command and seeing every listed test pass. Otherwise FAIL or MISSING.

## Architecture
- New cross-cutting decision: a line in `docs/architecture/decisions.md`, or an ADR (`adr-00N-<slug>.md`: Context, Decision,
  Consequences) if it changes how several modules work. Data model changes update `erd.md` (Mermaid must parse).

## AI_PROMPTS.txt (brief §11.1, checked by CI)
Append at the end of the file, one entry per materially AI-assisted change:
```
================================================
Date: YYYY-MM-DD
Student: <your name>
Tool: Claude Code (<model>)
Related Requirement: <ID>
Prompt:
<the prompt, or a short chronological summary of the important prompts>
How the output was used:
<what you kept, what you changed, how you verified it>
================================================
```
Real dates only. On a merge conflict keep both entries in date order (never `merge=union`).
