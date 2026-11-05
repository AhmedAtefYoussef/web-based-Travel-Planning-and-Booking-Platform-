---
name: swarm-verify
description: Use when a worker subagent returns a result block, or when asked to verify, accept or merge a swarm card.
---

# Swarm verify

Inputs: card id `<id>`, worktree path `<worktree>`, base commit `<base>`.

1. Save the worker's inline reply verbatim to `.swarm/out/<id>.md` (workers in worktrees cannot write there).
2. Run the mechanical check:
   `python .swarm/bin/check.py <id> <worktree> <base> .swarm 120`
   It checks result length (120 words), OWNS compliance and the result block. Any failure means retry or fix card.
3. Run every DONE WHEN command yourself inside `<worktree>`. Do not trust the worker's EVIDENCE lines. Send long output to `.swarm/tmp/<id>.log` and read the tail.
4. Add a metrics row to `.swarm/metrics.md`. No row, no merge.
   `card | model | retries | followups | result words | tokens | verdict | note`
5. Decide:
   - Pass: open a PR to develop (Ahmed approves and merges, squash). Never push to develop or main.
   - Fail: write a fix card (use swarm-card). Followups per card are capped by FOLLOWUP_CAP in `.swarm/config.md` (3); retries by RETRIES (2). Past the cap, escalate to Ahmed.
6. After merge: `git worktree remove <path>`, delete the local branch, add one line to `.swarm/ledger.md`.

## Red flags
- Merging on the worker's say-so without running DONE WHEN.
- Skipping the metrics row.
- Fix card that widens OWNS beyond the original card.
- Worker output that edits `backend/package.json` or the lockfile.
