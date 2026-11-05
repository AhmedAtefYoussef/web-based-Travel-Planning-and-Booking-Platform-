ID: verify-v2-2  MODEL: opus  DEPENDS: v0  REQ: PAY-01, PAY-03, PAY-04, GEN-05, GEN-07, GEN-08, TRVL-131  CTX: v2
BRANCH: none; throwaway copy .swarm/tmp/mutate-sprint0 (detached 6efa26b). Never commit.
GOAL: Prove the proving tests protect 11 critical rules by mutation.
CONTEXT: context.md ## test harness gotchas
INPUTS: rules: webhook signature, idempotent confirm, refund tier selection, provider 100%, zero refund -> no Stripe call, minor units/currency exponent, PLATFORM_CURRENCY, page size 10, audit append-only, upload magic bytes, dev guard refused in production
DELIVER: .swarm/verify/v2-2.md: rule | file:line mutated | minimal diff | proving test | result KILLED/SURVIVED | restored (git diff empty); rule 7 block.
OWNS: none (edits only inside the throwaway copy, reverted each time)
DONE WHEN: >= 11 mutants run; after each, git -C .swarm/tmp/mutate-sprint0 diff --quiet exits 0.
REMEMBER: one mutant at a time; a SURVIVED mutant is a finding "test does not protect the rule".
RULES: .swarm/rules.md; no network
