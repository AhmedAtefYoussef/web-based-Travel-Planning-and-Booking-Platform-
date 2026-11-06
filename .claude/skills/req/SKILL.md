---
name: req
description: Look up a requirement by ID (e.g. FLT-22, PAY-03, ACC-07a) or Jira key (TRVL-42) - verbatim workbook text, dependencies, Jira owner and sprint, brief endpoints, spec and traceability status. Use before starting, reviewing or discussing any requirement, instead of reading reqs.json or the xlsx.
---

Run from the repository root and show the output as-is:

```bash
node .claude/skills/req/req.mjs <ID> [ID...]
node .claude/skills/req/req.mjs --owner <slug>   # ahmed, abdelrahman, joudy, karim, malak, sandra, sarah
```

Then, if the user is about to implement it:
- Check the owner matches the user. If not, say who owns it and stop unless the user confirms a reassignment that Ahmed approved.
- List unfinished dependencies (run the script on each one) and which contract token or stub covers each.
- Split the requirement text into numbered acceptance sentences. Each one later needs a named test.

The workbook text is authoritative. Never paraphrase it into something stricter or looser; quote it.
