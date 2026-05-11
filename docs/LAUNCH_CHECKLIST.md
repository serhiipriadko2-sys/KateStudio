# Launch Checklist & Gap Analysis

> **Обновлено:** 11 мая 2026
> **Вердикт:** production launch readiness **FAIL**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | IMPROVED, NOT COMPLETE | 2026-05-11 live follow-up is now recorded, but not every older repo/live drift is fully enumerated in one place |
| Local code health | LAST KNOWN PASS | build, lint, typecheck, and tests were not re-run in this pass |
| Supabase security governance | PARTIAL | direct permissive insert warnings and major `profiles` drift are closed, but GraphQL discoverability, leaked-password protection, and `vector` placement remain |
| Schema reproducibility | PARTIAL | three new live hardening migrations from 2026-05-11 are now committed to `main`, but a full repo/live baseline reconciliation is still not finished |
| Function deployment clarity | FAIL | live and repo still differ around AI and YooKassa naming contours |
| Trainers rollout documentation | PARTIAL | live trainers domain is real, but not every operational doc has been normalized around the new state |

---

## 2. What was closed in this pass

- live Supabase now reports **25 applied migrations**.
- live Supabase still reports **9 active Edge Functions**.
- three live hardening migrations from 2026-05-11 were executed and recorded in the repo canon:
  - `20260511130028_launch_hardening_and_policy_dedup_followup`
  - `20260511130129_rls_initplan_followup_for_hot_tables`
  - `20260511130207_final_rls_policy_cleanup_before_launch`
- dead permissive insert policies on `ai_jobs` and `api_logs` were removed.
- missing FK indexes for `ai_jobs`, `api_logs`, `bookings`, and `prompt_requests` were added.
- high-traffic self-access RLS policies were rewritten to initplan-friendly form on `profiles`, `bookings`, `practice_events`, `user_preferences`, `app_events`, `subscriptions`, `user_progress`, `user_achievements`, `classes`, `retreats`, and `user_push_tokens`.
- duplicate `admins` self-check policy fan-out was reduced.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | function canon split | live still keeps `ai-run` / `ai-embeddings`, while repo still carries `create-yookassa-checkout` / `yookassa-webhook` that are not present in live inventory |
| P0 | launch verification gap | local `lint` / `typecheck` / `test:run` / `build:web` / `build:app` were not re-run in this pass |
| P1 | GraphQL discoverability remains broad | security advisor still flags many `anon` and `authenticated` visible tables |
| P1 | leaked password protection disabled | Supabase advisor still warns |
| P1 | `vector` extension lives in `public` | security advisor still flags extension placement |

---

## 4. Data / migration checklist

- [x] record the three new 2026-05-11 live hardening migrations in `main`
- [x] remove dead permissive insert policies
- [x] close unindexed FK findings for the current AI/bookings path
- [ ] perform a full repo/live migration inventory reconciliation across older history
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **partially complete**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs `gemini-proxy`
- [ ] decide fate of repo-only `create-yookassa-checkout` and `yookassa-webhook`
- [ ] verify client callers against active function names
- [ ] confirm which payment/public endpoints are intentionally exposed in production

Status: **not complete**.

---

## 6. Testing / build checklist

These checks still need a fresh run against the current repo head:

- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build:web`
- `npm run build:app`

Status: **required before launch sign-off**.

---

## 7. Launch PASS definition

Launch PASS requires all of the following:

1. AI/payment function naming drift is intentionally resolved or explicitly accepted.
2. local verification is freshly green on the current repo head.
3. GraphQL discoverability is either intentionally accepted for the public content surface or further reduced for sensitive tables.
4. leaked password protection is enabled.
5. remaining repo/live migration baseline drift is either reconciled or explicitly documented as accepted history.

Until then, any "launch-ready" claim would still be decorative, not true.
