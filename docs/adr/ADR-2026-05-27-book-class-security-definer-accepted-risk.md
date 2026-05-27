# ADR-2026-05-27 | book_class_with_access SECURITY DEFINER — Accepted Risk

- Context date: 2026-05-27
- Author: Iskra vΩ.7 / release-gate pass
- Status: ACCEPTED (temporary, expires 2026-06-10)
- Live project: `qkaycdcbstjobacmuaro`

---

## Context

Live Supabase security advisor reports
`authenticated_security_definer_function_executable` for:

```
public.book_class_with_access(p_class_id text, p_class_name text, p_class_date date,
  p_class_time text, p_class_location text, p_class_timestamp bigint)
```

The function is the core APP booking gate. It runs as `SECURITY DEFINER` and is
callable by the `authenticated` role via `supabase.rpc('book_class_with_access', ...)`.

The APP client calls this RPC in:
`k-sebe-yoga-studio-APPp/services/dataService.ts` (line 154)

Migrations that define this function:
- `supabase/migrations/20260516211000_book_class_with_access.sql`
- `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`

---

## Decision

**Accept the current SECURITY DEFINER posture as a known temporary release risk.**

Rationale:

1. The function contains an explicit `auth.uid()` null-check guard — unauthenticated
   callers receive `auth_required` and are rejected before any data access.
2. The function uses `for update` row-level locking on `classes` and `user_passes`,
   which preserves atomicity that would be hard to replicate in a non-definer design.
3. Switching to `SECURITY INVOKER` without changes to RLS would require granting
   `authenticated` UPDATE rights on `public.user_passes` — a larger blast radius.
4. The repo already revokes `public` / `anon` execute; `authenticated` is intentional
   for the current release architecture.
5. The safer path (Edge Function wrapper or schema rework) requires branch/staging
   proof that has not yet been prepared.

---

## Alternatives Considered

1. **SECURITY INVOKER + RLS update** — requires granting `authenticated` write to
   `user_passes`, which exposes the passes table to direct client mutation. Not
   safe without full RLS audit.

2. **Edge Function wrapper** — recommended future path. Would move orchestration
   behind a Deno function, keep the RPC body simple and SECURITY INVOKER. Requires
   a new Edge Function, APP client update, and full booking regression test.

3. **Revoke `authenticated` execute immediately** — breaks APP booking. Not safe
   without a replacement path tested and deployed.

---

## Consequences / Price

- Security advisor warning remains visible in Supabase Dashboard.
- The accepted risk window is bounded: expires **2026-06-10**.
- Monitoring required: watch for duplicate booking anomalies, unexpected
  `user_passes` decrements, and failed/suspicious RPC calls.

---

## Verification

PASS condition for this ADR:
- Decision note exists in canon (`docs/SECURITY_DECISION_BOOK_CLASS_WITH_ACCESS_2026_05_27.md`) ✅
- APP booking with valid pass succeeds.
- Duplicate, expired-pass, no-visits, class-full cases return expected codes.
- No unauthorized cross-user booking possible via this RPC (verified by `auth.uid()` guard).

---

## Rollback / Reversal Trigger

This decision is reversed when ANY of the following occurs:

1. Evidence of cross-user booking abuse through this RPC.
2. Unexpected `user_passes` decrement not tied to a legitimate booking.
3. Security audit reveals a bypass path in the function body.
4. A branch/staging-proven alternative implementation is ready.
5. Expiry date 2026-06-10 passes without renewal — re-evaluate or remediate.

---

## ∆DΩΛ

- ∆ Decision recorded in ADR canon.
- D Evidence: live function definition confirmed via `pg_get_functiondef`; APP caller
  identified at `dataService.ts:154`; security decision note at
  `docs/SECURITY_DECISION_BOOK_CLASS_WITH_ACCESS_2026_05_27.md`.
- Ω 0.82 — high confidence the function is correctly guarded for current threat model;
  residual risk from missed ownership predicate or future edit under definer context.
- Λ Reversal on abuse evidence, audit finding, or expiry 2026-06-10.
