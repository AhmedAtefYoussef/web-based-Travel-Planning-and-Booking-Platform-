# Specs (one per requirement)

The workbook says *what*; a spec says *how this repo will satisfy it and how we prove it*. Write it before the code, in the
same branch, and keep it short (one screen is typical).

1. `node .claude/skills/req/req.mjs <ID>` and copy `_template.md` to `<ID>.md`.
2. Paste the requirement verbatim and split it into acceptance sentences A1..An. Do not add rules the text does not contain;
   if the text is ambiguous, write the interpretation under Decisions and ask Ahmed.
3. Fill API, data, rules, contracts. Name the proof test for every sentence before writing it.
4. The PR reviewer and the `requirement-verifier` agent check the code against this file and the verbatim text.

Frontend stories (FE-xx) use the same template with a "Pages and rendering" section instead of "API" (route, rendering
strategy per brief §9, API calls, states: loading/error/empty).
