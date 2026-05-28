# Launch Checklist & Gap Analysis

> **Обновлено:** 28 мая 2026
> **Вердикт:** production launch readiness **PARTIAL / post-retirement verification pending**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PARTIAL | older 16 May baseline is stale relative to the accepted late-May canon |
| Local code health | PASS | current pass changed function/docs canon, not product code paths in APP/WEB |
| Fresh current-main CI proof | CHECK LIVE | not yet re-verified after the final retirement-in-place sync |
| Supabase security governance | PARTIAL+ | `book_class_with_access` is accepted as a narrow wrapper with branch-proof evidence; legacy payment trio is now retired in place |
| Schema reproducibility | PARTIAL, NOT BLOCKED BY `20260518205158` | live reports **41** applied migrations; `20260518205158` is treated as **accepted forward reconciliation** |
| WEB payment posture | PASS AT MODEL LEVEL | WEB remains storefront-only |
| Function/payment deployment clarity | PASS AT MODEL LEVEL | app-target payment contour remains live; legacy trio is retired in place rather than transitional |
| Runtime public smoke | PASS / LOCAL NOTE | `https://ksebe-studio.ru/` and Firebase APP target answer in the current canon |

---

## 2. What is currently confirmed on the accepted late-May baseline

- live Supabase reports **41 applied migrations**.
- live Supabase reports **11 active Edge Functions**.
- live payment tables `payment_orders` and `user_passes` are present.
- live function inventory still includes both `create-yookassa-checkout` and `yookassa-webhook`.
- live legacy trio remains deployed but is now retired in place:
  - `cancel-subscription` -> controlled retirement stub
  - `create-payment` -> controlled retirement stub
  - `payment-webhook` -> controlled retirement stub
- exact repo confirmation exists for migration `20260516182944_yookassa_app_payments_live_cutover`.
- live `20260516202546 book_class_with_access` maps semantically to repo `supabase/migrations/20260516211000_book_class_with_access.sql`.
- live `20260516202845 book_class_with_access_revoke_public_execute` maps semantically to repo `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`.
- live `20260518205158 create_dataset_runs_and_artifacts` has an accepted explicit reconciliation path through `20260527174716_reconcile_dataset_runs_artifacts_forward.sql`.
- public WEB smoke for `https://ksebe-studio.ru/` returned `200 OK` in the current canon.
- public APP smoke for `https://artful-striker-476211-h4.web.app` returned `200 OK` in the current canon.
- branch proof accepted `book_class_with_access` as a narrow `SECURITY DEFINER` wrapper while preserving the APP contract.

---

## 3. Hard blockers still open

В текущем каноне нет больше отдельного live payment blocker-а.

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | fresh same-ref release proof | после финального retirement-in-place sync ещё не пересобран честный release gate поверх текущего `main` и live state |

`book_class_with_access` is no longer listed here as an open release blocker. In
the current canon it is accepted as a narrow `SECURITY DEFINER` wrapper with
branch-proof evidence, even though the advisor warning remains.

`20260518205158` is no longer listed here as an open release blocker. Its status
in the current canon is **accepted forward reconciliation**.

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
- [x] retire legacy trio in place: `cancel-subscription`, `create-payment`, `payment-webhook`
- [x] accept `book_class_with_access` as a narrow `SECURITY DEFINER` wrapper with preserved APP contract and branch-proof evidence
- [ ] confirm which payment/public endpoints remain intentionally exposed after the retirement-in-place decision

Status: **payment contour no longer open as a live blocker**.

---

## 6. Testing / build checklist

Current verified release-path truth for this document:

- `npm run check:migrations` → PASS locally in the accepted canon
- `npm run lint` → PASS locally in the accepted canon
- `npm run typecheck` → PASS locally in the accepted canon
- `npm run test:run` → PASS locally in the accepted canon
- `npm run build:web` → PASS locally with chunk-size warnings in the accepted canon
- `npm run build:app` → PASS locally with chunk-size / ineffective dynamic import warnings in the accepted canon

Status: **pass in the accepted canon; fresh same-ref CI was not yet re-verified after the final payment retirement sync**.

---

## 7. Smoke / runtime checklist

Recent grounded truth supports these passes:

- [x] app-target payment contour is deployed in live
- [x] payment-table surface exists in live
- [x] generic public `app_settings` reads outside `studio_contacts` are checked; live policy exposes only `studio_contacts` to `anon` / `authenticated`
- [x] empty `site_images` content is explicitly accepted as non-blocking because runtime falls back to local/static image state
- [x] branch proof shows `book_class_with_access` persists canonical class data and self-scoped pass usage under the current APP contract
- [x] legacy trio is retired in place while `yookassa-webhook` and `create-yookassa-checkout` remain active

Status: **pass with non-blocking follow-up items**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. current `main` has fresh green proof for migration check, lint, typecheck, tests, and both builds;
2. live migration tail is fully Git-tracked or explicitly reconciled;
3. WEB remains non-payment by design;
4. APP payment contour is canonically owned and legacy payment contour is either retired or explicitly accepted as retired in place;
5. live security warnings are resolved or explicitly accepted with evidence.

Current status: code and schema reconciliation are no longer blocked by `20260518205158`. `book_class_with_access` is accepted in the current release canon as a narrow `SECURITY DEFINER` wrapper with branch-proof evidence. Legacy payment trio is retired in place. Full production PASS still depends on a fresh same-ref release gate after this final sync.

Live remediation packet: `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md`.
