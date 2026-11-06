# Team onboarding (Claude Code)

## One-time setup
1. Clone, then `cd backend && npm ci`. Copy `../.env.example` to `backend/.env` and paste the values Ahmed shared privately.
   Never commit or paste `.env` into a chat.
2. `git config user.name "<Your Name>"` (the first name is your slug for handoffs).
3. Open Claude Code in the repository root. The project settings, rules, skills, agents and hooks in `.claude/` load
   automatically; approve the project hooks when asked.
4. Recommended plugins (install in your own Claude Code; the project works without them, but the skill table in
   `CLAUDE.md` names them): `superpowers`, `ecc`, `mongodb-atlas`, `pr-review-toolkit`, `code-review`,
   `context-engineering`; for Milestone 2 also `impeccable`, `taste-skill`, `ui-ux-pro-max`, `design`.

## Every task
```
req <ID>                      # verbatim requirement, owner, deps, endpoints
implement-requirement <ID>    # spec -> failing tests -> code -> Swagger
pr-ready <ID>                 # gates + traceability + AI_PROMPTS before pushing
handoff                       # before /clear or when context is ~60% full
```
One requirement per branch and per PR. Push your branch; the PR into `develop` opens automatically. Ahmed reviews and merges.

## What you must not do
- Edit files of a requirement you do not own, `common/contracts`, `app.module.ts`, `.github/`, `.claude/`, `docs/requirements/`
  (ask Ahmed in the PR instead).
- Push to `develop`/`main`, force-push, skip hooks, or merge your own PR.
- Delete or weaken a test to make CI pass.

## Getting help
- "Where is X?": ask Claude to use the `scout` agent.
- "Does my work meet the requirement?": ask for the `requirement-verifier` agent on your ID.
- Auth, payments, uploads or admin changes: ask for the `security-reviewer` agent before pushing.
