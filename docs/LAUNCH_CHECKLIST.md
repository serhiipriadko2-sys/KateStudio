# Launch Checklist & Gap Analysis

> **Обновлено:** 12 мая 2026
> **Вердикт:** production launch readiness **FAIL**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | IMPROVED | the 2026-05-12 security delta is now recorded and the live baseline is closer to repo truth |
| Local code health | LAST KNOWN PASS | build, lint, typecheck, and tests were not re-run in this pass |
| Supabase security governance | STRONG PARTIAL PASS | GraphQL discoverability and `vector`-in-`public` warnings are now closed; only leaked-password protection remains |
| Schema reproducibility | PARTIAL | the latest live delta is committed, but older repo/live history still needs one explicit reconciliation pass |
| Function deployment clarity | FAIL | live and repo still differ around AI/payment naming contours |
| Runtime public smoke | MIXED | recent live logs show successful public reads on `classes`, `faq_items`, `reviews`, `trainers`, and analytics writes, but also repeated `401` on `app_settings` and `406` on `site_images` lookups |

---

## 2. What was closed in this pass

- live Supabase now reports **30 applied migrations**.
- live Supabase still reports **9 active Edge Functions**.
- one additional live hardening migration from 2026-05-12 was executed and recorded in the repo canon:
  - `20260512062001_missing_security_deltas`
- `pg_graphql` was removed from live because the project evidence currently points to REST usage, not GraphQL usage.
- `vector` was moved from `public` to `extensions`.
- security advisors now report only one remaining warning: leaked password protection disabled.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | function canon split | live still keeps `ai-run` / `ai-embeddings`, while repo-side naming drift has not been intentionally normalized |
| P0 | launch verification gap | local `check:migrations` / `lint` / `typecheck` / `test:run` / `build:web` / `build:app` were not re-run in this pass |
| P0 | leaked password protection disabled | Supabase security advisor still warns |
| P1 | public smoke anomalies remain | recent live API logs still show repeated `401` on `app_settings` and `406` on `site_images` |

---

## 4. Data / migration checklist

- [x] record the 2026-05-11 live hardening migrations in `main`
- [x] record the 2026-05-12 `missing_security_deltas` live migration in `main`
- [x] remove GraphQL discoverability by disabling unused `pg_graphql`
- [x] move `vector` extension out of `public`
- [ ] perform a full repo/live migration inventory reconciliation across older history
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **partially complete**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs repo-side alternatives
- [ ] decide canonical payment function naming and remove stale repo/live drift
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

## 7. Smoke / runtime checklist

Recent live API evidence supports these passes:

- [x] auth health endpoint responds `200`
- [x] REST admin readiness responds `200`
- [x] public `classes` reads respond `200`
- [x] public `faq_items` reads respond `200`
- [x] public `reviews` reads respond `200`
- [x] public `trainers` reads respond `200`
- [x] public analytics writes respond `201`
- [ ] public `app_settings` reads stop returning `401`
- [ ] `site_images` lookups stop returning repeated `406`

Status: **mixed, needs one more pass**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. AI/payment function naming drift is intentionally resolved or explicitly accepted.
2. local verification is freshly green on the current repo head.
3. leaked password protection is enabled.
4. public smoke anomalies around `app_settings` and `site_images` are either fixed or explicitly accepted with evidence.
5. remaining repo/live migration baseline drift is either reconciled or explicitly documented as accepted history.

Until then, any "launch-ready" claim would still be decorative, not true.
