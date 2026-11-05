Resume work on this repo using the v2 operating model.
1. Use the session-resume skill (or: read .swarm/state.md and .swarm/HANDOFF.md; the
   SessionStart hook already printed them). Do not read docs/agentic/context-engineering-spec.md
   unless we change the operating model.
2. Tell me in <= 5 lines: base commit, what is in flight, the next action you propose, and
   which files it will own.
3. Wait for my go, then work on that ONE unit only, test-first, following CLAUDE.md.
4. At ~50% context or when the unit is done, run /handoff and tell me to /clear.
Today's focus: TRVL-136 release prep for 2026-11-20 — confirm PR #21 (handoff) is merged and
develop is green, then draft the code-freeze (2026-11-18) and bug-bash plan for the team, and
list what PR #20 (Sandra, TRVL-140 hotel schemas) must satisfy before I review it.
