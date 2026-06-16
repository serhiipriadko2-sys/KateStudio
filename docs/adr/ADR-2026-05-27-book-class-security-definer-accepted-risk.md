# ADR-2026-05-27 | book_class_with_access SECURITY DEFINER — Accepted Risk

- Context date: 2026-05-27
- Author: Iskra vΩ.7 / release-gate pass
- Status: **SUPERSEDED** (see ADR-2026-06-16-002 in `adr-log.md`)
- Superseded date: 2026-06-16
- Live project: `qkaycdcbstjobacmuaro`

> **⚠️ This ADR is no longer current.** The design evolved after migration
> `20260530155036_security_reconcile_grants_search_path_book_class_ledger` and PRs #517–#518.
> The canonical booking boundary is now:
> - `book-class-with-access` Edge Function (`verify_jwt=true`, version 7) handles APP auth and CORS;
> - internal RPC `book_class_with_access_internal` is service-role-only and called by the Edge Function.
>
> Current operational truth is in `project-memory.md`, `docs/RELEASE_EVIDENCE_2026_05_30.md`,
> `docs/SECURITY_MODEL.md`, and `adr-log.md` (ADR-2026-06-16-002).

---

## Historical Context

Live Supabase security advisor reported
`authenticated_security_definer_function_executable` for:

```
public.book_class_with_access(p_class_id text, p_class_name text, p_class_date date,
  p_class_time text, p_class_location text, p_class_timestamp bigint)
```

At the time, the function was the core APP booking gate, ran as `SECURITY DEFINER`,
and was callable by the `authenticated` role via `supabase.rpc('book_class_with_access', ...)`.

---

## Historical Decision

**Accepted the current SECURITY DEFINER posture as a known temporary release risk**
with an expiry window of 2026-06-10.

---

## Why It Was Superseded

1. Migration `20260530155036` revoked `authenticated`/`anon` execute on `book_class_with_access`
   and introduced `book_class_with_access_internal` for service-role-only use.
2. PRs #517–#518 deployed `book-class-with-access` Edge Function version 7, which validates
   the user JWT and calls the internal RPC with the service role key.
3. The security advisor WARN was cleared; the APP contract is preserved through the Edge Function.
4. The expiry date 2026-06-10 passed without needing renewal because the architecture changed.

---

## Current Canonical Path

- APP client → `POST /functions/v1/book-class-with-access` with user JWT.
- Edge Function validates JWT, then calls `book_class_with_access_internal(...)` via admin client.
- Internal RPC performs atomic booking logic under service-role context.

For verification details, see `docs/RELEASE_EVIDENCE_2026_05_30.md`.

---

## ∆DΩΛ

- ∆ ADR superseded by architectural change.
- D `docs/RELEASE_EVIDENCE_2026_05_30.md`, live function source, migration ledger.
- Ω 1.0 — superseded by verified code change.
- Λ Re-open only if the Edge Function boundary is removed and the authenticated RPC is restored.
