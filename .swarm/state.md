# state.md (Leader only, <=40 lines) — updated 2026-11-05
BASE: origin/develop c1cc80b (PR#1-#19 merged; #18 closed). main = develop minus #17/#19 (next release brings them).
BRANCH: chore/AGENT-context-engineering (handoff + v2 operating model, PR into develop).
GATE BASELINE (chore/AGENT-context-engineering = develop c1cc80b + docs/config, 2026-11-05):
Baseline: build OK (dist/main.js) · lint 0 errors/9 warnings · unit 172/172 · e2e 87/87 · repo-consistency OK.
BLOCKERS: Ahmed's open M1 stories (Jira, To Do): FLT-12 TRVL-37, FLT-22 TRVL-42, FLT-23 TRVL-43, HTL-16 TRVL-59, HTL-17 TRVL-60, HTL-18 TRVL-61, GEN-11 TRVL-106, TRVL-144 concurrency e2e (epic TRVL-4 Booking Engine). Waiting on Ahmed: review/merge PR#20 (Sandra, TRVL-140 hotel schemas) and the handoff PR.
JIRA (owner-ahmed, 2026-11-05): 34 issues · Done 18 · In Progress 2 (TRVL-1, TRVL-136) · To Do 14 (incl. 7 M1 stories above, M2 FE-01/02/16, GEN-17). Ownership: docs/team/ownership.md (from Jira). TRVL-10 commented only.
SCOPE done: PAY-01..04, GEN-02/05/07/08/13, ITN-18 rates — PASS in traceability.md. Open: booking engine stories in BLOCKERS.
NEXT: booking engine (FLT-22/HTL-18 holds first, then FLT-23/HTL-17 confirm via PAYABLE_BOOKING, GEN-11 lifecycle, HTL-16, FLT-12); then TRVL-136 release prep — freeze 2026-11-18, bug bash, develop->main, tag v1.0.0-m1 on 2026-11-20 (Ahmed tags). M2 due 2026-12-11.
INFRA: Atlas project "Travel Platform SP1", cluster travel-cluster (M0, AWS EU_CENTRAL_1, db travel_platform). Users + handouts sent 11-04.
REPO SETTINGS: default branch develop · auto-merge off · CODEOWNERS * -> Ahmed · develop strict, main strict=false ·
  required checks build-lint-test + pr-requirements · dismiss stale + last-push approval · admins not enforced.
ASSUMED DEFAULTS (Ahmed-confirmed 2026-11-02):
 A1 PLATFORM_CURRENCY=USD (env-driven; minor units). A2 tests on mongodb-memory-server replica set.
 A3 dev-only POST /api/payments/:id/test-confirm (404 in production); booking confirmed only via webhook.
 A4 PRs into develop, Leader/Ahmed merges (squash); develop->main only at releases.
 A5 daysRemaining = calendar-day diff in provider tz (common/utils/dates.ts); caller passes it to quote().
 A6 Audit actions: suspend/reactivate account, provider deactivate/reactivate, moderator create, admin password reset, report resolve, content hide/delete.
 A7 Pagination fixed size 10; limit != 10 -> 400.
 A8 Stripe mocked in tests; webhook signature via real Stripe webhooks util + fake secret.
 A9 TRVL-128 Atlas was Ahmed-only — Done 2026-11-04 (member confirmations not collected).
RISKS: personal repo -> PR author can press Merge after approval; Atlas member roles readWriteAnyDatabase + 0.0.0.0/0;
  WARP/strict DNS breaks mongodb+srv (use direct-host URI). Full list: .swarm/HANDOFF.md.
LESSONS: check ignored files in OWNS; worktree agents reply inline (cannot write .swarm/out); main-session-only Jira/merge writes after Ahmed's words;
  never trust drafted dates; verify PR state before reporting it.
