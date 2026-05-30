# Release Evidence — 2026-05-30

## Verdict

PASS.

This release gate is accepted for the May 30, 2026 KateStudio security and traceability pass.

## Scope

This receipt covers the security reconciliation and `book-class-with-access` trace work completed through:

- PR #517: security reconciliation, grant hardening, function `search_path` remediation, and correlation-id logging.
- PR #518: safe trace receipt for `book-class-with-access` error responses.

## Evidence

### GitHub

- PR #517 merged: `fix(security): reconcile Supabase grants and trace class booking`.
- PR #518 merged: `feat(edge): expose safe trace receipt on booking errors`.
- Current merge receipt for PR #518: `24e7aa52134bd0cb5d4241cf417cca3dcc197882`.
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

- Live Supabase security advisors show no `WARN` lints after the reconciliation.
- Remaining security advisor output is limited to `INFO` RLS-enabled/no-policy notices on empty/scaffold tables.
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

## Risk Notes

- The error-response contract now includes non-secret `trace` metadata. Successful booking responses remain unchanged.
- Raw Edge Function console JSON lines are not exposed through the current Supabase connector, so the response trace is the primary machine-checkable trace receipt.
- The remaining `INFO` advisor notices should be treated as hygiene for scaffold/empty tables, not as release blockers.

## Decision

Release gate: PASS.

The security WARN surface is cleared, repo/live parity for `book-class-with-access` is restored, deployment is live, and post-merge smoke confirms the intended auth-failure trace path.

## Next Step

Keep this document as the release receipt until a newer release gate supersedes it.
