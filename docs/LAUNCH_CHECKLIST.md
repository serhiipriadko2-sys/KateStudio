# Launch Checklist & Gap Analysis

> **Обновлено:** 23 мая 2026
> **Вердикт:** production launch readiness **FAIL**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PARTIAL | older 16 May baseline is stale relative to live 23 May state |
| Local code health | PARTIAL | one fresh green CI signal exists, but not on the same current `main` ref |
| Latest verified CI signal | GREEN, but PR-only | PR `#498`, workflow `CI #1246`, all release jobs green on PR head SHA `7bfcc466b08a5e2c4f097c7d5b4abadccbc37b73` |
| Fresh current-main CI proof | UNVERIFIED | this pass did not obtain a fresh green run on the same release `main` SHA |
| Supabase security governance | FAIL | live security advisors currently show two warnings: `book_class_with_access` exposure + leaked password protection disabled |
| Schema reproducibility | FAIL | live now reports **41** applied migrations, but repo-confirmed tail is still partial |
| WEB payment posture | PASS AT MODEL LEVEL | WEB remains storefront-only |
| Function/payment deployment clarity | FAIL | live exposes both legacy and app-target payment pairs; canonical ownership remains unresolved |
| Runtime public smoke | MIXED | prior `app_settings` / `site_images` follow-up remains open |

---

## 2. What is currently confirmed on the 2026-05-23 baseline

- live Supabase now reports **41 applied migrations**.
- live Supabase now reports **11 active Edge Functions**.
- live payment tables `payment_orders` and `user_passes` are present.
- live function inventory still includes both `create-yookassa-checkout` and `yookassa-webhook`.
- direct repo confirmation exists for migration `20260516182944_yookassa_app_payments_live_cutover`.
- direct repo confirmation is still missing in the current evidence packet for live versions `20260516202546`, `20260516202845`, and `20260518205158`.
- one fresh verified green CI run exists on PR `#498` / workflow `CI #1246`.
- that green run is not yet a same-ref proof for the current `main` release SHA.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | `migration-sync` remains unresolved | live history reaches `20260518205158_create_dataset_runs_and_artifacts`, but repo-confirmed tail is still partial |
| P0 | fresh green CI on the current release path is still unverified | PR-only green cannot substitute for same-ref release proof |
| P0 | dual payment contour remains unresolved | live still exposes both `create-payment` / `payment-webhook` and `create-yookassa-checkout` / `yookassa-webhook` |
| P0 | live security warnings remain | `book_class_with_access` is still callable as `SECURITY DEFINER` by `authenticated`; leaked password protection is still disabled |
| P1 | runtime public smoke is still not fully clean | `app_settings` and `site_images` follow-up remains open in canon |

---

## 4. Data / migration checklist

- [x] live payment cutover migration `20260516182944_yookassa_app_payments_live_cutover` is present in repo and live
- [x] `payment_orders` exists in live
- [x] `user_passes` exists in live
- [x] current docs stop claiming that live lacks the APP payment schema surface
- [ ] confirm Git-tracked path for `20260516202546`
- [ ] confirm Git-tracked path for `20260516202845`
- [ ] confirm Git-tracked path for `20260518205158`
- [ ] perform one explicit repo/live migration inventory reconciliation across older history
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **blocking**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs repo-side alternatives
- [x] keep WEB non-payment canon explicit
- [x] confirm APP YooKassa pair is live
- [ ] decide how long the legacy pair `create-payment` / `payment-webhook` remains intentionally live
- [ ] document retirement or coexistence criteria for the dual payment contour
- [ ] confirm which payment/public endpoints are intentionally exposed after the transition window

Status: **not complete**.

---

## 6. Testing / build checklist

Current verified release-path truth for this document:

- `npm run check:migrations` → not freshly re-verified on current `main`
- `npm run lint` → green on PR `#498` / `CI #1246`, current-main proof still missing
- `npm run typecheck` → green on PR `#498` / `CI #1246`, current-main proof still missing
- `npm run test:run` → green on PR `#498` / `CI #1246`, current-main proof still missing
- `npm run build:web` → green on PR `#498` / `CI #1246`, current-main proof still missing
- `npm run build:app` → green on PR `#498` / `CI #1246`, current-main proof still missing

Status: **blocking until same-ref current-main proof exists**.

---

## 7. Smoke / runtime checklist

Recent grounded truth supports these passes:

- [x] app-target payment contour is deployed in live
- [x] payment-table surface exists in live
- [x] one fresh verified green CI run exists for the release job set
- [ ] generic public `app_settings` reads outside `studio_contacts` are explicitly accepted or fixed
- [ ] empty `site_images` content is either populated or explicitly accepted as intentional
- [ ] one same-ref release smoke confirms current `main` truth, not just PR truth

Status: **mixed**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. current `main` has fresh green proof for migration check, lint, typecheck, tests, and both builds;
2. live migration tail is fully Git-tracked or explicitly reconciled;
3. WEB remains non-payment by design;
4. APP payment contour is canonically owned: the dual contour is either explicitly transitional or the legacy pair is formally retired;
5. live security warnings are resolved or explicitly accepted with evidence;
6. remaining runtime anomalies around `app_settings` and `site_images` are either fixed or explicitly accepted.

Until then, any `launch-ready` claim is still decorative, not true.