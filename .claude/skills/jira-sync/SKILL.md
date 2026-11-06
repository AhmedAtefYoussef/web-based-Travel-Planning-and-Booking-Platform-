---
name: jira-sync
description: Leader only. Compare Jira project TRVL with the repository (merged PRs, traceability) and propose status transitions; refresh docs/requirements/jira-map.json. Use when Ahmed asks to sync Jira, update ticket status, or check the sprint board.
---

Jira site: `ahtefa913-1793451460332.atlassian.net`, project `TRVL`. Story points field `customfield_10037`, sprint `customfield_10020`.

1. Read (no writes): `project = TRVL ORDER BY key` with fields summary, status, assignee, labels. Use the sprint field
   only through `view: "evidence"` on small key sets (the full evidence view is too large).
2. Repo side: `gh pr list --state merged --base develop --json number,title,headRefName,mergedAt` and
   `docs/requirements/traceability.md` statuses.
3. Propose a table `key | ID | Jira status | repo evidence | proposed transition`. Rules: Done only with a merged PR and a
   PASS traceability row; In Progress when an open PR or branch exists.
4. Wait for Ahmed's explicit "yes" in chat for the listed keys, then transition only those. Never edit descriptions,
   assignees or sprints unless asked.
5. Regenerate `docs/requirements/jira-map.json` (same shape, new `snapshot` date) and the per-person lists in
   `docs/team/ownership.md` if assignments changed. Commit them on a `docs/` branch.

Members: do not run this skill. Move your own tickets in the Jira UI.
