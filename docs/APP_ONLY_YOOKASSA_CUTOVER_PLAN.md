# APP-Only YooKassa Cutover Plan | KateStudio

> **Дата:** 13 мая 2026
> **Режим:** SECURITY / RELEASE / SUPABASE
> **Статус:** review-only, no production mutation performed by this document
> **Вердикт:** `PARTIAL` — business canon is clear, but live backend is still not aligned to the app-only YooKassa model.
>
> Для present-tense operational status используйте:
>
> - `CURRENT_TASKS.md`
> - `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md`
> - `docs/LAUNCH_CHECKLIST.md`

---

## 1. Intent

This plan exists to promote the already accepted business model into technical truth:

- `WEB` stays storefront-only: Telegram Katya + lead form, no direct checkout.
- `APP` becomes the only canonical YooKassa payment surface.
- `RuStore` stays publication/proof-of-app-existence surface and is not the mandatory billing canon.

This is a cutover plan, not an approval to deploy.

---

## 2. Current live evidence

### Live Supabase baseline used by this plan

Synced against the canonical live snapshot dated 12 May 2026:

- applied migrations: **37**
- active functions: **9**
- current live payment functions:
  - `create-payment`
  - `payment-webhook`
- current live app-target functions missing:
  - `create-yookassa-checkout`
  - `yookassa-webhook`
- current live public schema inventory does **not** confirm:
  - `payment_orders`
  - `user_passes`

### Operational implication

Live still reflects the older shared payment contour, not the app-only YooKassa contour.

---

## 3. Current repo evidence

### APP caller

APP `paymentService` calls:

- `create-yookassa-checkout`

### Repo-only app-target backend

Repo contains:

- `supabase/functions/create-yookassa-checkout`
- `supabase/functions/yookassa-webhook`
- migration `20260507172615_yookassa_app_payments.sql`

### Data model expected by repo APP flow

The repo app-only flow expects:

- `pricing_plans.amount_cents`
- `pricing_plans.currency`
- `pricing_plans.visits_total`
- `pricing_plans.valid_days`
- `pricing_plans.is_payable`
- `payment_orders`
- `user_passes`

---

## 4. Drift

`DRIFT: repo APP payment contour vs live Supabase payment contour`

### Repo intent

- app-only YooKassa checkout
- app-only YooKassa webhook
- payment order ledger
- user passes ledger

### Live truth

- older shared payment pair only
- no confirmed live tables for the app-only order/pass model

### Risk

If APP traffic reaches the repo-only path before cutover, payment initiation or post-payment fulfillment will fail.

---

## 5. Preferred safe path

### Phase 0 — freeze assumptions

- Keep `WEB` unchanged.
- Do not add direct payment to `WEB`.
- Treat `create-payment` / `payment-webhook` as legacy/shared live path.
- Treat `create-yookassa-checkout` / `yookassa-webhook` as target app-only path.

### Phase 1 — preflight in non-production

1. Verify CI is green on the release path.
2. Verify APP still points only to `create-yookassa-checkout`.
3. Verify no WEB user-facing flow depends on `create-payment` for public checkout.
4. Verify YooKassa onboarding prerequisites and current partner-side app proof requirements are satisfied.
5. Verify all required env contracts exist outside this document:
   - `YOOKASSA_SHOP_ID`
   - `YOOKASSA_SECRET_KEY`
   - `YOOKASSA_VAT_CODE`
   - optional webhook auth envs if used
   - `SUPABASE_SERVICE_ROLE_KEY`
   - allowlisted return-url hosts

### Phase 2 — schema alignment

Apply the app-payment migration in non-production first:

- `20260507172615_yookassa_app_payments.sql`

Verification after migration:

- `pricing_plans` contains payable online fields
- `payment_orders` exists with RLS enabled
- `user_passes` exists with RLS enabled
- required indexes exist
- app read paths for authenticated users work without `404`

### Phase 3 — function alignment

Deploy together, never one without the other:

- `create-yookassa-checkout`
- `yookassa-webhook`

Verification after deploy:

- function inventory shows both slugs live
- `create-yookassa-checkout` accepts authenticated request and returns `confirmationUrl`
- `yookassa-webhook` accepts provider callback and updates order state

### Phase 4 — smoke verification

Run an end-to-end non-production smoke path:

1. authenticated APP user requests checkout
2. `payment_orders` row is created
3. redirect payment URL is returned
4. provider payment id is saved
5. webhook callback moves order to terminal state
6. successful payment creates or updates `user_passes`
7. APP reads active pass without direct DB drift or `404`

### Phase 5 — production promotion

Only after non-production proof:

1. apply the migration in live
2. deploy the two app-only functions in live
3. confirm live tables exist
4. confirm live functions exist
5. verify one controlled production smoke path
6. keep `WEB` unchanged during this phase

### Phase 6 — legacy cleanup

Only after stable live proof:

- mark `create-payment` and `payment-webhook` as legacy in docs or retire them if nothing operational still depends on them
- remove stale app probes that assume absent tables/functions
- reconcile launch docs and runtime probes

---

## 6. Rollback

### Before production cutover

- Stop at non-production and do not promote.

### After live schema applied but before stable traffic

- APP can be held back from the new payment surface while schema remains live.
- Legacy shared payment functions may remain deployed until cutover confidence exists.

### After live function deploy with defects

- Disable or stop routing APP to the new checkout path.
- Keep `WEB` on Telegram/lead-form onboarding.
- Revert function versions or redeploy last known good versions.
- Preserve `payment_orders` data for forensic review; do not delete order rows during rollback.

---

## 7. Approval needed before write actions

Explicit approval is required before:

1. applying `20260507172615_yookassa_app_payments.sql` anywhere
2. deploying `create-yookassa-checkout`
3. deploying `yookassa-webhook`
4. changing APP routing in production
5. retiring `create-payment` or `payment-webhook`

---

## 8. PASS definition

The app-only YooKassa cutover becomes `PASS` only when all of the following are true:

1. `WEB` remains non-payment by design.
2. live schema contains the app-payment data model.
3. live function inventory contains the app-only YooKassa pair.
4. APP checkout succeeds end to end.
5. webhook fulfillment creates stable `payment_orders` and `user_passes` state.
6. no repeated `404` remains for app payment tables on real traffic.
7. legacy shared payment endpoints are either explicitly retained or explicitly deprecated.

---

## 9. Immediate next execution step

The next safe execution step is:

1. create a non-production branch/database,
2. apply `20260507172615_yookassa_app_payments.sql`,
3. deploy `create-yookassa-checkout` and `yookassa-webhook`,
4. run one full checkout + webhook smoke test,
5. only then decide on live promotion.
