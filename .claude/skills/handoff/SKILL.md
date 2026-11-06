---
name: handoff
description: Save a short session handoff before /clear or ending a session, and print the prompt to resume. Use when the user says handoff, wrap up, end session, or context is above ~60%.
---

1. Find the slug: `git config user.name`, lowercased first name (ahmed, abdelrahman, joudy, karim, malak, sandra, sarah).
2. Write `.claude/handoff/<slug>.md` (gitignored, local only), at most 25 lines:
   ```
   # Handoff <YYYY-MM-DD> - <ID> on <branch>
   Done: (facts with file:line or test names)
   Verified: (command -> result)
   Not done / next step: (one concrete action first)
   Open questions for Ahmed:
   Gotchas learned:
   ```
   Only facts you verified this session. No copies of code or logs.
3. Print: `Resume: read .claude/handoff/<slug>.md, run git status, continue with the next step.`

A new session gets the file automatically from the SessionStart hook.
