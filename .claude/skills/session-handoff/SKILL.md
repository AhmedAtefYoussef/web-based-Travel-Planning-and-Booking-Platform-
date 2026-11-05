---
name: session-handoff
description: Use when the user says "handoff", "wrap up", "end session", before running /clear, or when context reaches about 50%.
---

# Session handoff

First run `node .claude/hooks/lib/who.mjs` (team mode, CLAUDE.md "## Roles").
- **Member** (role `member`): write ONLY `.swarm/handoff/<slug>.md` (overwrite, <= 40 lines, gitignored): done this session,
  in-flight (branch, last commit, failing tests by name), decisions or contract questions for the Leader, next 3 actions.
  Add your `AI_PROMPTS.txt` entry (append at the end, your own name in "Student:"), run `node .github/scripts/repo-consistency.mjs`,
  then print the 3-line resume prompt with `Resume: read .swarm/handoff/<slug>.md`. Never edit state.md, HANDOFF.md, ledger, metrics or context.md.
- **Unidentified**: stop and ask the user to set CLAUDE_TEAM_MEMBER (docs/team/claude-code-onboarding.md).
- **Leader**: the steps below.

Write the files in this order. Budgets are hard limits; trim, do not exceed.

1. `.swarm/HANDOFF.md` (overwrite, <= 60 lines):
   - done this session
   - in-flight: branch, last commit, failing tests by name
   - decisions made, with where each was recorded
   - next 3 actions
   - open questions for Ahmed
2. `.swarm/state.md` (<= 40 lines): base commit, blocker, waves, Jira counts.
3. `.swarm/ledger.md`: append one line per merged PR.
4. `.swarm/metrics.md`: one row per card run (card | model | retries | followups | result words | tokens | verdict | note).
5. `AI_PROMPTS.txt`: one entry per distinct AI-assisted task (format checked by CI; real dates only).
6. `.swarm/context.md` (<= 60 lines): add any new decision under `## decisions` and bump `vN`.
7. Run `node .github/scripts/repo-consistency.mjs` and fix what it reports.

Commit docs-only changes on the current branch only if Ahmed asked; otherwise leave them staged and say so.

## Compaction of T3
- `ledger.md` > 80 lines: move older lines to `.swarm/archive/ledger-<date>.md`, keep a 5-line summary.
- Merged cards and results go to `.swarm/archive/wave-<n>/`.
- `bulletin.md` resets at each wave start; carry valid facts into `context.md`.

## Finish with exactly this resume prompt (3 lines)
```
Resume: read .swarm/state.md and .swarm/HANDOFF.md.
Unit of work: <card or Jira key>, branch <branch>, owns <globs>.
First action: <next action 1>.
```

## Common mistakes
- Exceeding a line budget instead of cutting.
- Skipping the consistency script.
- Recording a decision only in chat.
