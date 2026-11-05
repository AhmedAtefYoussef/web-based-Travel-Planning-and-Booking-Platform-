ID: t2b   MODEL: opus   DEPENDS: t2   SWARM: C:/Users/ahmed/OneDrive/Desktop/web-based-Travel-Planning-and-Booking-Platform-/.swarm
BRANCH: feature/PAY-01-payments-refunds (continue in worktree C:/Users/ahmed/OneDrive/Desktop/web-based-Travel-Planning-and-Booking-Platform-/.claude/worktrees/agent-a12c8acb87811b7c1, HEAD 05b4174)
GOAL: Make Stripe success/refund handling money-safe and retry-safe [PAY-01, PAY-03].
CONTEXT: SWARM/api.md ## t2; SWARM/out/t2.md (prior notes).
INPUTS: backend/src/modules/payments/{payments.service,refunds.service,schemas}.ts and their specs.
FINDINGS (all must be fixed, TDD):
1 HIGH: success for the current PI on a payment in FAILED (or PENDING) must not be dropped; never return silently with money captured. retry(): retrieve the old PI first, and abort with 409 if it is succeeded or processing.
2 Late-refund path must be retry-safe on webhook redelivery (e.g. status SUCCEEDED_REFUND_PENDING, or redo refundPayment when SUCCEEDED but booking not confirmed by this payment).
3 Refund the amount actually captured on that PI (amount_received) and record it.
4 Dedupe refunds per PaymentIntent id (store paymentIntentId on Refund), not per booking.
OWNS: backend/src/modules/payments/**
DONE WHEN: build, lint, test, test:e2e exit 0; one spec per finding fails before the fix and passes after.
REMEMBER: four findings fixed with tests; payments module only; commit, no push.
RULES: SWARM/rules.md
