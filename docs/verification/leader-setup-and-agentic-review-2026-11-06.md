# Leader setup V&V and agentic-workflow review — 2026-11-06

Scope: (A) repository cleanliness and consistency, (B) the Leader's setup/scaffolding duties
from `docs/requirements/project-description.md`, (C) how the agentic workflow changed after
context engineering v2 (PR #21, merged 2026-11-05 as `6efa26b`).
Baseline: `origin/develop` `e7b4743` (PRs #1–#25 merged), clean detached checkout.

## A. Gates on a clean develop checkout

| Check | Result |
|---|---|
| `npm ci` | OK |
| `npm run lint` | 0 errors, 9 warnings (unchanged baseline) |
| `npm run build` | OK, `dist/main.js` present |
| Unit (`jest --runInBand --coverage`) | 237/237 · lines 70.6% · branches 73.4% · functions 73.9% |
| E2E (`test:e2e --runInBand`) | 89/89 |
| `openapi:export` | no content drift |
| `repo-consistency.mjs` | AI_PROMPTS format and `.env.example` keys consistent |
| Working tree after all gates | clean (0 changes) |
| Secret-looking literals in tracked files (Stripe sk_/whsec_, AWS keys, Mongo URIs with passwords) | none |
| `backend/.env` ignored | yes (`backend/.gitignore:5`); `team-db-access/` ignored (root `.gitignore:15`) |
| `npm audit --omit=dev` | **2 high, 2 moderate** (see F3) |

Note: parallel Jest runs on Windows can fail with `MongoMemoryServer ... failed to start within 10000ms`
(seen 3 times today). Serial runs (`--runInBand`) pass every time. CI (Linux) is unaffected.

## B. Leader duties vs the project description

| # | Requirement (project description) | Evidence | Verdict |
|---|---|---|---|
| B1 | §10.1 repo structure: backend/, frontend/, docs/requirements, docs/api, AI_PROMPTS.txt, README.md, .env.example, .gitignore | all present; frontend is an M2 placeholder | PASS |
| B2 | §10.2 long-lived `main` + `develop`; no feature work on main | both exist, default = develop, both protected (1 review, CODEOWNERS, required checks build-lint-test + pr-requirements, no force push/delete); main only received release PRs #13, #15 | PASS |
| B3 | §10.3 short-lived `feature/<ID>-…` / `fix/<ID>-…` branches from develop | 24/24 PR branches follow the prefixes; 2 lack an ID (`chore/SETUP-deps`, `fix/build-exclude-scripts`) | PASS (minor) |
| B4 | §10.6 Conventional Commits with requirement IDs | 44/44 non-merge commits conventional; 43/44 carry an ID (only the initial commit lacks one) | PASS |
| B5 | §10.5 PRs: meaningful title, IDs, related changes only, reviewed by the leader | titles carry IDs except #15 "Develop" and #18 "Main"; **every merged PR shows `REVIEW_REQUIRED`**: merged through admin bypass, no review recorded on GitHub | PARTIAL (F4) |
| B6 | §10.7 history shows team contributions; leader verifies conflict resolution | **58/58 commits on develop are Ahmed's**; the only member PR (#20, Sandra) has waited since 11-04 with 0 reviews | RISK (F1) |
| B7 | §8.11 shared Atlas DB created by leader, credentials shared securely, `.env` gitignored, `.env.example` documents names | cluster recorded in state.md (A9, done 11-04); `.env` ignored; `.env.example` complete and checked by CI. Atlas itself not inspected (Atlas tools not authorised in this session) | PASS / Atlas UNVERIFIED |
| B8 | §11.1 AI_PROMPTS.txt maintained | present, current to 11-06, format checked by CI | PASS (process friction, F5) |
| B9 | §7.1/§13.1 Swagger-documented API, README with setup | Swagger summaries start with [ID]; OpenAPI export has no drift (CI-checked); README covers prerequisites, install, env, scripts, Swagger, Stripe, tests, PR flow | PASS |
| B10 | §1.1 one backend, feature modules, wiring | `app.module.ts` wiring and `common/contracts` are Leader-owned and in place; only audit, currency, payments, uploads modules exist so far | PASS for scaffolding; M1 scope at risk (F1) |
| B11 | §5.1 reference data seeding, §6.1 seeded admin | owned by Joudy (`database/seeds/reference*`) and Abdelrahman (`seeds/admin*`); env vars exist, no seed code yet | Not Leader-owned; not started |
| B12 | Release discipline (M1 tag `v1.0.0-m1` on 2026-11-20) | no tags yet; develop is 43 commits ahead of main | Not due |

## Findings

| ID | Sev | Finding | Recommendation |
|---|---|---|---|
| F1 | **High (schedule)** | 14 days to M1. Develop has 4 of ~10 feature modules; no member code merged; Ahmed's own 7 booking-engine stories (FLT-12/22/23, HTL-16/17/18, GEN-11) plus TRVL-144 are To Do. §13.1 requires "Git history showing team contributions". | Review/merge PR #20 now; set a member PR deadline; start FLT-22/HTL-18 holds next. |
| F2 | Medium | Verification report and fix cards live only on the **unpushed** branch `chore/VERIFY-sprint0`. PRs #22–#25 cite `docs/verification/sprint0-verification-report.md`, which does not exist on develop. | Push the branch and open a docs PR. |
| F3 | Medium | `npm audit`: multer 2.0.0–2.4.0 DoS (GHSA-q7qp-rjg7-q26m, high) via `@nestjs/platform-express`, and js-yaml (moderate) via `@nestjs/swagger`. The upload code has no async `fileFilter`, so the multer path looks unreachable today, but GEN-08 uploads use multer. | Bump `@nestjs/platform-express` / `@nestjs/swagger` in a deps PR; rerun gates. |
| F4 | Low | All 24 merged PRs merged with `REVIEW_REQUIRED` (admin bypass, `enforce_admins=false`). Evaluators reading GitHub see no review trail. | Ask a teammate to review the Leader's PRs, or at least leave a review comment before merging. |
| F5 | Low | `AI_PROMPTS.txt` conflicts on every overlapping PR (shared append point). | Per-PR fragment files plus a build script (proposed task "Stop AI_PROMPTS.txt merge conflicts"). |
| F6 | Low | 21 remote branches for already-merged PRs; `delete_branch_on_merge=false`. Mixed merge styles (squash for #1–#21, merge commits for #22–#25) while state.md A4 says squash. | Enable auto-delete of head branches; delete merged branches; pick one merge style. |
| F7 | Low | PR titles #15 "Develop" and #18 "Main" are not meaningful (§10.5). | Use "release: develop → main (date)" for release PRs. |

## C. Agentic workflow: before (v1, PRs #1–#19) vs after context engineering (v2, PR #21 onward)

Data: `.swarm/metrics.md`, `.swarm/ledger.md`, `docs/agentic/context-engineering-spec.md` §0/§2,
file sizes, PR history and today's review.

### C1. Goals in the spec

| Spec goal | v1 | v2 (measured) | Verdict |
|---|---|---|---|
| G-1: fresh session at full context with ≤15k tokens and ≤5 tool calls | No CLAUDE.md; context rebuilt by hand from `.swarm/`; sessions reached ~60% | SessionStart hook auto-prints CLAUDE.md (4.5 KB) + state (3.3 KB) + HANDOFF (4.2 KB) ≈ 12 KB ≈ **3k tokens, 0 tool calls**; scoped `backend/CLAUDE.md` 3 KB on demand | **Met**, roughly 5× under budget |
| G-3: every fact in a repo file | decisions trapped in chat (G3) | handoff + state + resolutions files exist and were used | Met in structure; **not kept current** (C3) |
| G-4: keep the gates | — | CI gates and swarm cards unchanged and passing | Met |

### C2. Cost and quality

| Measure | v1 | v2 | Change |
|---|---|---|---|
| Verification cost per atomic check | W3: 1 run, 169k tokens, ~10 checks → **~17k/check** | Sprint 0 V&V: 10 runs, ~924k tokens, 243 checks → **~3.8k/check** | **~4.5× cheaper per check**, 24× more checks |
| Mean tokens per scoped verifier run | 169k (one broad run) | 94k (8 scoped runs, 30k–151k) | −44% per run |
| Implementation cards needing Leader rework or a follow-up card | 7 of 12 (t0 patch, t1 wiring, t2/t3 follow-ups, t4 via t5, t6 rewrite, W3 FAIL) | Wave A: 0 of 4 needed a follow-up card; 2 of 4 had a Leader edit before PR (#23 fixture, #25 typed hook) | Rework roughly halved (58% → 0–50%) |
| Defects found after merge in the produced code | 11 Medium in v1 code (Sprint 0 V&V) | Wave A independent review: 0 blocking, 1 Low (`.env.example`), fixed same day | Clearly better; small sample (4 PRs) |
| First-push CI result | not recorded | 4/4 green | — |
| Implementation tokens per card | mean ~163k per run | **not recorded**: Wave A rows still "pending approval" | Cannot compare |

### C3. What v2 did not fix (or regressed)

| Spec gap | Status today |
|---|---|
| G2 state drift | **Recurring.** `state.md`/`HANDOFF.md` dated 11-05, 10 commits behind develop; they still say "no card dispatched" although Wave A is merged. The SessionStart hook warned about it. The `/handoff` ritual was skipped at the end of the Wave A session. |
| G5 incomplete metrics | **Recurring.** 11 rows "pending", including the 4 Wave A cards that ran and merged; the ledger stops at PR #21. |
| G4 stale worktrees | **Recurring.** 7 worktrees, 4 for already-merged branches. |
| G6 check.py misses ignored files | Fixed (`check.py` lines 27–29). |
| G7 absolute paths in cards | Fixed (0 cards). |
| G8 `team-db-access/` not ignored | Fixed. |
| G9 AI_PROMPTS behind | Fixed (current, CI-checked). |
| G10 no M2 context | Partly fixed (`frontend/CLAUDE.md` exists). |
| G11 no handoff ritual | Exists (`session-handoff` skill, `/handoff`), but adoption is manual and was skipped once. |
| New: guard hook false positives | `guard-bash` blocks the very `git ls-files`/`check-ignore` audit commands its own message recommends whenever a path contains `.env`. |
| New: guard gap | An agent wrote `merge=union` into `.git/info/attributes` (shared by all worktrees) during an integration test; no hook covers `.git/`. It silently changed later merges until removed. |

### C4. Verdict

Context engineering clearly improved **session start-up** (≈3k tokens, 0 tool calls, against a
15k/5-call target) and **verification efficiency** (~4.5× cheaper per check). It also coincided
with **fewer defects and less rework** in the code the agents produced, though four PRs is a
small sample. The weak spot is the same as before: **closing the loop**. State, handoff, metrics
and ledger only stay true if `/handoff` and `swarm-verify` actually run, and after Wave A they did not.

Cheapest next steps:
1. Run `/handoff` now: update state.md, HANDOFF.md, ledger (#22–#25), metrics (Wave A rows).
2. Make the drift warning blocking for the Leader, e.g. a Stop hook that refuses to end a
   session when develop has moved past the SHA in state.md.
3. Add `.git/` to the guard hook's protected paths; let `git ls-files`/`check-ignore` through.
4. Clean up the 4 merged worktrees (`clean_up_worktrees`) and delete merged remote branches.
