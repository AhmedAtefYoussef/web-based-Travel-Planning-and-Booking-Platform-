ID: fix-DLV-13-1  MODEL: sonnet  DEPENDS: owner decision  REQ: DLV-13 (project-description.md L123-127)  CTX: v2
BRANCH: feature/DLV-13-reference-seed (from origin/develop 6efa26b)
GOAL: Idempotent seed of the official reference datasets (countries, cities, airports, attractions).
CONTEXT: context.md ## contracts and owners
INPUTS: report F11; docs/requirements/project-description.md:123-127; docs/requirements/mock-data.xlsx
DELIVER: failing test first (seed twice -> same counts; required fields present), then the seed script; propose the npm script in NOTES (package.json is Leader-only).
OWNS: backend/scripts/seed-reference*.ts, backend/test/seed-reference.e2e-spec.ts
DONE WHEN: cd backend && npx jest --config test/jest-e2e.json test/seed-reference.e2e-spec.ts; npm run lint
REMEMBER: owner TBD; Ahmed assigns before dispatch.
RULES: .swarm/rules.md
