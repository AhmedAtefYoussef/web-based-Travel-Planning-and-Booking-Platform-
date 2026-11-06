---
paths:
  - "backend/**"
---
# Backend rules (NestJS 11, Mongoose 8)

## Module shape
- `backend/src/modules/<feature>/`: `<feature>.module.ts`, `*.controller.ts` (HTTP only), `*.service.ts` (rules and DB),
  `schemas/*.schema.ts`, `dto/*.dto.ts`, tests beside the code. One feature module per folder; it exports only its services.
- Controllers: no business logic, no Mongoose. Validate input with class-validator DTOs; ids with `ParseObjectIdPipe`.
- Cross-module calls only through tokens in `src/common/contracts/tokens.ts` (`@Inject(TOKEN)`). Never import another
  module's files. A real implementation replaces a stub with `{ provide: TOKEN, useExisting: RealService }` in its own module,
  and the Leader removes the stub line from `ContractStubsModule` when wiring.
- Shared folders (`flights`, `flight-bookings`, `hotel-bookings`, `hotels`, `admin`) have several owners: add your own files
  (e.g. `flight-bookings/holds.service.ts`), do not rewrite a teammate's file without agreeing in the PR.

## Auth (until ACC-11/ACC-19 land)
- Global deny-by-default guard. Public routes need `@Public()`. Role routes use `@Roles(Role.ADMIN)` etc.
- Current user: `@CurrentUser()` / `@CurrentUser('id')`. Moderators carry `assignedProvider`; check it on every provider route.
- Ownership failures return 404 (do not reveal existence); role failures 403.
- Dev/test only: `DEV_AUTH_ENABLED=true` + `x-dev-user-id`, `x-dev-role`, `x-dev-provider` headers. Refused in production.

## Data
- Schemas: `@Schema({ collection: '<plural_snake>', timestamps: true })`. Money props are integers ≥ 0 (see the payments schema).
- Every query path used in a list or uniqueness rule has an index; uniqueness rules (one like, one review, one report) are
  unique indexes, not "find then insert".
- Inventory and other race-prone writes follow ADR-002: one atomic conditional update or a unique index, plus a transaction
  for multi-document writes. Never check-then-write in Node.
- Lists: `PaginationQueryDto` + `paginate()` from `common/dto`. Size is always 10.

## HTTP and docs
- Prefix `/api` is global. Paths and verbs follow project-description.md §8; justify any deviation in the spec.
- Errors are thrown as Nest HTTP exceptions; `AllExceptionsFilter` shapes them. Validation errors carry `fieldErrors`.
- Swagger: `@ApiTags`, summary `[ID] ...`, typed response DTOs, `@ApiErrors(400, 401, 403, 404, 409)` as applicable.
- New env variable: add it to `src/config/env.schema.ts` AND root `.env.example` (CI compares them). Ask Ahmed first.

## Do not
- Do not edit `package.json`/lockfile, `app.module.ts`, `common/contracts`, `common/stubs`, `config/`, `bootstrap/` unless you are
  Ahmed or he asked in writing.
- Do not log secrets, tokens, passwords, card data or full request bodies.
