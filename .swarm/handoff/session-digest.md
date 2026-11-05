# Session digest — Leader session 2026-11-02 → 2026-11-05
Sources: [chat] said/decided in the session · [repo] verified in files/git · [jira] · [inferred].

## 1. Timeline
| Date | Block | Outcome | Ref |
|---|---|---|---|
| 11-02 | Setup | sources → docs/requirements, reqs.json (115 rows) + "acceptance"/"owner" on 10 Ahmed rows; Jira scope 20 issues all To Do | [repo] 7decf05 |
| 11-02 | Batched questions | A1–A8 answered by Ahmed (memory-server, test-confirm, PRs Leader merges, USD) | [chat] |
| 11-02 | W0 t0 (opus) | scaffold + contracts + stubs; Leader added recordPolicyAcceptance + refund fields | PR#1 99a5426 |
| 11-02 | deps | all W1 deps in one PR (Nest-11-compatible pins) | PR#2 |
| 11-02 | Security review | DevAuthGuard fail-open → opt-in DEV_AUTH_ENABLED; FX default URL | PR#3 |
| 11-02/03 | W1 t1 t2 t3 t4 | usage-limit pause, resumed via SendMessage | — |
| 11-03 | t3 merge | audit/uploads/currency; uploads source dropped by `uploads/` ignore | PR#4 |
| 11-03 | fix | FX refresh 30-min cooldown + UploadsModule sources + anchored ignore | PR#5 |
| 11-03 | t1 + wiring | foundation; AppModule wiring; e2e globalSetup replica set | PR#6 |
| 11-03 | t6 docs | ERD, ADR-001..004, README, AI_PROMPTS (Leader rewrote invented dates) | PR#7 |
| 11-03 | t2 + t2b (opus) | payments; 3 rounds of security findings fixed | PR#8 |
| 11-03 | t5 | acceptance suite green 86/86; PAY-04 invalid-total defect fixed | PR#9 |
| 11-03 | t7, t8 | traceability 10/10 PASS, OpenAPI export, demo; Swagger [ID]/DTOs/dev Authorize | PR#10, PR#11 |
| 11-03 | W3 verifier (opus, clean clone) | 9 PASS, 1 FAIL (PAY-04 hardcoded USD) + 7 gaps → t9 | PR#12 |
| 11-03 | Jira sync | 17 Done, 2 In Progress, 1 To Do; writes from main session after chat approval | [jira] |
| 11-03 | Release | develop→main (Ahmed merged; Leader --admin merge was classifier-blocked) | PR#13 |
| 11-04 | Atlas | project "Travel Platform SP1", M0 travel-cluster (AWS EU_CENTRAL_1); Ahmed created users + access list | [chat] |
| 11-04 | fix | backend/scripts excluded from build (start:dev/start:prod broke) | PR#14 |
| 11-04 | release 2 | develop→main | PR#15 |
| 11-04 | CI gate | ci.yml, pr-open.yml, pr-automation.yml, pr-requirements.mjs, repo-consistency.mjs, CODEOWNERS | PR#17 |
| 11-04 | Settings | branch protection, auto-merge off, default branch develop, main strict=false; #18 closed | [chat][repo] |
| 11-04 | fix | MONGODB_URI accepts multi-host string; Ahmed's .env switched to direct host (WARP SRV issue) | PR#19 |
| 11-04 | Security | secret-scanning alert #1 (fake fixture) resolved "used_in_tests" | [chat] |
| 11-05 | Handoff | this digest, v2 operating model | branch chore/AGENT-context-engineering |

## 2. Decisions
| # | Decision | Who | Recorded |
|---|---|---|---|
| A1 | PLATFORM_CURRENCY=USD (env-driven since PR#12) | Ahmed | state.md, ADR-004 |
| A2 | tests on mongodb-memory-server replica set | Ahmed | state.md, backend/CLAUDE.md |
| A3 | dev-only POST /api/payments/:id/test-confirm (404 in production) | Ahmed | state.md, ADR-003 |
| A4 | PRs into develop, Leader merges (squash) | Ahmed | state.md, README |
| A5 | daysRemaining = calendar days in provider tz | Ahmed (default accepted) | state.md |
| A6 | audited actions list | Ahmed (default) | state.md |
| A7 | page size fixed 10, limit≠10 → 400 | Ahmed (default) | state.md |
| A8 | Stripe mocked in tests; real webhook signing util | Ahmed (default) | state.md |
| A9 | TRVL-128 Ahmed-only | Leader | state.md (now Done) |
| D1 | dev auth opt-in (DEV_AUTH_ENABLED, refused in production) | Leader (security review) | ADR-001?, context.md v2 |
| D2 | late/superseded Stripe successes refunded, never confirmed; retry cancels old PI; refunds deduped per PI | Leader (security review) | context.md v2, ADR-003 |
| D3 | build excludes backend/scripts | Leader | context.md v2 |
| D4 | CI gate design: rules + reqs.json from BASE branch; pr-open separate workflow | Leader | context.md v2, README |
| D5 | no auto-merge; CODEOWNERS `*` → Ahmed; dismiss stale; last-push approval | Ahmed | README, context.md v2 |
| D6 | default branch = develop | Ahmed | context.md v2 |
| D7 | main protection strict=false (release PRs never need back-merge); close back-merge PRs | Ahmed | context.md v2 |
| D8 | MONGODB_URI validated by pattern, not Joi.uri() | Leader | context.md v2 |
| D9 | Atlas: database travel_platform; member users readWriteAnyDatabase; network 0.0.0.0/0 | Ahmed | context.md v2 (risk) |
| D10 | track .swarm/ in git (except tmp/, web/); settings deny only pushes to develop/main | Leader (handoff) | context.md v2 |
| D11 | merge into develop, develop→main only at releases; tag by Ahmed | Ahmed | CLAUDE.md |

## 3. Requirements (Ahmed scope) — all PASS, traceability.md rows with -t names
PAY-01 TRVL-67 PR#8,#12 test/payments.e2e-spec.ts · PAY-02 TRVL-68 PR#8 · PAY-03 TRVL-69 PR#8,#12 (+refunds.service.spec) ·
PAY-04 TRVL-109 PR#8,#12 test/platform-currency.e2e-spec.ts · GEN-02 TRVL-97 PR#6 test/foundation.e2e-spec.ts · GEN-05 TRVL-100 PR#6,#12 ·
GEN-07 TRVL-102 PR#4,#12 (+audit-log.schema.spec) · GEN-08 TRVL-103 PR#4,#5 · GEN-13 TRVL-111 PR#3,#6,#11 · ITN-18 rates TRVL-133 PR#4,#5.
Partly met / assumptions: GEN-07 call sites live in teammates' modules (record() only); GEN-08 consumers not wired yet;
PAY-01 cancelForExpiredHold must be called by Karim's expiry job; PAY-03 callers = Karim's cancellations; ITN-18 summary = Abdelrahman.
Jira [jira 11-04]: 18 Done; In Progress TRVL-1 (epic), TRVL-136 (release); TRVL-6 Done; TRVL-10 commented only.

## 4. Architecture
Module map: docs/architecture/module-map.md [repo]. Tokens (common/contracts/tokens.ts): PAYABLE_BOOKING, POLICIES_PROVIDER,
NOTIFICATIONS_SERVICE (stubs in common/stubs → Karim, Joudy+Sandra, Karim replace via useExisting), PAYMENTS_SERVICE, REFUNDS_SERVICE,
CURRENCY_SERVICE, AUDIT_SERVICE, UPLOADS_SERVICE (Ahmed, real). STRIPE_CLIENT token in modules/payments/stripe.provider.ts.
New modules export <Name>Module; Leader wires app.module.ts. No changes since module-map.md except env.schema (D8).

## 5. Easy-to-lose technical details
- Webhook needs NestFactory.create(..., {rawBody:true}); tests too. Signature via client.webhooks.constructEvent.
- e2e: jest globalSetup starts MongoMemoryReplSet; setup-env.ts sets DEV_AUTH_ENABLED=true; test-app util uses require() (ts-jest rejects dynamic import()).
- Fake Stripe sets amount_received; refunds use captured amount; Refund.paymentIntentId required, unique partial index on stripeRefundId.
- Refund notification types REFUND_COMPLETED / REFUND_FAILED (Karim's GEN-01 must support).
- `uploads/` ignore pattern once hid backend/src/modules/uploads → anchored to /uploads/, /backend/uploads/.
- Build: tsconfig.build.json excludes scripts; CI asserts dist/main.js.
- openapi:export sets its own env (DEV_AUTH_ENABLED=true) → deterministic; CI drift check.
- Secret scanner (pr-requirements) flags `user:pass@` in fixtures → use `<user>:<password>`.
- Windows: Cloudflare WARP breaks mongodb+srv SRV lookups (querySrv ECONNREFUSED) → use standard/direct host URI.
- Sandbox Node DNS = 127.0.0.1; tests used dns.setServers preload only in the sandbox.

## 6. Orchestration
Worked: contracts first; disjoint OWNS; tests from acceptance only (t4 never read code); opus escalation for money (t2b);
fresh opus verifier on clean clone found the real PAY-04 bug. Failed/costly: worktree agents cannot write .swarm/out (Leader saves results);
classifier blocked subagent Jira writes even with relayed approval (main session works after direct chat approval) and --admin merges;
usage-limit pause mid-W1 (TaskStop + SendMessage resume worked); check.py missed gitignored files; docs agent invented AI_PROMPTS dates.
Metrics rows: see metrics.md (t1, t2, t5–t9, W3 filled; tokens "?" where not reported).

## 7. Worktrees (.claude/worktrees/agent-*) — all branches merged via squash PRs
a01cd71b t0 #1 · aa8e7094 t1 #6 · a12c8acb t2/t2b #8 · ab594937 t3 #4/#5 · a2047b83 t4/t5 #9 · a3f41fc6 t6 #7 · a258573c t7 #10 · a038473b t8 #11 · a4886b07 t9 #12.
Squash merges mean `git branch --merged` will not show them; safety = content diff vs origin/develop + clean status (Phase 5).

## 8. CI/automation
ci.yml (push, all branches): repo-consistency → npm ci → lint → build → dist/main.js → unit → e2e → openapi drift. Check name build-lint-test.
pr-open.yml (push to work branches): opens PR into develop if none, dispatches pr-automation.
pr-automation.yml (pull_request/dispatch): job pr-requirements, rules+reqs.json from base branch, sticky report, exit 1 on blocking.
Protection: develop strict, main not strict; both checks required; code-owner (*) review; dismiss stale; last-push approval; admins not enforced.
Limits: rules only check shape, not semantics; personal repo cannot restrict who presses Merge; bootstrap fallback to PR copy when base lacks script.

## 9. Teammates
Abdelrahman: ACC-*, ITN-14/16/18 summary (real JwtAuthGuard replaces DevAuthGuard). Karim: bookings, holds, notifications, ACC-17, GEN-01/11
(PAYABLE_BOOKING, NOTIFICATIONS_SERVICE, expiry job → cancelForExpiredHold, cancellations → refundFor). Joudy: reference data, flights, GEN-06/12
(POLICIES_PROVIDER airline). Sandra: hotels, rooms, reviews (POLICIES_PROVIDER hotel; PR#20 TRVL-140 open). Sarah: itineraries. Malak: blog, reports, GEN-09/10.
Promised: all handouts sent (11-04); TRVL-10 told about AUDIT/UPLOADS services and refund notification types.

## 10. Ahmed-only actions
TRVL-136: code freeze 18 Nov, bug bash, develop→main, tag v1.0.0-m1 on 2026-11-20. M2 due 2026-12-11. Review/merge PR#20 (Sandra).
Rotate passwords only if a credential ever leaks (none tracked).

## 11. Open questions / risks (ranked)
1. PR authors can press Merge after Ahmed approves (personal repo) — accept or move to an org.
2. Atlas member roles readWriteAnyDatabase + 0.0.0.0/0 — tighten?
3. Semantic PR review (Claude Code Action needs API key vs /schedule agent) — undecided.
4. Teammates behind WARP need direct-host URI (handouts' fallback works after PR#19).
5. main lags develop by #17/#19 until next release.

## 12. Lessons
Verify ignored files (git status --ignored) in checks; give worktree agents repo-relative result paths or have them reply inline;
Jira/merge writes from main session only after Ahmed's words; never trust drafted dates; re-run checks after protection changes; check PR state before claiming "open".
