# Team ownership

Source of truth: Jira project TRVL (owner-* labels and assignees), snapshot 2026-11-05. The plan's original matrix
(docs/requirements/plan.md L613-855) was rebalanced in Jira; where they differ, Jira wins.
Module paths follow the plan's folder layout (L108-165). Machine-readable copy: .claude/team.json (used by the Claude Code hooks).

## Milestone 1 (backend)
| Person | Requirement IDs (Jira) | Module paths owned | Implements / consumes |
|---|---|---|---|
| Ahmed Atef Youssef (Leader) | FLT-12, FLT-22, FLT-23, GEN-02, GEN-05, GEN-07, GEN-08, GEN-11, GEN-13, HTL-16, HTL-17, HTL-18, PAY-01, PAY-02, PAY-03, PAY-04 | `backend/src/modules/flights/**`<br>`backend/src/modules/flight-bookings/**`<br>`backend/src/common/**`<br>`backend/src/modules/audit/**`<br>`backend/src/modules/uploads/**`<br>`backend/src/modules/hotel-bookings/**`<br>`backend/src/modules/payments/**`<br>`backend/src/modules/currency/**`<br>`backend/src/config/**`<br>`backend/src/bootstrap/**`<br>`backend/src/main.ts`<br>`backend/src/app.module.ts`<br>`backend/scripts/**`<br>`docs/**`<br>`.github/**`<br>`.claude/**`<br>`.swarm/**` | PAYABLE_BOOKING (with Karim: Ahmed owns hold/confirm/lifecycle FLT-22/23, HTL-16/17/18, GEN-11; markConfirmed, expiry job -> PaymentsService.cancelForExpiredHold); PAYMENTS_SERVICE, REFUNDS_SERVICE, CURRENCY_SERVICE, AUDIT_SERVICE, UPLOADS_SERVICE (real); owns all contracts and stubs |
| Abdelrahman | ACC-01, ACC-04, ACC-05, ACC-06, ACC-07a, ACC-08, ACC-09, ACC-11, ACC-12, ACC-13, ACC-14, ACC-18, ACC-19 | `backend/src/modules/auth/**`<br>`backend/src/modules/admin/**`<br>`backend/src/modules/users/**`<br>`backend/src/database/seeds/admin*` | real JwtAuthGuard (replaces DevAuthGuard; Leader wires APP_GUARD); consumes AUDIT_SERVICE, NOTIFICATIONS_SERVICE |
| Malak Hussein | BLG-01, BLG-02, BLG-03, BLG-04, BLG-05, BLG-06, BLG-07, BLG-08, BLG-09, BLG-10, BLG-12, GEN-09, GEN-10, ITN-14, ITN-16, ITN-18 | `backend/src/modules/blog/**`<br>`backend/src/modules/reports/**`<br>`backend/src/modules/budgets/**` | content visibility / hidden flag (contract 10); budgets: consumes CURRENCY_SERVICE.convert (ITN-18 summary); consumes UPLOADS_SERVICE, AUDIT_SERVICE |
| Joudy Hagar | FLT-01, FLT-02, FLT-03, FLT-04, FLT-05, FLT-08, FLT-09, FLT-11, FLT-15, FLT-17, FLT-30, GEN-06, GEN-12 | `backend/src/modules/airlines/**`<br>`backend/src/modules/reference/**`<br>`backend/src/modules/flights/**`<br>`backend/src/database/seeds/reference*` | POLICIES_PROVIDER for airlines (shared token with Sandra); reference data service; FlightsService.search; consumes UPLOADS_SERVICE, NOTIFICATIONS_SERVICE |
| Karim | ACC-15, ACC-16, ACC-17, FLT-06, FLT-19, FLT-21, FLT-25, FLT-26, FLT-29, GEN-01, HTL-20, HTL-21, HTL-22, HTL-23, HTL-24 | `backend/src/modules/admin/**`<br>`backend/src/modules/flights/**`<br>`backend/src/modules/flight-bookings/**`<br>`backend/src/modules/notifications/**`<br>`backend/src/modules/hotel-bookings/**`<br>`backend/src/modules/hotels/**`<br>`backend/src/modules/reviews/**` | NOTIFICATIONS_SERVICE (replaces stub); booking creation, views and cancellations (cancel -> RefundsService.refundFor); provider-side views FLT-29/HTL-22, flight cancel FLT-06, reviews; consumes PAYMENTS_SERVICE, REFUNDS_SERVICE, POLICIES_PROVIDER, AUDIT_SERVICE |
| Sandra George | HTL-01, HTL-02, HTL-03, HTL-04, HTL-05, HTL-06, HTL-08, HTL-09, HTL-10, HTL-11, HTL-12, HTL-15 | `backend/src/modules/hotels/**` | POLICIES_PROVIDER for hotels (shared token with Joudy); room_nights; HotelsService.search; consumes UPLOADS_SERVICE |
| Sarah Ibrahim | ITN-01, ITN-03, ITN-05, ITN-07, ITN-08, ITN-09, ITN-10, ITN-12, ITN-20, ITN-21, ITN-25, ITN-26 | `backend/src/modules/itineraries/**` | itinerary visibility for author pages; consumes FlightsService.search, HotelsService.search, UPLOADS_SERVICE, reference data |

Ahmed also owns the ITN-18 exchange-rate service (CurrencyModule, TRVL-133); the ITN-18 budget summary story (TRVL-80) is Malak's.

## Shared modules (coordinate; one PR per requirement ID)
- `backend/src/modules/flights/**`: ahmed, joudy, karim
- `backend/src/modules/flight-bookings/**`: ahmed, karim
- `backend/src/modules/hotel-bookings/**`: ahmed, karim
- `backend/src/modules/admin/**`: abdelrahman, karim
- `backend/src/modules/hotels/**`: karim, sandra

## Epics (Jira owner)
- Ahmed Atef Youssef: TRVL-1 Foundation, Architecture & DevOps; TRVL-4 Booking Engine (Flights & Hotels); TRVL-6 Payments, Policies & Refunds; TRVL-11 Milestone 2: Frontend UX Requirements
- Abdelrahman: TRVL-2 Accounts, Auth & Administration
- Malak Hussein: TRVL-8 Budgets & Currency Conversion; TRVL-9 Blog & Community
- Joudy Hagar: TRVL-3 Airlines, Flights & Flight Search
- Karim: TRVL-10 Cross-cutting: Notifications, Moderation, Audit & Uploads
- Sandra George: TRVL-5 Hotels, Rooms & Reviews
- Sarah Ibrahim: TRVL-7 Itineraries
- Team (unassigned): TRVL-12 Bonus Features (after mandatory scope)

## Milestone 2 (frontend, epic TRVL-11)
| Person | FE stories | Frontend requirement IDs |
|---|---|---|
| Ahmed Atef Youssef | TRVL-145 [FE-01], TRVL-146 [FE-02], TRVL-160 [FE-16] | GEN-17 |
| Abdelrahman | TRVL-147 [FE-03], TRVL-148 [FE-04], TRVL-159 [FE-15] | ACC-10 |
| Malak Hussein | TRVL-157 [FE-13], TRVL-158 [FE-14] | GEN-14 |
| Joudy Hagar | TRVL-150 [FE-06], TRVL-151 [FE-07] | GEN-15 |
| Karim | TRVL-149 [FE-05], TRVL-154 [FE-10] | GEN-03 |
| Sandra George | TRVL-152 [FE-08], TRVL-153 [FE-09] | GEN-16 |
| Sarah Ibrahim | TRVL-155 [FE-11], TRVL-156 [FE-12] | GEN-04 |

## Unassigned
- Mandatory without a Jira owner: none.
- Bonus rows (TRVL-117..127, epic TRVL-12): owner-team, unassigned; pick up only after your mandatory work.

## Rules
- Work only in your owned paths. Consume other modules only through contract tokens in backend/src/common/contracts.
- Contract, wiring or shared-file change (app.module.ts, common/, .github/, docs/requirements/)? Ask the Leader in a PR comment or issue.
- POLICIES_PROVIDER is shared by Joudy (airlines) and Sandra (hotels); the Leader decides how the two implementations are combined.
