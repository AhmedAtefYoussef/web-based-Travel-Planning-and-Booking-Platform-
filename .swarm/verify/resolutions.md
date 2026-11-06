# Leader resolutions (SHA 6efa26b, 2026-11-05) — by targeted re-run/read, never by vote
| CHK | V1 | V2-1 | Leader evidence | Final |
|---|---|---|---|---|
| PAY-01-26 | PARTIAL | FAIL | env.schema.ts:70 accepts any sk_/rk_ prefix; no test. Statement "used in test mode only": deployed key not observable here (secret); only enforcement is missing | PARTIAL (finding Medium F-PAY-01-1) |
| PAY-03-12 | PASS | PARTIAL | grep refundFor in *.spec.ts for twice/again/dedup/existing -> 0 hits; only refundPayment dedupe tested (refunds.service.spec "returns the existing refund of the same PI") | PARTIAL (F-PAY-03-1) |
| GEN-07-2 | PASS | PARTIAL | audit-log.schema.ts:33-42 BLOCKED list lacks bulkWrite (and insertMany is fine); V2-1 probe: Model.bulkWrite updates bypass hooks | PARTIAL (F-GEN-07-1) |
| TRVL-131-5 | PARTIAL | PASS | rerun dev-auth.guard.spec -t "dev headers" -> 2/2 pass (.swarm/tmp/leader/131-5.log); flag-off asserts generic toThrow (L74-78); only "production" tested, not other NODE_ENV values | PARTIAL (F-TRVL-131-1, Low) |
| TRVL-130-13/14 | UNVERIFIABLE | - | Leader gate: build exit 0, dist/main.js present; openapi:export + git diff --exit-code = 0 | PASS |
| TRVL-130-10 | FAIL | - | setup-swagger.ts:32 addBearerAuth only; openapi securitySchemes = bearer + 3 dev headers; plan.md:888-894 "Swagger with cookie auth" | FAIL (F-TRVL-130-1, Low) |
| TRVL-136-1, DLV-1 | FAIL | - | due 2026-11-20 | FAIL (not due) — not a defect |
| TRVL-136-3 | FAIL | - | HANDOFF records #13/#15 as releases, untagged | PARTIAL |
