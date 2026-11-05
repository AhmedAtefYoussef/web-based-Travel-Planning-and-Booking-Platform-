# Jira sync plan (Leader-authored). cloudId cca85282-e5e8-4a39-a360-61753e7f4cc6, project TRVL.
Repo PR base URL: https://github.com/AhmedAtefYoussef/web-based-Travel-Planning-and-Booking-Platform-/pull/
Proof commands run on a clean clone of develop 41a2955 (2026-11-03): npm run build, npm run lint (0 errors), npm test (170/170), npm run test:e2e (87/87).
Per-ID proof test names: docs/requirements/traceability.md on develop.

| Key | Target | PRs | Proof test / artifact | ASSUMED / note |
|---|---|---|---|---|
| TRVL-67 PAY-01 | Done | 8, 12 | test/payments.e2e-spec.ts (webhook signature, idempotent confirm, retry, hold expiry) | confirmation only via webhook; dev-only test-confirm endpoint (agreed with Ahmed) |
| TRVL-68 PAY-02 | Done | 8 | test/payments.e2e-spec.ts policies + accept-policies gate | - |
| TRVL-69 PAY-03 | Done | 8, 12 | test/payments.e2e-spec.ts refunds; refunds.service.spec.ts | days remaining = calendar days in provider tz (agreed default) |
| TRVL-109 PAY-04 | Done | 8, 12 | test/platform-currency.e2e-spec.ts | PLATFORM_CURRENCY=USD (agreed) |
| TRVL-97 GEN-02 | Done | 6 | test/foundation.e2e-spec.ts fieldErrors | - |
| TRVL-100 GEN-05 | Done | 6, 12 | test/foundation.e2e-spec.ts pagination | fixed size 10, limit!=10 -> 400 (agreed) |
| TRVL-102 GEN-07 | Done | 4, 12 | test/audit-uploads-currency.e2e-spec.ts audit; audit-log.schema.spec.ts | audited actions list agreed; callers are teammates' modules |
| TRVL-103 GEN-08 | Done | 4, 5 | test/audit-uploads-currency.e2e-spec.ts uploads | - |
| TRVL-111 GEN-13 | Done | 3, 6, 11 | test/foundation.e2e-spec.ts; password-hasher.spec.ts | real JWT guard is Abdelrahman's (ACC-11); temporary guard opt-in |
| TRVL-129 SETUP scaffold | Done | 1, 2 | repo layout, develop branch, branch protection on develop+main (1 approval) | - |
| TRVL-130 SETUP common layer | Done | 6, 11 | backend/src/bootstrap, common/* | - |
| TRVL-131 SETUP auth stubs | Done | 1, 3 | common/decorators, guards/dev-auth.guard.ts | - |
| TRVL-132 SETUP contracts | Done | 1 | backend/src/common/contracts | - |
| TRVL-133 SETUP Currency | Done | 4, 5 | test/audit-uploads-currency.e2e-spec.ts currency; currency-no-rates.e2e-spec.ts | budget summary conversion is Abdelrahman's (ITN-14/18) |
| TRVL-134 DOCS trace/ERD/ADR | Done | 7, 10, 12 | docs/requirements/traceability.md, docs/architecture/* | - |
| TRVL-135 DOCS README/demo/AI | Done | 7, 10, 11 | README.md, docs/api/swagger-demo.md, AI_PROMPTS.txt | - |
| TRVL-128 SETUP Atlas | In Progress | - | - | needs Ahmed: cluster + per-member DB users + sharing MONGODB_URI cannot be done by the agent |
| TRVL-136 RELEASE | To Do (no transition) | - | - | comment only: release prep ready; code freeze/bug bash/tag v1.0.0-m1 by Ahmed on 20 Nov |
| TRVL-6 epic Payments | Done | 8, 12 | all child stories Done | - |
| TRVL-1 epic Foundation | In Progress | 1-12 | TRVL-128, TRVL-136 open | - |
| TRVL-10 epic Cross-cutting (not owner-ahmed) | NO transition | 4, 5 | comment only: GEN-07/GEN-08 merged, AUDIT_SERVICE / UPLOADS_SERVICE ready for consumers | - |

Comment template (no secrets, no logs): "Merged: PR #a (#b). Proof: <test file / artifact> - `cd backend && npm test && npm run test:e2e` green on develop 41a2955 (unit 170, e2e 87). ASSUMED: <note or none>."
Also, for each PR in the row, add a remote link on the issue if the tool supports it; otherwise the PR URL in the comment is the link.
Do not change Story Points (customfield_10037) or fix version. Do not create, delete or reassign issues or edit sprints.
