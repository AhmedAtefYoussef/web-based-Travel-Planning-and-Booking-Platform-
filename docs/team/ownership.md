# Ownership (from Jira, snapshot 2026-11-06)

Jira project TRVL is the source of truth; this file and `docs/requirements/jira-map.json` are its snapshot (refresh: `jira-sync` skill).
Look up any item: `node .claude/skills/req/req.mjs <ID>` or `--owner <slug>`.

## Sprints

- **S0**: Sprint 0 - Foundation 2026-11-02..11-04
- **S1**: Sprint 1 - Core Domain 2026-11-05..11-11
- **S2**: Sprint 2 - Business Logic 2026-11-12..11-17
- **H&R**: Hardening & Release 2026-11-18..11-20 (tag v1.0.0-m1)
- **S3**: Sprint 3 - Frontend Core 2026-11-21..11-27
- **S4**: Sprint 4 - Frontend Flows 2026-11-28..12-04
- **S5**: Sprint 5 - Integration 2026-12-05..12-11

## People

| Person (slug) | Area | Module paths | M1 requirement IDs (sprint) | M2 stories |
|---|---|---|---|---|
| Ahmed Atef Youssef (Leader) (`ahmed`) | Booking engine core (holds, confirm, lifecycle/expiry), payments, refunds, policies gate, currency rates, audit, uploads, common layer, contracts, wiring, CI, releases | `modules/payments`, `modules/currency`, `modules/audit`, `modules/uploads`, `common/**`, `config/**`, `bootstrap/**`, `app.module.ts`, hold/confirm/expiry files in `modules/flight-bookings` and `modules/hotel-bookings`, round-trip/passenger-type search files in `modules/flights` | FLT-12 (S1), FLT-22 (S1), FLT-23 (S2), HTL-16 (S2), HTL-17 (S2), HTL-18 (S2), PAY-01 (S2), PAY-02 (S2), PAY-03 (S2), GEN-02 (S0), GEN-05 (S0), GEN-07 (S1), GEN-08 (S1), GEN-11 (S1), PAY-04 (S1), GEN-13 (S0), GEN-17 (S2)<br>Tasks: TRVL-128 Create MongoDB Atlas cluster and share c; TRVL-129 Scaffold repository, branches and protec; TRVL-130 NestJS common layer: config, validation,; TRVL-131 Auth contract stubs: @Public, @Roles, @C; TRVL-132 Cross-module contracts (common/contracts; TRVL-133 CurrencyModule: FXRatesAPI daily rates w; TRVL-134 Traceability matrix, ERD and ADRs; TRVL-135 README, Swagger demo script and AI_PROMP; TRVL-136 Code freeze, bug bash and v1.0.0-m1 rele; TRVL-144 Concurrency e2e tests for flight holds a | FE-01 TRVL-145, FE-02 TRVL-146, FE-16 TRVL-160 |
| Abdelrahman Aly (`abdelrahman`) | auth (register, login, lockout, sessions, cookies), users/profile, admin accounts and moderators, admin seed | `modules/auth`, `modules/users`, account/moderator files in `modules/admin`, `database/seeds/admin*` | ACC-01 (S1), ACC-04 (S1), ACC-05 (S1), ACC-06 (S1), ACC-07a (S2), ACC-08 (S1), ACC-09 (S1), ACC-10 (S2), ACC-11 (S1), ACC-12 (S2), ACC-13 (S2), ACC-14 (S1), ACC-18 (S0), ACC-19 (S1)<br>Tasks: TRVL-137 Users & sessions schemas + admin seed | FE-03 TRVL-147, FE-04 TRVL-148, FE-15 TRVL-159 |
| Joudy Khaled Hagar (`joudy`) | airlines, airports/reference data seed, flights, cabins, baggage and cancellation policies, one-way search, flight status | `modules/airlines`, `modules/reference`, `modules/flights` (catalog, one-way search), `database/seeds/reference*` | FLT-01 (S1), FLT-02 (S1), FLT-03 (S1), FLT-04 (S1), FLT-05 (S2), FLT-08 (S1), FLT-09 (S2), FLT-11 (S1), FLT-15 (S2), FLT-17 (S2), GEN-06 (S1), FLT-30 (S2), GEN-12 (S0)<br>Tasks: TRVL-138 Airlines, flights & cabins schemas | GEN-15 TRVL-114, FE-06 TRVL-150, FE-07 TRVL-151 |
| Karim Walid (`karim`) | passenger details and booking summary, my bookings, user/provider cancellations, moderator booking views, reviews, notifications, admin suspensions and booking list | `modules/notifications`, `modules/reviews`, view/cancel/passenger files in `modules/flight-bookings` and `modules/hotel-bookings`, suspension/booking-list files in `modules/admin` | ACC-15 (S2), ACC-16 (S1), ACC-17 (S2), FLT-06 (S2), FLT-19 (S1), FLT-21 (S1), FLT-25 (S2), FLT-26 (S2), FLT-29 (S2), HTL-20 (S2), HTL-21 (S2), HTL-22 (S2), HTL-23 (S2), HTL-24 (S2), GEN-01 (S1)<br>Tasks: TRVL-139 Flight booking, hotel reservation & noti | GEN-03 TRVL-98, FE-05 TRVL-149, FE-10 TRVL-154 |
| Malak Hussein (`malak`) | blog (posts, comments, likes, tags, search, author page), reports and moderation, itinerary budgets, transport costs, budget conversion | `modules/blog`, `modules/reports`, `modules/budgets` | ITN-14 (S2), ITN-16 (S2), ITN-18 (S2), BLG-01 (S1), BLG-02 (S1), BLG-03 (S1), BLG-04 (S1), BLG-05 (S1), BLG-06 (S1), BLG-07 (S1), BLG-08 (S2), BLG-09 (S1), BLG-10 (S2), BLG-12 (S2), GEN-09 (S2), GEN-10 (S2), GEN-14 (S2)<br>Tasks: TRVL-142 Posts, comments, likes & reports schemas; TRVL-143 Budget entries & transport costs schemas | FE-13 TRVL-157, FE-14 TRVL-158 |
| Sandra George (`sandra`) | hotels, rooms, availability ranges, blocked dates, check-in/out, hotel policies, hotel search and free rooms | `modules/hotels` (hotels, rooms, room availability, policies, search) | HTL-01 (S1), HTL-02 (S1), HTL-03 (S1), HTL-04 (S1), HTL-05 (S1), HTL-06 (S1), HTL-08 (S1), HTL-09 (S1), HTL-10 (S1), HTL-11 (S2), HTL-12 (S2), HTL-15 (S2)<br>Tasks: TRVL-140 Hotels, rooms, room_nights & reviews sch | GEN-16 TRVL-115, FE-08 TRVL-152, FE-09 TRVL-153 |
| Sarah Eldahaby (`sarah`) | itineraries, days, activities, images, visibility, public search and cloning, hotel/flight search from an itinerary | `modules/itineraries` | ITN-01 (S1), ITN-03 (S1), ITN-05 (S1), ITN-07 (S1), ITN-08 (S1), ITN-09 (S1), ITN-10 (S1), ITN-12 (S2), ITN-20 (S2), ITN-21 (S2), ITN-25 (S2), ITN-26 (S2)<br>Tasks: TRVL-141 Itineraries & activities schemas + day/d | GEN-04 TRVL-99, FE-11 TRVL-155, FE-12 TRVL-156 |

Bonus items (unassigned, no sprint; only after all mandatory IDs pass): ACC-02 (TRVL-117), ACC-07 (TRVL-118), GEN-01-B (TRVL-119), FLT-27 (TRVL-120), FLT-28 (TRVL-121), HTL-26 (TRVL-122), ITN-27 (TRVL-123), ITN-28 (TRVL-124), BLG-13 (TRVL-125), BON-01 (TRVL-126), BON-02 (TRVL-127).

## Shared module folders

Some folders hold requirements of several people. Each person adds their own files; changing a teammate's file needs their
agreement in the PR, and the contract between the parts goes through `common/contracts`:

- `modules/flights`: Joudy (catalog, FLT-11 one-way search, FLT-15/17) and Ahmed (FLT-12 round trip, passenger types, cabin filter).
- `modules/flight-bookings`: Ahmed (FLT-22 hold, FLT-23 confirm + e-ticket, GEN-11 expiry) and Karim (FLT-19 passengers, FLT-21 summary, FLT-25/26 views and cancel, FLT-29 moderator view).
- `modules/hotel-bookings`: Ahmed (HTL-16 multi-room booking, HTL-18 hold, HTL-17 confirm) and Karim (HTL-20/21/22 views and cancel).
- `modules/admin`: Abdelrahman (ACC-07a, ACC-13, ACC-14) and Karim (ACC-15, ACC-16, ACC-17).
- Reviews (HTL-23/24) are Karim's in `modules/reviews`; hotels (Sandra) expose rating data through a contract.

## Notes and known mismatches

- Names follow Jira display names. The previous files said "Sarah Ibrahim"; Jira says "Sarah Eldahaby". Confirm the full name for AI_PROMPTS.txt and the README.
- GEN-14 and GEN-17 (frontend UX) are scheduled in Sprint 2 in Jira although they are Milestone 2 work; treat them as design-system groundwork.
- ITN-18: the exchange-rate service (TRVL-133) is Ahmed's and done; the budget conversion story (TRVL-80) is Malak's.
- GEN-12 (seed reference data, Joudy) must load the official reference datasets (brief §5.1); `docs/requirements/mock-data.xlsx` holds the sample rows.
