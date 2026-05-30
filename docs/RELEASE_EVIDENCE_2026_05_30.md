# Release Evidence — 2026-05-30

## Verdict

PASS.

This release gate is accepted for the May 30, 2026 KateStudio security and traceability pass after the Git-tracked migration receipt was reconciled to the live Supabase migration ledger.

## Scope

This receipt covers the security reconciliation, `book-class-with-access` trace work, and the follow-up docs/repo ledger reconciliation completed through:

- PR #517: security reconciliation, grant hardening, function `search_path` remediation, and correlation-id logging.
- PR #518: safe trace receipt for `book-class-with-access` error responses.
- PR #519: first release evidence receipt for the May 30, 2026 gate.
- Follow-up ledger reconciliation: Git migration receipt aligned to live Supabase ledger version `20260530155036_security_reconcile_grants_search_path_book_class_ledger`.

## Evidence

### GitHub

- PR #517 merged: `fix(security): reconcile Supabase grants and trace class booking`.
- PR #518 merged: `feat(edge): expose safe trace receipt on booking errors`.
- PR #519 merged: `docs(release): record 2026-05-30 PASS evidence`.
- Current merge receipt for PR #518: `24e7aa52134bd0cb5d4241cf417cca3dcc197882`.
- PR #519 merge receipt: `4feb56d4b067e837cb7d4225f9243991880a5987`.
- Git-tracked migration receipt now uses the live ledger timestamp: `supabase/migrations/20260530155036_security_reconcile_grants_search_path_book_class_ledger.sql`.
- Checks receipt from the GitHub UI: 9 successful checks.
  - `CI / Build APP (push)`
  - `CI / Build WEB (push)`
  - `Deploy to GitHub Pages / Build for Pages (push)`
  - `Deploy to GitHub Pages / Deploy (push)`
  - `CI / Lint & Format Check (push)`
  - `CI / Run Tests (push)`
  - `Supabase Preview`
  - `CI / TypeScript Check (push)`
  - `Deploy to Firebase / build-and-deploy (push)`

### Supabase Security

- Live Supabase project `qkaycdcbstjobacmuaro` is `ACTIVE_HEALTHY` on Postgres `17.6.1.054` in `eu-central-1`.
- Live Supabase security advisors show no `WARN` lints after the reconciliation.
- Remaining security advisor output is limited to `INFO` RLS-enabled/no-policy notices on empty/scaffold tables.
- Live migration ledger includes `20260530155036_security_reconcile_grants_search_path_book_class_ledger`.
- `payment_orders` and `user_passes` grant surface was narrowed:
  - no `anon` table grants remain;
  - `authenticated` keeps `SELECT` only.
- Advisor-reported functions now have explicit `search_path=public`.
- `book_class_with_access` and `book_class_with_access_internal` remain service-role-only at RPC level.

### Edge Function Trace

- Live `book-class-with-access` deployed after PR #518 as version 7.
- Live function keeps `verify_jwt=true`.
- Live deployment SHA observed: `a928ed8f6d413710e0c22b180620d1dac993d2a7749576f56e5177bd7c6559ae`.
- Post-merge smoke used Supabase `pg_net` request id `4`.
- Smoke correlation id: `ks-book-class-smoke-20260530T1620Z`.
- Smoke response:
  - status `401`;
  - response header `x-correlation-id=ks-book-class-smoke-20260530T1620Z`;
  - `x-deno-execution-id=c9c88e1b-5a4f-4ec2-a832-8c4719dffa7b`;
  - response trace events: `request_received -> auth_failure -> request_completed`.
- Full recheck smoke used Supabase `pg_net` request id `5`.
- Full recheck correlation id: `ks-full-recheck-20260530T0001Z`.
- Full recheck response:
  - status `401`;
  - response header `x-correlation-id=ks-full-recheck-20260530T0001Z`;
  - `x-deno-execution-id=3e245e5d-e86e-44cc-afce-d6cafa880d55`;
  - response trace events: `request_received -> auth_failure -> request_completed`.

## Risk Notes

- The error-response contract now includes non-secret `trace` metadata. Successful booking responses remain unchanged.
- Raw Edge Function console JSON lines are not exposed through the current Supabase connector, so the response trace is the primary machine-checkable trace receipt.
- The remaining `INFO` advisor notices should be treated as hygiene for scaffold/empty tables, not as release blockers.
- The previously observed repo/live ledger timestamp drift is closed by aligning the Git-tracked migration receipt to the live ledger version `20260530155036`.
- Public WEB/APP surfaces were reachable as HTML pages during the full recheck. Interactive login, booking, payment, and post-login browser flows remain outside this release receipt.

## Decision

Release gate: PASS.

The security WARN surface is cleared, repo/live migration receipt is reconciled, `book-class-with-access` repo/live parity is restored, deployment is live, and smoke confirms the intended auth-failure trace path.

## Next Step

Keep this document as the release receipt until a newer release gate supersedes it.
