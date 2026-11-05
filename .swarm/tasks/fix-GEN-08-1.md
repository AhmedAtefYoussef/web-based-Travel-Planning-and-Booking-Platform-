ID: fix-GEN-08-1  MODEL: sonnet  DEPENDS: none  REQ: GEN-08  CTX: v2
BRANCH: fix/GEN-08-upload-limits (from origin/develop 6efa26b)
GOAL: Upload limits per entity type, counting existing images, enforced before buffering.
CONTEXT: context.md ## contracts and owners
INPUTS: report F9; .swarm/verify/xlsx/Mandatory.csv row 92; backend/src/modules/uploads/uploads.service.ts:55-59,100
DELIVER: failing specs first: 5 per entity incl. existing images; 1 airline logo; >5 MB rejected; GIF/PDF and spoofed-MIME messages; HTTP error shape. Then per-type limits and shared multer options exported via the uploads contract.
OWNS: backend/src/modules/uploads/**, backend/src/common/contracts/uploads*.ts
DONE WHEN: cd backend && npx jest src/modules/uploads; npm test; npm run lint
REMEMBER: the contracts diff needs Leader approval in the PR.
RULES: .swarm/rules.md
