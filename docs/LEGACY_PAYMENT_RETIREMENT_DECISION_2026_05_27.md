# Legacy Payment Retirement Decision | KateStudio

> **Date:** 27 May 2026
> **Author:** ChatGPT KateStudio agent
> **Repo ref:** `main`
> **Live project:** `qkaycdcbstjobacmuaro`
> **Mode:** `GOVERNANCE`

---

## Context

[FACT] Live currently still exposes both payment contours:
- legacy pair: `create-payment` / `payment-webhook`
- app-target pair: `create-yookassa-checkout` / `yookassa-webhook`

[FACT] Repo and current docs already treat APP payment as the intended business direction.

[FACT] APP runtime no longer depends on the legacy subscription layer:
- `Dashboard` no longer reads `subscriptions`
- APP legacy `subscriptionService` and its tests were removed from the active code path

[FACT] WEB remains storefront-only and does not mount the old `SubscriptionProfile` flow in the current app container.

[FACT] Current live data does not show active business use of the legacy contour:
- `subscriptions` has `0` rows
- `payment_orders` has confirmed live usage
- `user_passes` has confirmed live usage
- recent edge-function logs did not show fresh legacy traffic in the inspected window

[INTERP] The legacy contour no longer behaves like a necessary fallback for the current product surface. It behaves like a live backend tail awaiting controlled retirement.

---

## Decision Options

### Option A — Transitional dual contour

Use when:
- legacy flow still serves a real dependency;
- immediate retirement is unsafe.

### Option B — Legacy retirement path

Use when:
- legacy contour is no longer needed by any release surface.

---

## Evidence

- `Repo evidence:` APP payment runtime now centers on `paymentService`, `payment_orders`, and `user_passes`; APP legacy subscription service has been removed from active code usage.
- `Live function evidence:` legacy pair remains deployed, but app-target pair is also deployed and is the only confirmed current business path.
- `Client/runtime dependency evidence:` no confirmed live product/runtime dependency outside historical code and still-live backend functions.
- `Release risk:` keeping the legacy pair live without retirement status preserves ambiguity and widens the backend surface unnecessarily.

---

## Final Decision

- `Selected option:` Option B — legacy retirement path
- `Decision:` legacy retirement
- `Canonical contour:` `create-yookassa-checkout` / `yookassa-webhook` with `payment_orders` / `user_passes`
- `Retiring contour:` `create-payment` / `payment-webhook` and `subscriptions`-dependent surface
- `Pre-retirement proof:`
  - APP runtime dependency removed
  - WEB remains non-payment storefront
  - no confirmed active legacy business rows in `subscriptions`
  - no confirmed fresh legacy edge-function activity in the inspected recent window
- `Removal order:`
  1. freeze the legacy contour status in docs as retirement track
  2. confirm no remaining operational dependency on `cancel-subscription`
  3. disable or retire `create-payment`
  4. disable or retire `payment-webhook`
  5. review whether `subscriptions` can move to historical-only status
- `Rollback path:` if any hidden dependency is discovered during retirement execution, restore the legacy function pair temporarily while keeping APP payment canon unchanged
- `Owner:` payment/release governance
- `Review date:` next payment-focused release gate

### Why this option

[FACT] No current confirmed release surface still needs the legacy contour.

[INTERP] Keeping it classified as `temporary fallback` would now overstate its importance and understate the progress already achieved in the APP migration.

### Why the rejected option is not chosen now

[INTERP] Transitional dual contour is no longer the best description because APP cleanup is complete enough that the legacy path is no longer needed as the default safety story.

---

## One-line Result

Result: legacy contour enters retirement path after proof that no hidden operational dependency remains on the still-live legacy backend pair.
