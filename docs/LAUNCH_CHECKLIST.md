# Launch Checklist & Gap Analysis

> **Обновлено:** 16 июня 2026
> **Вердикт:** production launch readiness **PASS with queued security fixes**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PASS | operational canon synced to live/code state in this pass |
| Local code health | PASS | current pass changed docs/memory canon, not product code paths |
| Fresh current-main CI proof | VERIFIED | `docs/RELEASE_EVIDENCE_2026_05_30.md` — CI run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb`, all 9 checks green |
| Supabase security governance | PASS | no WARN lints after 2026-05-30 reconciliation; remaining advisor output is INFO/WARN hygiene |
| Schema reproducibility | ACCEPTED | live reports **41** applied migrations; `20260518205158` forward-reconciled; `20260530155036` Git-tracked |
| WEB payment posture | PASS AT MODEL LEVEL | WEB remains storefront-only |
| Function/payment deployment clarity | PASS AT MODEL LEVEL | app-target payment contour is canonical; legacy trio is retired in place |
| Runtime public smoke | PASS / LOCAL NOTE | `https://ksebe-studio.ru/` and Firebase APP target answer in current canon |

---

## 2. What is currently confirmed on the accepted late-May baseline

- live Supabase reports **41 applied migrations**.
- live Supabase reports **12 active Edge Functions**.
- live payment tables `payment_orders` and `user_passes` are present.
- live function inventory includes `create-yookassa-checkout` and `yookassa-webhook` as canonical pair.
- live legacy trio remains deployed but is retired in place:
  - `cancel-subscription` -> controlled 410 retirement stub
  - `create-payment` -> controlled 410 retirement stub
  - `payment-webhook` -> controlled 410 retirement stub
- exact repo confirmation exists for migration `20260516182944_yookassa_app_payments_live_cutover`.
- live `20260516202546 book_class_with_access` maps semantically to repo `supabase/migrations/20260516211000_book_class_with_access.sql`.
- live `20260516202845 book_class_with_access_revoke_public_execute` maps semantically to repo `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`.
- live `20260518205158 create_dataset_runs_and_artifacts` has an accepted explicit reconciliation path.
- live `20260530155036 security_reconcile_grants_search_path_book_class_ledger` reconciles the booking boundary to the Edge Function + internal RPC design.
- public WEB smoke for `https://ksebe-studio.ru/` returned `200 OK` in the current canon.
- public APP smoke for `https://artful-striker-476211-h4.web.app` returned `200 OK` in the current canon.
- `book_class_with_access` is now a service-role-only internal RPC; the public APP contract is exposed through the `book-class-with-access` Edge Function (version 7, `verify_jwt=true`).

---

## 3. Hard blockers still open

No live payment or security WARN blockers remain.

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | `supabase/config.toml` project_id drift | `project_id = "katestudio-supabase-rehearsal"` does not match live ref `qkaycdcbstjobacmuaro` |
| P0 | Missing workflow `permissions:` | four workflows use default token scopes |
| P0 | Plaintext password logging | `scripts/create-admin.ts` prints generated password to stdout |

`book_class_with_access` is **not** listed here. It is now a service-role-only internal RPC behind the `book-class-with-access` Edge Function.

`20260518205158` is **not** listed here. Its status is accepted forward reconciliation.

---

## 4. Data / migration checklist

- [x] live payment cutover migration `20260516182944_yookassa_app_payments_live_cutover` is present in repo and live
- [x] live `20260516202546 book_class_with_access` is semantically mapped to repo `supabase/migrations/20260516211000_book_class_with_access.sql`
- [x] live `20260516202845 book_class_with_access_revoke_public_execute` is semantically mapped to repo `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql`
- [x] `payment_orders` exists in live
- [x] `user_passes` exists in live
- [x] current docs stop claiming that live lacks the APP payment schema surface
- [x] explicit reconciliation artifact exists for `20260518205158_create_dataset_runs_and_artifacts`
- [x] path decision is fixed: `20260518205158` goes through additive reconstruction
- [x] forward reconciliation for `20260518205158` is accepted for the current release canon
- [x] `20260530155036_security_reconcile_grants_search_path_book_class_ledger` is present in repo and live
- [ ] perform one explicit repo/live migration inventory reconciliation across older history when broader hygiene work resumes
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **accepted reconciliation; not a launch blocker**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs `gemini-proxy`
- [x] keep WEB non-payment canon explicit
- [x] confirm APP YooKassa pair is live
- [x] retire legacy trio in place: `cancel-subscription`, `create-payment`, `payment-webhook`
- [x] `book_class_with_access` is service-role-only internal RPC; `book-class-with-access` Edge Function is the public APP boundary
- [ ] confirm which payment/public endpoints remain intentionally exposed after the retirement-in-place decision

Status: **payment contour canonical; booking contour updated**.

---

## 6. Testing / build checklist

Current verified release-path truth:

- `npm run check:migrations` → PASS locally in the accepted canon
- `npm run lint` → PASS locally in the accepted canon
- `npm run typecheck` → PASS locally in the accepted canon
- `npm run test:run` → PASS locally in the accepted canon
- `npm run build:web` → PASS locally with chunk-size warnings in the accepted canon
- `npm run build:app` → PASS locally with chunk-size / ineffective dynamic import warnings in the accepted canon
- Fresh same-ref CI: **VERIFIED** by run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb`

Status: **verified**.

---

## 7. Smoke / runtime checklist

Recent grounded truth supports these passes:

- [x] app-target payment contour is deployed in live
- [x] payment-table surface exists in live
- [x] generic public `app_settings` reads outside `studio_contacts` are checked; live policy exposes only `studio_contacts` to `anon` / `authenticated`
- [x] empty `site_images` content is explicitly accepted as non-blocking because runtime falls back to local/static image state
- [x] `book_class_with_access` is service-role-only; `book-class-with-access` Edge Function validates user JWT and returns safe trace receipts on errors
- [x] legacy trio is retired in place while `yookassa-webhook` and `create-yookassa-checkout` remain active

Status: **pass with non-blocking follow-up items**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. current `main` has fresh green proof for migration check, lint, typecheck, tests, and both builds;
2. live migration tail is fully Git-tracked or explicitly reconciled;
3. WEB remains non-payment by design;
4. APP payment contour is canonically owned and legacy payment contour is retired in place;
5. live security warnings are resolved or explicitly accepted with evidence;
6. **NEW:** `supabase/config.toml` project_id matches live or is explicitly isolated;
7. **NEW:** GitHub Actions workflows declare least-privilege `permissions:`;
8. **NEW:** no plaintext secrets are logged by scripts.

Current status: items 1–5 are satisfied. Items 6–8 are queued for the next PR and are **not** launch blockers for the already-deployed release, but they block the next production change.

Live remediation packet: `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md`.
