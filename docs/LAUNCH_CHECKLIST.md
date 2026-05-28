# Launch Checklist & Gap Analysis

> **Обновлено:** 28 мая 2026
> **Вердикт:** production launch readiness **PARTIAL / targeted live remediation in progress**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PARTIAL | older 16 May baseline is stale relative to the accepted late-May canon |
| Local code health | PASS | local gates were previously green and this pass did not introduce code changes |
| Fresh current-main CI proof | CHECK LIVE | not re-verified in this targeted reconciliation pass |
| Supabase security governance | PARTIAL+ | leaked password protection is no longer the open issue; `book_class_with_access` remains under accepted-risk / remediation posture |
| Schema reproducibility | PARTIAL, NOT BLOCKED BY `20260518205158` | live reports **41** applied migrations; `20260518205158` is now treated as **accepted forward reconciliation**, not as an open blocker |
| WEB payment posture | PASS AT MODEL LEVEL | WEB remains storefront-only |
| Function/payment deployment clarity | PARTIAL | app-target payment contour is live, but legacy contour retirement is still open |
| Runtime public smoke | PASS / LOCAL NOTE | `https://ksebe-studio.ru/` and Firebase APP target answer in the current canon |

---

## 2. What is currently confirmed on the accepted late-May baseline

- live Supabase reports **41 applied migrations**.
- live Supabase reports **11 active Edge Functions**.
- live payment tables `payment_orders` and `user_passes` are present.
- live function inventory still includes both `create-yookassa-checkout` and `yookassa-webhook`.
- exact repo confirmation exists for migration `20260516182944_yookassa_app_payments_live_cutover`.
- live `20260516202546 book_class_with_access` maps semantically to repo `supabase/migrations/20260516211000_book_class_with_access.sql`.
- live `20260516202845 book_class_with_access_revoke_public_execute` maps semantically to repo `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`.
- live `20260518205158 create_dataset_runs_and_artifacts` now has an accepted explicit reconciliation path through `20260527174716_reconcile_dataset_runs_artifacts_forward.sql`.
- public WEB smoke for `https://ksebe-studio.ru/` returned `200 OK` in the current canon.
- public APP smoke for `https://artful-striker-476211-h4.web.app` returned `200 OK` in the current canon.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | legacy payment contour live retirement | 0 repo-side callers are the current canon; live legacy functions still remain active and need staged retirement or explicit transition-window acceptance |
| P0 | `book_class_with_access` security-definer warning | live security advisors still flag the authenticated RPC; current evidence supports accepted-risk posture, not closure |

`20260518205158` is no longer listed here as an open release blocker. Its status in the current canon is **accepted forward reconciliation**.

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
- [x] forward reconciliation for `20260518205158` is accepted for the current release canon
- [ ] perform one explicit repo/live migration inventory reconciliation across older history when broader hygiene work resumes
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **accepted reconciliation; not a launch blocker by itself**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs repo-side alternatives
- [x] keep WEB non-payment canon explicit
- [x] confirm APP YooKassa pair is live
- [x] decide how long the legacy pair `create-payment` / `payment-webhook` remains intentionally live
- [x] document retirement or coexistence criteria for the dual payment contour
- [ ] confirm which payment/public endpoints are intentionally exposed after the transition window

Status: **open only on dual payment contour**.

---

## 6. Testing / build checklist

Current verified release-path truth for this document:

- `npm run check:migrations` → PASS locally in the accepted canon
- `npm run lint` → PASS locally in the accepted canon
- `npm run typecheck` → PASS locally in the accepted canon
- `npm run test:run` → PASS locally in the accepted canon
- `npm run build:web` → PASS locally with chunk-size warnings in the accepted canon
- `npm run build:app` → PASS locally with chunk-size / ineffective dynamic import warnings in the accepted canon

Status: **pass in the accepted canon; fresh same-ref CI was not re-verified in this targeted pass**.

---

## 7. Smoke / runtime checklist

Recent grounded truth supports these passes:

- [x] app-target payment contour is deployed in live
- [x] payment-table surface exists in live
- [x] generic public `app_settings` reads outside `studio_contacts` are checked; live policy exposes only `studio_contacts` to `anon` / `authenticated`
- [x] empty `site_images` content is explicitly accepted as non-blocking because runtime falls back to local/static image state

Status: **pass with non-blocking follow-up items**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. current `main` has fresh green proof for migration check, lint, typecheck, tests, and both builds;
2. live migration tail is fully Git-tracked or explicitly reconciled;
3. WEB remains non-payment by design;
4. APP payment contour is canonically owned: the dual contour is either explicitly transitional or the legacy pair is formally retired;
5. live security warnings are resolved or explicitly accepted with evidence.

Current status: code and schema reconciliation are no longer blocked by `20260518205158`. Full production PASS still depends on the dual payment contour decision and the `book_class_with_access` security-definer remediation or explicit release-time acceptance.

Live remediation packet: `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md`.
