# Launch Checklist & Gap Analysis

> **Обновлено:** 16 мая 2026
> **Вердикт:** production launch readiness **FAIL**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PARTIAL | the 2026-05-16 live baseline is stronger than the 2026-05-12 canon and had to be re-synced explicitly |
| Local code health | FRESH GREEN UNVERIFIED | this pass did not verify a fresh green current-main release run |
| Latest directly observed repo-side CI signal | RED, but not current-main proof | PR `#498` shows a failing `AuthContext` test path and cannot substitute for a fresh release-path run |
| Supabase security governance | STRONG PARTIAL PASS | only leaked-password protection remains in security advisors |
| Auth UX readiness for leaked-password enforcement | IMPROVED | repo auth flows already distinguish weak vs compromised password messaging |
| Schema reproducibility | PARTIAL | the latest live delta is tracked, but one broader parity pass still has value |
| WEB payment posture | PASS AT MODEL LEVEL | WEB remains storefront-only |
| Function/payment deployment clarity | FAIL | live now exposes both legacy and app-target payment pairs, so the risk is dual ownership rather than missing deployment |
| Runtime public smoke | MIXED | payment-table `404` claims are stale, but `app_settings` and empty `site_images` still need follow-up |

---

## 2. What is newly confirmed on the 2026-05-16 baseline

- live Supabase now reports **38 applied migrations**.
- live Supabase now reports **11 active Edge Functions**.
- live now includes migration `20260516182944_yookassa_app_payments_live_cutover`.
- live function inventory now includes both `create-yookassa-checkout` and `yookassa-webhook`.
- direct SQL confirms `payment_orders` and `user_passes` exist in `public`.
- direct SQL confirms `payment_orders_rows = 1` and `user_passes_rows = 1` at the audit moment.
- recent logs show successful live traffic through `create-yookassa-checkout`, `payment_orders`, and `user_passes`.
- recent logs still show `401` for `app_settings?key=image_map` and `app_settings?key=theme`.
- `site_images` exists and recent reads return `200`, but the table still has `0` rows.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | dual payment contour remains unresolved | live currently exposes both `create-payment` / `payment-webhook` and `create-yookassa-checkout` / `yookassa-webhook`; canonical ownership and retirement criteria are not yet explicit |
| P0 | fresh green CI on the current release path is still unverified | this pass did not obtain a fresh current-main green proof |
| P0 | leaked password protection is still disabled in live Auth | Supabase security advisor still warns |
| P1 | runtime public smoke is still not fully clean | `app_settings` non-`studio_contacts` reads still fail, and `site_images` remains empty even though reads now return `200` |

---

## 4. Data / migration checklist

- [x] late-May governance/security migrations are tracked in repo and live history
- [x] live payment cutover migration `20260516182944_yookassa_app_payments_live_cutover` is present
- [x] `payment_orders` exists in live
- [x] `user_passes` exists in live
- [x] current docs stop claiming that live lacks the APP payment schema surface
- [ ] perform one explicit historical repo/live migration inventory reconciliation across older history
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **partially complete**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs repo-side alternatives
- [x] keep WEB non-payment canon explicit
- [x] confirm APP YooKassa pair is live
- [ ] decide how long the legacy pair `create-payment` / `payment-webhook` remains intentionally live
- [ ] document retirement or coexistence criteria for the dual payment contour
- [ ] confirm which payment/public endpoints are intentionally exposed in production after the transition window

Status: **not complete**.

---

## 6. Testing / build checklist

Current verified release-path truth for this document:

- `npm run check:migrations` → not freshly re-verified in this pass
- `npm run lint` → not freshly re-verified in this pass
- `npm run typecheck` → not freshly re-verified in this pass
- `npm run test:run` → fresh green unverified in this pass
- `npm run build:web` → fresh green unverified in this pass
- `npm run build:app` → fresh green unverified in this pass

Latest directly observed repo-side CI signal available during this review:

- PR `#498`
- red test path in APP auth context coverage
- useful as a risk signal, but not enough to declare the current release path red or green without a fresh current-main run

Status: **blocking until fresh green evidence exists**.

---

## 7. Smoke / runtime checklist

Recent live evidence supports these passes:

- [x] auth health endpoint responds `200`
- [x] public `classes` reads respond `200`
- [x] public `faq_items` reads respond `200`
- [x] public `trainers` reads respond `200`
- [x] public `site_images` reads now respond `200`
- [x] public analytics writes respond `201`
- [x] app payment reads/writes to `payment_orders` / `user_passes` are visible in recent logs
- [ ] generic public `app_settings` reads outside `studio_contacts` stop returning `401`
- [ ] empty `site_images` content is either populated or explicitly accepted as intentional
- [ ] one fresh narrow smoke confirms the intended dual-or-legacy payment routing story

Status: **mixed, needs one more pass**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. WEB remains non-payment by design.
2. APP payment contour is not merely live, but canonically owned: either the dual contour is explicitly accepted for a transition window or the legacy pair is formally retired.
3. CI is freshly green on the current release path, including tests and both builds.
4. leaked password protection is enabled.
5. weak signup, compromised reset, and sign-in with an old weak password are manually verified against the updated UX copy.
6. remaining runtime anomalies around `app_settings` and `site_images` are either fixed or explicitly accepted with evidence.
7. remaining repo/live migration baseline drift is either reconciled or explicitly documented as accepted history.

Until then, any "launch-ready" claim would still be decorative, not true.