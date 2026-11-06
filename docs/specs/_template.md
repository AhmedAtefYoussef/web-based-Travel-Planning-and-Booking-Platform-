# <ID> - <short title>

Jira: TRVL-<n> · Owner: <name> · Sprint: <S1|S2|...> · Branch: `feature/<ID>-<slug>` · Status: draft | in review | done

## Requirement (verbatim, `node .claude/skills/req/req.mjs <ID>`)
> paste the workbook text unchanged

## Acceptance sentences
| # | Sentence (from the text above) | Proof test (exact name) | File |
|---|---|---|---|
| A1 | | | |
| A2 | | | |

Dependencies: <IDs> (real module or which stub/contract covers it)

## API (match project-description.md §8)
| Method | Path | Role / ownership | Request DTO | Success | Errors |
|---|---|---|---|---|---|
| POST | /api/... | USER, owner only | `CreateXDto` | 201 `XDto` | 400, 401, 403, 404, 409 |

## Data
Collections, fields (money as integer minor units), indexes (each uniqueness rule = unique index), embedded vs referenced and why.

## Business rules and edge cases
- Rule -> where enforced (service method / index / transaction)
- Boundaries: empty, max, time zones, concurrency, expired holds, repeated requests (idempotency)

## Contracts
Tokens consumed / provided. Any change to `common/contracts` needs Ahmed's approval: describe it here first.

## Decisions
Choice, alternatives, why (only if there was a real trade-off).

## Out of scope
What this PR deliberately does not do (bonus items, other members' IDs).
