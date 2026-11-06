card | model | retries | followups | result words | tokens | verdict | note
t0 | opus | 0 | 0 | 120 | 178k | PASS | Leader patched contract; out-dir write blocked
t1 | sonnet | 0 | 0 (resumed after pause) | ~90 | 151k | PASS | Leader added wiring + e2e globalSetup
t2 | sonnet | 0 | 1 (security fixes) | ~110 | 168k+177k | PASS after t2b | 2 security rounds
t2b | opus | 0 | 0 | 110 | 159k | PASS | 4 money-safety findings, 10 new specs
t3 | sonnet | 0 | 1 (FX cooldown) | 70 | 155k | PASS | uploads/ source hidden by ignore (check.py miss)
t4 | sonnet | 0 | 0 | 95 | 161k | PASS via t5 | wrote from acceptance only
t5 | sonnet | 0 | 0 | ~110 | 136k | PASS | 9 failures fixed, 0 assertions changed
t6 | sonnet low | 0 | 0 | ~110 | 145k | PASS (Leader rewrote AI_PROMPTS) | invented dates
t7 | sonnet | 0 | 0 | ~120 | 196k | PASS | flagged Swagger gap -> t8
t8 | sonnet | 0 | 0 | ~120 | 149k | PASS | -
W3 | opus | 0 | 0 | ~250 | 169k | 9 PASS 1 FAIL | clean clone
t9 | sonnet | 0 | 0 | ~110 | 176k | PASS | 7 findings
jira-read | haiku low | 0 | 2 | ~200 | 153k | read PASS, writes blocked | classifier
v0-scope | haiku | 0 | 0 | ~200 | 32k | done | plan/PD/ownership scope (2026-11-05 verify run)
v0-checklist | general | 0 | 0 | ~110 | 143k | done | 243 atomic checks
verify-v1-a | opus | 0 | 0 | ~110 | 110k | 62P/7Pa/0F/1U | payments
verify-v1-b | opus | 0 | 0 | ~120 | 99k | 65P/7Pa/1F/2U | 130-13/14 U -> PASS via Leader gate
verify-v1-c | opus | 0 | 0 | ~120 | 72k | 33P/10Pa/0F/3U | audit/uploads/currency
verify-v1-d | opus | 0 | 0 | ~120 | 82k | 28P/8Pa/6F/10U | 2 FAIL not due; 136-3 -> PARTIAL
verify-v2-1 | opus | 0 | 0 | ~120 | 151k | 76P/10Pa/1F/1U | 4 disagreements, Leader resolved
verify-v2-2 | general | 0 | 0 | ~90 | 148k | 11/11 rules killed, 2 secondary survived | mutation copy clean
verify-v2-3 | opus | 0 | 0 | ~600 | 57k | 0 Crit/High, 8 Med, 6 Low | security
verify-v2-4 | opus | 0 | 0 | ~100 | 30k | 10/10 rows rerun pass | raw commands run 0 tests
fix-PAY-01-1 | opus | - | 0 | - | not recorded | PASS, merged #23 | F1,F2,F3,F17; Leader fixed 1 e2e fixture
fix-PAY-03-1 | opus | - | 0 | - | not recorded | PASS, merged #22 | F4,F5,F13; tokens lost (no /handoff after Wave A)
fix-PAY-02-1 | sonnet | - | - | - | - | pending approval | F12
fix-TRVL-130-1 | opus | - | 0 | - | not recorded | PASS, merged #24 | F6; Leader review added .env.example NODE_ENV
fix-TRVL-130-2 | sonnet | - | - | - | - | pending approval | F8; openapi.json after PAY-01-1
fix-TRVL-130-3 | sonnet | - | - | - | - | pending approval | F15
fix-TRVL-131-1 | sonnet | - | - | - | - | pending approval | F14
fix-GEN-07-1 | sonnet | - | 0 | - | not recorded | PASS, merged #25 | F7; Leader replaced untyped hook
fix-GEN-08-1 | sonnet | - | - | - | - | pending approval | F9
fix-ITN-18-1 | sonnet | - | - | - | - | pending approval | F16
fix-TRVL-134-1 | haiku | - | - | - | - | pending approval | F10 (Leader-only files)
fix-DLV-13-1 | sonnet | - | - | - | - | pending owner | F11
