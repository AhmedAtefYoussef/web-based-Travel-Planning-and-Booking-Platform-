---
name: swarm-card
description: Use when asked to write a card, dispatch a worker, plan a new wave, or hand a task to a subagent in this repo.
---

# Swarm card (template v2)

Write the card to `.swarm/tasks/<id>.md`. Hard limit: <= 150 words (CARD_WORDS in `.swarm/config.md`). All `.swarm` paths are repo-relative, never absolute.

```
ID: tN  MODEL: sonnet  DEPENDS: ...  REQ: PAY-01, TRVL-67  CTX: v<N>
BRANCH: feature/<ID>-<slug> (from origin/develop <sha>)
GOAL: one sentence.
CONTEXT: context.md ## sections; api.md ## section
INPUTS: path:Lx-Ly, ...
DELIVER: ...
OWNS: globs (disjoint from every other open card)
DONE WHEN: exact commands that must exit 0 + named tests
REMEMBER: one line
RULES: .swarm/rules.md
```

## Checks before dispatch
1. Word count <= 150: `wc -w .swarm/tasks/<id>.md`.
2. REQ line lists real requirement IDs (Grep reqs.json by id, never read it whole).
3. CTX matches the current `context.md` version.
4. OWNS disjoint: list open cards in `.swarm/tasks/` and compare globs; any overlap means split or sequence them.
5. DONE WHEN holds commands, not prose. Long output goes to `.swarm/tmp/`.
6. At most AGENT_MAX_CARDS (2) cards per agent.

## Model routing
| Work | Model |
|---|---|
| Contracts, money, payments, auth, security review, verifier | opus |
| Feature implementation, tests from acceptance, docs | sonnet |
| Search, formatting, OpenAPI regen, lint fixes | haiku |

Leader work (planning, cards, merges, Jira) stays in the main session.

## Dispatch
One worktree per card (superpowers:using-git-worktrees). The worker replies inline; it cannot write to `.swarm/out/`. Then use swarm-verify.
