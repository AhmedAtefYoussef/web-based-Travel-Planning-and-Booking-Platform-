# Claude Code onboarding (team members)

## 1. Get the repo
```bash
git checkout develop && git pull origin develop
```
Create your work branch from develop: `feature/<ID>-short-name` or `fix/<ID>-short-name`.

## 2. Install
- Claude Code: https://docs.claude.com/en/docs/claude-code (CLI, desktop app or IDE extension).
- Superpowers plugin, inside Claude Code: `/plugin marketplace add obra/superpowers-marketplace`,
  then `/plugin install superpowers@superpowers-marketplace`.
- The repo already contains the shared setup: CLAUDE.md, .claude/ (hooks, skills, commands, agents).

## 3. Tell Claude Code who you are
Your slug is in `.claude/team.json` (abdelrahman, malak, joudy, karim, sandra, sarah).
PowerShell (persists for new terminals):
```powershell
setx CLAUDE_TEAM_MEMBER karim
```
bash / Git Bash (add to ~/.bashrc):
```bash
export CLAUDE_TEAM_MEMBER=karim
```
Check it: `node .claude/hooks/lib/who.mjs` should print your name and `"role": "member"`.
If it is not set, the hooks fall back to `git config user.name`; if that does not match, you get no owned paths.

## 4. First session prompt (copy as is)
See "Part C — team members" in docs/agentic/handoff-prompt.md.

## 5. Habits
- One unit of work (one requirement ID) per session. At about 50% context run `/handoff`, then `/clear`.
- `/handoff` writes your own `.swarm/handoff/<slug>.md` (not committed). The next session reads it automatically.
- Long command output: `npm test > .swarm/tmp/test.log 2>&1`, then read only the tail.

## 6. What you may do
- Edit your owned paths (docs/team/ownership.md): your modules, their `*.spec.ts`, your `backend/test/<module>*.e2e-spec.ts`.
- Use other modules only through the contract tokens in `backend/src/common/contracts`.
- Open one PR per requirement ID into develop, with What / Why / How to verify and your traceability rows in the description.

## 7. What you may not do (the guard hook blocks it)
- Edit `.swarm/` state files or task cards, `backend/src/app.module.ts`, `backend/src/common/contracts/`, `.github/`,
  `docs/requirements/` or `.claude/`. Need a change there? Ask Ahmed in a PR comment or issue.
- Read or print any `.env` file or credentials. Write to Jira. Push to develop/main, force-push, or merge PRs (Ahmed merges).

## 8. AI_PROMPTS.txt without merge conflicts
1. Before committing: `git fetch origin && git rebase origin/develop`.
2. Append your entry at the END of AI_PROMPTS.txt, after the last `====` line, with your own name in "Student:" and today's date.
3. Run `node .github/scripts/repo-consistency.mjs` (CI runs the same check).
4. If the rebase conflicts in AI_PROMPTS.txt, keep both sides' entries, in date order, then `git rebase --continue`.
