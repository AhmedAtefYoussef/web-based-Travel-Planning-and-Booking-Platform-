# Session handoff prompts

Two prompts. **Part A** goes into the current long session (the one at ~60%). **Part B** starts every fresh session afterwards.
The operating model they implement is `docs/agentic/context-engineering-spec.md`.

---

## Part A — paste into the CURRENT (60%) session

```text
We are ending this session and moving to fresh ones. Your job now is a lossless handoff:
extract everything a future session needs from THIS conversation and the repo, write it to
files, then set up the v2 operating model in docs/agentic/context-engineering-spec.md.

Ground rules for this handoff
- Your own conversation history is the primary source. It holds decisions, approvals and
  reasoning that exist nowhere else. Recall them, do not re-derive them.
- Context is limited. Do NOT re-read large files (plan.md, reqs.json, openapi.json, erd.md,
  .swarm/web/*). Use git, gh, Grep and line ranges. Send long command output to
  .swarm/tmp/*.log and read only the tail.
- Write each phase's file as soon as that phase is done, so nothing is lost if the
  conversation compacts midway. After a compaction, read .swarm/handoff/progress.md and continue.
- Mark every fact with its source: [chat] (decided/said in this session), [repo] (verified in
  files/git), [jira], [inferred]. Never present [inferred] as decided. If Ahmed's approval
  for something is unclear, list it under open questions instead of guessing.
- Never read or print .env files, team-db-access/, keys or tokens. Do not push. Do not write
  to Jira in this handoff.
- Keep .swarm budgets: state.md <= 40 lines, context.md <= 60 lines, HANDOFF.md <= 60 lines.

PHASE 0 — progress file
Create .swarm/handoff/progress.md with a checklist of phases 1-7 and tick each as you finish.

PHASE 1 — Ground truth from the repo (no large reads)
Collect into .swarm/tmp/ and summarise:
- git: current branch, `git status -sb`, `git log --oneline -25 --all --graph` (tail),
  `git branch -a -vv`, `git worktree list`, divergence of develop vs origin/develop and main.
- gh: open PRs (number, branch, checks, review state), last 10 merged PRs, latest CI run on
  develop. If gh is not authenticated, say so and continue.
- Which files changed after .swarm/state.md was last updated (compare git log dates with the
  state.md commit/mtime). I believe 2026-11-04 work (CI openapi drift check, pr-automation,
  pr-open, pr-requirements.mjs, CODEOWNERS, repo-consistency.mjs, README, env.schema.ts) is
  not recorded in .swarm. Confirm or correct.
- `git ls-files team-db-access .env backend/.env` — report only whether anything is tracked.

PHASE 2 — Session digest: .swarm/handoff/session-digest.md
Go through this whole conversation end to end and extract, with sources:
1. Timeline: each work block (wave, card, PR, fix) in order with date, outcome, commit/PR.
2. Decisions: every decision and who made it, with rationale. Include A1-A9 and anything
   decided after them. Note where each is recorded in the repo, or "NOT RECORDED".
3. Requirements status: for each ID in my scope (PAY-01..04, GEN-02/05/07/08/13, ITN-18 rates,
   TRVL-128..136, epics TRVL-1/6/10): status, PR(s), proof test file, and any acceptance
   criterion that is only partly met or relies on an assumption.
4. Architecture: module map, contracts/DI tokens and which teammate's module will replace
   each stub; cross-module rules; anything changed since docs/architecture/module-map.md.
5. Technical implementation details that are easy to lose: non-obvious invariants, edge cases,
   bugs found and how they were fixed, test-harness quirks (rawBody, memory-server replica
   set, Stripe mocks, ts-jest dynamic import), security review findings and their fixes.
6. Orchestration: what worked and what failed in the swarm (classifier blocks, out-dir write
   blocks, retries, card sizes, model choices, token use per card). Fill the missing
   .swarm/metrics.md rows (t1, t2, t5-t9, W3) from what you remember; mark unknowns "?".
7. Worktrees and branches: for each .claude/worktrees/agent-* entry: branch, merged or not,
   safe to remove or not, and why.
8. CI/automation: how ci.yml, pr-open.yml, pr-automation.yml and pr-requirements.mjs fit
   together, which rules they enforce, known limitations.
9. Teammates and ownership: who owns which requirement IDs/modules (from what is already in
   the repo and this chat), interfaces they must implement, things promised to them.
10. Ahmed-only actions and deadlines: TRVL-128, TRVL-136 (tag v1.0.0-m1 on 2026-11-20),
    M2 due 2026-12-11, anything else.
11. Open questions for Ahmed and known risks/tech debt, ranked.
12. Lessons: things a future session must do differently.

PHASE 3 — Refresh the .swarm state files
- state.md: rewrite to current truth (base commit, gate results, Jira counts, blockers,
  next actions). <= 40 lines.
- context.md: bump to v2; fold in still-valid bulletin facts and every decision from Phase 2
  that is not yet recorded; update "backend layout" to the current code. <= 60 lines.
- ledger.md: add every merged PR/commit since PR#12.
- metrics.md: add the rows from Phase 2.6.
- Archive finished cards and results to .swarm/archive/wave-1-3/ (git mv), keep api.md.

PHASE 4 — HANDOFF.md and AI_PROMPTS.txt
- .swarm/HANDOFF.md (<= 60 lines): done · in flight · decisions not yet in ADR/context ·
  next 3 actions · open questions · "do not do" list.
- AI_PROMPTS.txt: add one entry per distinct AI-assisted task since 2026-11-03 that has no
  entry yet (CI/OpenAPI gate, PR automation, verifier fixes if missing, this handoff).
  Real dates, exact format; then run `node .github/scripts/repo-consistency.mjs`.

PHASE 5 — Set up the v2 operating model
Read docs/agentic/context-engineering-spec.md sections 3, 5, 6, 7 only. Then:
- Create root CLAUDE.md from §3.1. Verify every plan.md / project-description.md line range
  with Grep before writing it; fix any that moved. Keep it <= 120 lines.
- Create backend/CLAUDE.md and docs/CLAUDE.md (§3.2, <= 60 lines each). Create
  frontend/CLAUDE.md as an M2 stub from §9.
- Create .claude/settings.json, .claude/hooks/{session-start,pre-compact,guard-paths}.mjs,
  .claude/skills/{session-handoff,session-resume,swarm-card,swarm-verify,trace-check,jira-sync}/SKILL.md,
  .claude/commands/{handoff,resume,card,verify,trace}.md, .claude/agents/{worker,verifier,security-reviewer,scout}.md
  per §5. Use the `superpowers:writing-skills` skill for the SKILL.md files. Check the hook
  and settings schema against this Claude Code version before writing (run /hooks or read
  the docs); if a field differs from the spec, follow the installed version and note it.
- Apply §6.3 to .swarm/bin/check.py and §6.2 (repo-relative paths) to any open card.
- §7.1: add team-db-access/ and .swarm/tmp/ to .gitignore. If team-db-access is tracked, STOP
  and tell me; do not rewrite history.
- Do NOT remove worktrees yet. List the removal commands in HANDOFF.md for me to approve.

PHASE 6 — Verify
- Run each hook once by hand and show its output (SessionStart output must be < 80 lines).
- Run: repo-consistency.mjs, and in backend/: npm run build, lint, test, test:e2e (logs to
  .swarm/tmp/, report counts only). Record the baseline in state.md.
- Self-audit: re-read session-digest.md and check that every decision in it now has a home in
  CLAUDE.md, context.md, an ADR, state.md or HANDOFF.md. List any that do not, and fix them.
- Estimate the tokens a fresh session spends on: CLAUDE.md + SessionStart output + HANDOFF.md.
  Target <= 15k. If over, trim.

PHASE 7 — Report and commit
- Create branch chore/AGENT-context-engineering from the current base, commit the docs/config
  changes with "chore(agent): context engineering v2 and session handoff [AGENT]" (do not push).
- Reply with at most 25 lines: what you wrote (paths), gate results, items that need my
  approval (worktree removals, team-db-access, open questions), and the exact Part B prompt
  filled in with the current branch and next action.
```

---

## Part B — paste into every FRESH session

```text
Resume work on this repo using the v2 operating model.
1. Use the session-resume skill (or: read .swarm/state.md and .swarm/HANDOFF.md; the
   SessionStart hook already printed them). Do not read docs/agentic/context-engineering-spec.md
   unless we change the operating model.
2. Tell me in <= 5 lines: base commit, what is in flight, the next action you propose, and
   which files it will own.
3. Wait for my go, then work on that ONE unit only, test-first, following CLAUDE.md.
4. At ~50% context or when the unit is done, run /handoff and tell me to /clear.
Today's focus: <fill in: e.g. "TRVL-136 release prep for 20 Nov" or "M2 card: API types + UI kit">
```

---

## Part C — team members (paste into every fresh session)

Set CLAUDE_TEAM_MEMBER first (docs/team/claude-code-onboarding.md). Then:

```text
Resume work on this repo as a team member (team mode).
1. Use the session-resume skill. The SessionStart hook already printed who I am, my owned paths,
   .swarm/state.md (read-only for me) and my handoff .swarm/handoff/<my-slug>.md.
2. Tell me in <= 5 lines: base commit, my in-flight work, the next action you propose, and which of
   MY owned paths it touches (docs/team/ownership.md).
3. Wait for my go, then work on that ONE requirement ID only, test-first, following CLAUDE.md "## Roles".
   If it needs a contract, app.module.ts or other Leader-only change, stop and draft a PR comment for Ahmed instead.
4. At ~50% context or when the unit is done, run /handoff and tell me to /clear.
Today's focus: <requirement ID and goal, e.g. "FLT-22 seat holds: atomic hold + 10-minute expiry">
```

---

## Usage notes
- Run Part A before the old session auto-compacts. If it compacts anyway, the progress file lets it continue.
- Part A writes a lot; if it gets to ~85% context, tell it: "Finish the current phase, update progress.md and HANDOFF.md, stop." Then run the remaining phases in a fresh session with Part B plus: "Continue the handoff from .swarm/handoff/progress.md."
- After the first fresh session, compare its startup token count with the 15k target and record it in `.swarm/metrics.md`.
