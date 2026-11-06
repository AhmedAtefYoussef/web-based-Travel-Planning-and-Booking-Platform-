## What

<!-- Requirement ID and Jira key, e.g. FLT-22 (TRVL-42). One requirement per PR. -->

## Why

## How to verify

<!-- Swagger steps (docs/api/swagger-demo.md style) and the exact test names -->

## Traceability row

<!-- | ID | Jira | endpoint(s) | code | proof tests | command | status | owner | PR | -->

## Checklist

- [ ] Branch `feature/<ID>-...` or `fix/<ID>-...` off current `develop`; commits `type(scope): summary [ID]`
- [ ] Spec `docs/specs/<ID>.md`: every acceptance sentence has a named, passing test
- [ ] `pr-ready` run: lint, build, unit, e2e, OpenAPI export committed, repo-consistency
- [ ] Role, ownership / provider-scope checks and DTO validation on every new route
- [ ] Money in integer minor units (`PLATFORM_CURRENCY`); times stored UTC
- [ ] Only my own files; cross-module access through `common/contracts` tokens
- [ ] Swagger summary starts with `[ID]`; errors documented
- [ ] `AI_PROMPTS.txt` entry appended (if AI helped); no secrets or `.env`
