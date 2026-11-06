ID: fix-GEN-07-1  MODEL: sonnet  DEPENDS: none  REQ: GEN-07  CTX: v2
BRANCH: fix/GEN-07-audit-bulkwrite (from origin/develop 6efa26b)
GOAL: Audit log immutable against bulkWrite; tests assert the immutable error.
CONTEXT: context.md ## test harness gotchas
INPUTS: report F7; backend/src/modules/audit/audit-log.schema.ts:33-48
DELIVER: failing tests first: Model.bulkWrite update/delete rejected; updateOne rejected with the "immutable" message (not a timeout); record() persists metadata. Then add a bulkWrite pre hook.
OWNS: backend/src/modules/audit/**
DONE WHEN: cd backend && npx jest src/modules/audit; npx jest --config test/jest-e2e.json test/audit-uploads-currency.e2e-spec.ts -t "GEN-07"; npm run lint
REMEMBER: append-only means no update path at all.
RULES: .swarm/rules.md
