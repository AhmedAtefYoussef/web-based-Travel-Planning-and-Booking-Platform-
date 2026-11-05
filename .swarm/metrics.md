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
