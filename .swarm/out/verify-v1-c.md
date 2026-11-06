ID: verify-v1-c  STATUS: done  CTX: v2
GOAL CHECK: 46 checks judged, 0 FAIL; table .swarm/verify/v1-c.md
CHANGED: none
EVIDENCE: unit audit/uploads/currency -> 39/39 (1-unit.log); e2e audit-uploads-currency + currency-no-rates -> 20/20 (2-e2e.log); -t "uses cached rates" -> 2 pass; repo-consistency OK
COUNTS P/Pa/F/U: GEN-07 9/1/0/3 · GEN-08 9/6/0/0 · ITN-18 10/2/0/0 · TRVL-133 5/1/0/0
NOTES: GEN-08-8..11 PARTIAL per-call max only (uploads.service.ts:55-59), no per-type limit, existing images not counted; GEN-08-14/15 no endpoint, MIME/magic messages + HTTP shape untested; GEN-07-3/4/5 UNVERIFIABLE no AUDIT_SERVICE callers; GEN-07-1 metadata persistence untested; ITN-18-3 FXRatesAPI only env default; ITN-18-4 @Cron untested; TRVL-133-5 currency list is constant not seeded; TRVL-133-6 checklist -t filter wrong.
