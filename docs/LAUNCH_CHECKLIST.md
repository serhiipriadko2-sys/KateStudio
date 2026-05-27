# Launch Checklist & Gap Analysis

> **Обновлено:** 27 мая 2026
> **Вердикт:** production launch readiness **PARTIAL / release candidate with accepted-risk decisions**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PARTIAL | older 16 May baseline is stale relative to live 23 May state |
| Local code health | PASS | local gates pass and current `main` has same-ref green CI proof |
| Latest verified CI signal | GREEN on current `main` | SHA `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`, workflow run `26508804416`, release jobs green |
| Fresh current-main CI proof | VERIFIED | `Lint & Format Check`, `TypeScript Check`, `Run Tests`, `Build WEB`, `Build APP` succeeded |
| Supabase security governance | PARTIAL | live security advisors still show two warnings, but separate decision notes now exist |
| Schema reproducibility | PARTIAL | live now reports **41** applied migrations; drift is documented and `20260518205158` has schema intent + forward artifact proposal |
| WEB payment posture | PASS AT MODEL LEVEL | WEB remains storefront-only |
| Function/payment deployment clarity | PASS AT GOVERNANCE LEVEL | legacy contour is on retirement track with controlled execution path; live retirement is still not executed |
| Runtime public smoke | PASS / LOCAL NOTE | `https://ksebe-studio.ru/` and Firebase APP target answer; earlier timeout was VPN-related |

---

## 2. What is currently confirmed on the 2026-05-23 baseline

- live Supabase now reports **41 applied migrations**.
- live Supabase now reports **11 active Edge Functions**.
- live payment tables `payment_orders` and `user_passes` are present.
- live function inventory still includes both `create-yookassa-checkout` and `yookassa-webhook`.
- exact repo confirmation exists for migration `20260516182944_yookassa_app_payments_live_cutover`.
- live `20260516202546 book_class_with_access` maps semantically to repo `supabase/migrations/20260516211000_book_class_with_access.sql`.
- live `20260516202845 book_class_with_access_revoke_public_execute` maps semantically to repo `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`.
- live `20260518205158 create_dataset_runs_and_artifacts` now has an explicit reconciliation artifact and selected additive reconstruction path.
- current `main` SHA `5a2393539bc664e40fd4f966bc0d7af6aa85dd86` has green check-runs for lint/format, typecheck, tests, WEB build, APP build, Supabase Preview, GitHub Pages, and Firebase deploy.
- public WEB smoke for `https://ksebe-studio.ru/` returned `200 OK` after VPN route change.
- public APP smoke for `https://artful-striker-476211-h4.web.app` returned `200 OK`.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | owner acceptance or live remediation of security decisions | warnings remain live; repo decision notes accept/defer with expiry dates |
| P0 | owner acceptance of migration reconciliation posture | `20260518205158` is documented with schema intent and forward proposal, not exact historical Git origin |
| P1 | legacy payment contour live retirement | governance path exists, but legacy functions remain deployed until controlled retirement is explicitly executed |
| P2 | performance advisor cleanup | live performance advisors still show RLS initplan and multiple-policy warnings |

---

## 4. Data / migration checklist

- [x] live payment cutover migration `20260516182944_yookassa_app_payments_live_cutover` is present in repo and live
- [x] live `20260516202546 book_class_with_access` is semantically mapped to repo `20260516211000_book_class_with_access.sql`
- [x] live `20260516202845 book_class_with_access_revoke_public_execute` is semantically mapped to repo `20260516214500_book_class_with_access_revoke_public_execute.sql`
- [x] `payment_orders` exists in live
- [x] `user_passes` exists in live
- [x] current docs stop claiming that live lacks the APP payment schema surface
- [x] explicit reconciliation artifact exists for `20260518205158_create_dataset_runs_and_artifacts`
- [x] path decision is fixed: `20260518205158` goes through additive reconstruction
- [x] prepare additive reconstruction artifact / migration-plan artifact for `20260518205158_create_dataset_runs_and_artifacts`
- [x] prepare schema intent note and forward artifact proposal for `dataset_runs` / `dataset_artifacts`
- [ ] obtain owner acceptance for treating the live-only delta as explicitly reconciled for this release
- [ ] perform one explicit repo/live migration inventory reconciliation across older history
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **partial; owner acceptance needed for full PASS**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs repo-side alternatives
- [x] keep WEB non-payment canon explicit
- [x] confirm APP YooKassa pair is live
- [x] decide how long the legacy pair `create-payment` / `payment-webhook` remains intentionally live
- [x] document retirement or coexistence criteria for the dual payment contour
- [ ] confirm which payment/public endpoints are intentionally exposed after the transition window

Status: **governance complete; live retirement still pending**.

---

## 6. Testing / build checklist

Current verified release-path truth for this document:

- `npm run check:migrations` → PASS locally, `66 files, 0 known collision group(s), 1 legacy short timestamp file(s)`
- `npm run lint` → PASS locally with 0 warnings after cleanup
- `npm run typecheck` → PASS locally
- `npm run test:run` → PASS locally, `72 files / 503 tests`
- `npm run build:web` → PASS locally with chunk-size warnings
- `npm run build:app` → PASS locally with chunk-size / ineffective dynamic import warnings
- current-main GitHub checks → PASS on SHA `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`

Status: **pass with build-size warnings**.

---

## 7. Smoke / runtime checklist

Recent grounded truth supports these passes:

- [x] app-target payment contour is deployed in live
- [x] payment-table surface exists in live
- [x] one fresh verified green CI run exists for the release job set
- [x] generic public `app_settings` reads outside `studio_contacts` are checked; live policy exposes only `studio_contacts` to `anon` / `authenticated`
- [x] empty `site_images` content is explicitly accepted as non-blocking because runtime falls back to local/static image state
- [x] one same-ref release smoke confirms current `main` truth, not just PR truth

Status: **pass with non-blocking empty-CMS warning**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. current `main` has fresh green proof for migration check, lint, typecheck, tests, and both builds;
2. live migration tail is fully Git-tracked or explicitly reconciled;
3. WEB remains non-payment by design;
4. APP payment contour is canonically owned: the dual contour is either explicitly transitional or the legacy pair is formally retired;
5. live security warnings are resolved or explicitly accepted with evidence;
6. remaining runtime anomalies around `app_settings` and `site_images` are either fixed or explicitly accepted.

Current status: code and CI are release-candidate ready. Full production PASS still depends on explicit owner acceptance of the documented migration/security residual risks or live remediation of those items.
