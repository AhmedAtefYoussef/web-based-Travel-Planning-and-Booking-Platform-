---
name: session-resume
description: Use at the start of a session, or when the user says "resume", "where were we", "continue", or after /clear.
---

# Session resume

Target: 5 tool calls or fewer before real work starts.

1. The SessionStart hook has already printed `.swarm/state.md`, `.swarm/HANDOFF.md`, `git status -sb`, the branch and the last 5 commits. Use that output; do not re-read those files.
2. State in ONE line: the unit of work, the card or Jira key, and the files it owns.
3. Read only the T2 sections the card lists (`context.md ## sections`, `api.md ## section`, INPUTS line ranges).

## Rules
- One unit of work per session.
- T3 is off limits without a specific Grep target: `.swarm/ledger.md`, `.swarm/archive/`, `.swarm/web/`.
- Never read whole large files (plan.md, reqs.json, openapi.json); use the line index in `CLAUDE.md` or Grep by id.
- Exploration goes to a subagent with a <= 120-word return; the main thread never holds raw search dumps.
- At about 30% context ask "am I still on the one unit?"; at about 50% run `/handoff` then `/clear`.

## If the hook output is missing
Run `git status -sb`, `git log -5 --oneline`, then read `.swarm/state.md` and `.swarm/HANDOFF.md` once.
