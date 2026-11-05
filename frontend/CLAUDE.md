# frontend/ — Milestone 2 (Next.js), stub

Status: not started. M2 due 2026-12-11. Set this up before teammates start frontend work (spec §9).

## Plan
1. API contract is the boundary: generate TypeScript types from docs/api/openapi.json (e.g. openapi-typescript, add with Ahmed's approval)
   into frontend/src/lib/api/schema.d.ts. Frontend work reads the generated types, never backend source.
2. Next.js App Router. Rendering per project-description §9 (ISR for public blog/itinerary pages, dynamic SSR for search, bookings, dashboards).
3. Auth: httpOnly cookies (ADR-001); no tokens in localStorage/sessionStorage. Stop using x-dev-* headers once ACC-11 lands.
4. Money: display from minor units with the currency exponent; never parse money as floats.
5. Errors: map fieldErrors[{field,message}] to form fields (GEN-02). Lists: pagination component, page size 10 (GEN-05).
6. Cards per page/flow: OWNS = frontend/src/app/<route>/** plus its components. Shared UI kit card first.
7. Tests: component tests per page; payment flow integration test against a running backend + stripe listen.
8. traceability.md gets a UI column (route + component test name) for M2 IDs.

Commands: to be defined when the app is scaffolded (npm run dev / build / lint / test).
