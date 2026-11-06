---
paths:
  - "frontend/**"
---
# Frontend rules (Milestone 2, Next.js App Router + TypeScript)

## Architecture
- The API contract is `docs/api/openapi.json`. Generate types into `frontend/src/lib/api/schema.d.ts`
  (`openapi-typescript`, added with Ahmed's approval) and call the API through one typed client in `src/lib/api/`.
  Never import backend source.
- Auth via httpOnly cookies set by the backend; read the user from `GET /api/auth/me` (ACC-19). Never store tokens in
  localStorage/sessionStorage. Route protection in middleware/layouts is UX only; the backend still enforces everything.
- Rendering per brief §9 (justify each choice in the page's spec):
  ISR/static: published blog post, public author page, public itinerary detail.
  Dynamic SSR: blog listing/search, public itinerary search, private itinerary detail, user booking pages, flight/hotel search,
  admin/moderator dashboards. Client components only where interactivity is needed (editors, likes, comments, checkout).
- Payments: Stripe Elements with the PaymentIntent `clientSecret` from `POST /api/payments`; card data never touches our API.
  Show "pending" until the backend reports the booking confirmed (webhook-driven).

## UX requirements (GEN-02..04, GEN-14..17)
- Field-level errors from `fieldErrors` on every form; confirmation dialog before destructive actions; loading, error and
  empty states on every data view; pagination of 10; responsive layouts; consistent design system.
- Money: format from minor units with the currency exponent. Times: show the airport/hotel local time with the zone.
- Public pages export `metadata` for SEO.

## Design quality
- Before building screens, agree one design direction and tokens (`impeccable:impeccable` or `taste-skill:design-taste-frontend`
  or `anthropic-skills:frontend-design`), recorded in `frontend/DESIGN.md`. Reuse components; no one-off styling.
- Accessibility: labels for inputs, keyboard reachable dialogs, colour contrast AA (`design:accessibility-review`).

## Ownership
- Each FE-xx Jira story owns its routes under `frontend/src/app/<route>/**` and its components. The shared UI kit and API
  client (FE-01, Ahmed) land first; extend them through PRs, do not fork them.
