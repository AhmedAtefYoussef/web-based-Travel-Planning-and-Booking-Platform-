# Secrets in repo/history — names only (Leader, SHA 6efa26b, 2026-11-05)
- Tracked tree at 6efa26b: 0 matches for Stripe live/test secret keys, webhook secrets, or mongodb URIs with inline user:password (git grep).
- Files ever added with secret-like names: only tokens.ts (DI tokens), password-hasher(.spec).ts — benign.
- History: 0 commits with sk_live_ / whsec_ patterns.
- History: commit ce0a259 (2026-11-04, fix(config): multi-host MongoDB) added a mongodb+srv URI with inline credentials to backend/src/config/env.schema.spec.ts
  (username "user", 6-char alphanumeric password, *.mongodb.net host); replaced by placeholders in 2e264c6 the same day. Value not printed.
  Finding (Low, Ahmed-only): confirm the value is not a real Atlas user password; if it is, rotate it in Atlas (history is public to repo readers).
