[t0] Contracts+DI tokens in backend/src/common/contracts (inject by token, e.g. @Inject(PAYABLE_BOOKING)); stubs bound in common/stubs/ContractStubsModule; temp DevAuthGuard reads x-dev-user-id/x-dev-role/x-dev-provider headers (non-prod only); class-validator+joi installed.
[leader] Dev auth headers now need DEV_AUTH_ENABLED=true (env, default false; only NODE_ENV development|test). Test env must set DEV_AUTH_ENABLED=true and NODE_ENV=test.
[leader] develop now has PR#3: test/setup-env.ts sets DEV_AUTH_ENABLED=true. Rebase onto origin/develop before your final commit if you touch test/setup-env.ts or src/config.
[t2b] RefundsService.refundPayment(payment, pi:{id,amount_received}, reason) now returns RefundRecord|null; Refund has required paymentIntentId (dedupe per PI).
