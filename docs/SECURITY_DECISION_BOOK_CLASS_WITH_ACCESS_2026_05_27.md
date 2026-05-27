# Security Decision | book_class_with_access | 2026-05-27

> Mode: SECURITY
> Repo ref: `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`
> Live project: `qkaycdcbstjobacmuaro`
> Boundary: repo-side decision only; no live SQL mutation in this pass.

---

## Finding

[FACT] Live Supabase security advisor still reports
`authenticated_security_definer_function_executable` for:

`public.book_class_with_access(text, text, date, text, text, bigint)`

[FACT] The current APP client calls this RPC from
`k-sebe-yoga-studio-APPp/services/dataService.ts`.

[FACT] The repo migration keeps this function callable by `authenticated` and
revokes `public` / `anon` execution:

- `supabase/migrations/20260516211000_book_class_with_access.sql`
- `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`

---

## Current Behavior

`book_class_with_access` is the server-side booking gate for APP class booking
with active-pass enforcement. It checks `auth.uid()`, locks the target class,
checks active user passes, creates a booking, and decrements remaining visits in
one transaction-like RPC body.

---

## Why This May Be Intentional

[INTERP] Direct authenticated execution is probably intentional because the APP
needs a single server-side booking operation that can coordinate `classes`,
`bookings`, and `user_passes` without exposing that orchestration to client
logic.

[INTERP] The function contains an explicit `auth.uid()` null check and user-pass
ownership filtering, which reduces the most obvious cross-user abuse path.

---

## Why This Is Still Risky

[FACT] The function is `SECURITY DEFINER` in exposed `public` schema.

[INTERP] That means any missed ownership predicate or future edit inside the
function could bypass table RLS under the definer privileges.

[INTERP] Supabase advisors continue to report it as a warning even after the
`public` / `anon` execute revocation because `authenticated` can still execute a
`SECURITY DEFINER` RPC.

---

## Decision

Decision: accept temporarily as a known release risk, not as final architecture.

Owner: project owner / release owner.

Expiry date: 2026-06-10.

Acceptance rationale:

- The function is part of the active APP booking path.
- Immediate removal or conversion to `SECURITY INVOKER` could break paid-access
  booking unless verified against live RLS behavior.
- The current body includes explicit `auth.uid()` and user-owned pass checks.
- The safer remediation path should be designed and tested separately.

Monitoring signal:

- failed or suspicious RPC calls to `book_class_with_access`;
- duplicate booking anomalies;
- unexpected `user_passes` decrements;
- any future edit to this RPC or related RLS policies.

---

## Remediation Path

Target technical options to evaluate next:

1. Move the privileged logic behind an authenticated Edge Function and keep the
   client off direct privileged RPC execution.
2. Split public callable validation from private privileged mutation, with the
   privileged part outside exposed schemas.
3. Prove that a `SECURITY INVOKER` version works under current RLS and replace
   the definer function only after booking tests pass.

Verification rule:

- live security advisor warning disappears or is explicitly accepted again with
  a new owner/date;
- APP booking with valid pass still succeeds;
- duplicate, expired-pass, no-visits, and class-full cases still return the
  expected codes;
- no regression in `user_passes` decrement behavior.

Rollback expectation:

- restore the previous RPC definition if booking breaks during remediation;
- do not bypass APP pass checks in client code.

---

## PASS Rule

This decision closes the release governance gap only as a temporary acceptance.
It does not remove the live warning.

Result: warning accepted temporarily until 2026-06-10 with named release-owner
accountability and a separate remediation path.
