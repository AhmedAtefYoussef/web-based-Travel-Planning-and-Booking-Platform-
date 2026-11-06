# Sprint 0 verification — scope (V0)
SHA: origin/develop 6efa26b7590ab87ede4dcbe4b14bfd1f50ae9e34 · date 2026-11-05 · worktree .swarm/tmp/verify-sprint0 (detached)

## (a) xlsx / reqs.json rows owned by Ahmed
xlsx has NO owner column; owner exists only in reqs.json (10 rows, owner=ahmed):
PAY-01 Mandatory!A56 · PAY-02 !A57 · PAY-03 !A58 · ITN-18 !A69 · GEN-02 !A86 · GEN-05 !A89 · GEN-07 !A91 · GEN-08 !A92 · PAY-04 !A98 · GEN-13 !A100
Text drift xlsx vs reqs.json: 0 differences on 115 rows (see drift.md).

## (b) Jira (read-only, 2026-11-05, assignee = Ahmed, 34 issues)
Sprint "Sprint 0 - Foundation" (id 4, state ACTIVE, ended 2026-11-04):
TRVL-97 GEN-02 Done · TRVL-100 GEN-05 Done · TRVL-111 GEN-13 Done · TRVL-128 Atlas Done · TRVL-129 scaffold Done ·
TRVL-130 common Done · TRVL-131 auth stubs Done · TRVL-132 contracts Done · TRVL-134 traceability/ERD/ADRs Done
Ahmed's Done items in LATER sprints (included because the request lists them):
Sprint 1: TRVL-102 GEN-07 · TRVL-103 GEN-08 · TRVL-109 PAY-04 · TRVL-133 currency (ITN-18 rates)
Sprint 2: TRVL-67 PAY-01 · TRVL-68 PAY-02 · TRVL-69 PAY-03 · TRVL-135 README/Swagger/AI_PROMPTS
Hardening: TRVL-136 release (In Progress)
Epics: TRVL-1 Foundation (In Progress, no sprint) · TRVL-6 Payments (Done, no sprint)
Out of scope (Ahmed, To Do, later sprints): FLT-12 TRVL-37, FLT-22 TRVL-42, FLT-23 TRVL-43, HTL-16 TRVL-59, HTL-17 TRVL-60,
HTL-18 TRVL-61, GEN-11 TRVL-106, TRVL-144, TRVL-4 epic, M2 TRVL-11/116/145/146/160.

## Conflicts between sources (not resolved here)
C1 reqs.json owner covers 10 rows; Jira assigns Ahmed 7 more requirement rows (FLT-12/22/23, HTL-16/17/18, GEN-11) -> reqs.json owner field incomplete.
C2 Only GEN-02/05/13 of the 10 owned requirements are in the Sprint 0 sprint; 7 are Done in Sprint 1/2 which are still "future" sprints.
C3 Sprint 0 is still "active" after its end date (2026-11-04).
C4 Labels: TRVL-133/135/136/144 carry label "setup", not "sprint-0", though TRVL-133/135 are Done.
C5 GEN-07/08 stories have parent TRVL-10 (not Ahmed's epic); TRVL-133 parent TRVL-8.
C6 ITN-18: only the "rates" part is Ahmed's (TRVL-133); the itinerary budget part belongs to another owner (see plan.md scout).
C7 plan.md:943-969 lists PAY-01/PAY-03 work under the "## Abdelrahman" heading; Jira + reqs.json say Ahmed.
C8 plan.md Ahmed block (L861-979) has no FLT-12/22/23, HTL-16/17/18; ownership.md:10 (from Jira) has them. ownership.md:4 says Jira wins.
C9 ownership.md has no TRVL-128 row; context-engineering-spec.md:341 says TRVL-128 Ahmed-only.

## (c) plan.md / project-description.md (scout, .swarm/out/verify-v0-scope.md)
plan.md L861-979 Leader block covers: Atlas, scaffold, common layer (GEN-02/05/13), auth stubs, audit (GEN-07), uploads (GEN-08),
currency (ITN-18), PAYMENTS contract (PAY-04), policies (PAY-02), payments/webhook (PAY-01), refunds (PAY-03), release.
project-description: M1 scope L223-236, Atlas L430, AI_PROMPTS L551-574, deliverables L598-605.

## Final in-scope set (union)
PAY-01, PAY-02, PAY-03, PAY-04, GEN-02, GEN-05, GEN-07, GEN-08, GEN-13, ITN-18 (rates part), TRVL-128..136, epics TRVL-1/TRVL-6 (status roll-up only).
