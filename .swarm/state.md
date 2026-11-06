# state.md (Leader only, <=40 lines) — updated 2026-11-06
BASE: origin/develop e7b4743 (PR#1-#25 merged; #16, #18 closed). main = release PRs #13/#15; develop 43 commits ahead, no tags.
BRANCH: chore/VERIFY-sprint0 (local, not pushed), 3 ahead of develop (merged develop in d465dcd): sprint0 report, 12 fix cards,
  .swarm updates; uncommitted 11-06 Leader V&V report docs/verification/leader-setup-and-agentic-review-2026-11-06.md.
GATE BASELINE (develop e7b4743, clean checkout, 2026-11-06, serial Jest):
  build OK · lint 0 errors/9 warnings · unit 237/237 (lines 70.6%) · e2e 89/89 · openapi no drift · repo-consistency OK.
  npm audit --omit=dev: 2 high (multer via @nestjs/platform-express), 2 moderate (js-yaml via @nestjs/swagger).
BLOCKERS (M1 due 2026-11-20, 14 days): Ahmed's To Do stories FLT-12 TRVL-37, FLT-22 TRVL-42, FLT-23 TRVL-43, HTL-16 TRVL-59,
  HTL-17 TRVL-60, HTL-18 TRVL-61, GEN-11 TRVL-106, TRVL-144 concurrency e2e (epic TRVL-4).
  Team: 58/58 develop commits are Ahmed's; only member PR #20 (Sandra, TRVL-140) open since 11-04, 0 reviews.
WAVES (fix cards, approved "All" 2026-11-05):
  Wave A DONE: fix-PAY-03-1 #22, fix-PAY-01-1 #23, fix-TRVL-130-1 #24, fix-GEN-07-1 #25 (merged 11-06, reviewed: keep all).
  Wave B next: fix-GEN-08-1, fix-ITN-18-1, fix-PAY-02-1, fix-TRVL-130-2 (openapi.json; PAY-01-1 now merged, unblocked).
  Wave C: fix-TRVL-130-3, fix-TRVL-131-1, fix-TRVL-134-1. fix-DLV-13-1 needs an owner.
JIRA (2026-11-06 read, assignee Ahmed): 34 issues · Done 18 · In Progress 2 (TRVL-1, TRVL-136) · To Do 14. No Jira writes this session.
NEXT: push chore/VERIFY-sprint0 + docs PR; review PR #20; booking engine (FLT-22/HTL-18 holds first, then FLT-23/HTL-17 via
  PAYABLE_BOOKING, GEN-11, HTL-16, FLT-12); Wave B; deps PR; TRVL-136 freeze 2026-11-18, tag v1.0.0-m1 2026-11-20 (Ahmed tags).
INFRA: Atlas project "Travel Platform SP1", cluster travel-cluster (M0, AWS EU_CENTRAL_1, db travel_platform).
  After #22: run syncIndexes on Atlas (new stripeId_unique, booking_pending_unique, paymentIntentId_active_unique; old stripeId_1 redundant).
REPO SETTINGS: default develop · auto-merge off · CODEOWNERS * -> Ahmed · develop strict, main strict=false · required checks
  build-lint-test + pr-requirements · 1 review, dismiss stale, last-push approval · enforce_admins false · delete_branch_on_merge false.
ASSUMED DEFAULTS (Ahmed-confirmed 2026-11-02):
 A1 PLATFORM_CURRENCY=USD (env-driven; minor units). A2 tests on mongodb-memory-server replica set.
 A3 dev-only POST /api/payments/:id/test-confirm (404 in production); booking confirmed only via webhook.
 A4 PRs into develop, Ahmed merges; develop->main only at releases. (#1-#21 squash, #22-#25 merge commits: pick one.)
 A5 daysRemaining = calendar-day diff in provider tz (common/utils/dates.ts); caller passes it to quote().
 A6 Audit actions: suspend/reactivate account, provider deactivate/reactivate, moderator create, admin password reset, report resolve, content hide/delete.
 A7 Pagination fixed size 10; limit != 10 -> 400.
 A8 Stripe mocked in tests; webhook signature via real Stripe webhooks util + fake secret.
 A9 TRVL-128 Atlas was Ahmed-only — Done 2026-11-04 (member confirmations not collected).
RISKS: AI_PROMPTS.txt conflicts on every overlapping PR (fix proposed: task_91c4dfd9); Leader PRs merged without recorded review;
  Atlas member roles readWriteAnyDatabase + 0.0.0.0/0; WARP/strict DNS breaks mongodb+srv. Full list: .swarm/HANDOFF.md.
LESSONS: check ignored files in OWNS; worktree agents reply inline; main-session-only Jira/merge writes after Ahmed's words;
  never trust drafted dates; verify PR state before reporting it; run /handoff after every wave (Wave A skipped it: state 10 commits stale);
  never write .git/info or git config from an agent (merge=union leaked to all worktrees 11-06); local Jest on Windows: --runInBand.
