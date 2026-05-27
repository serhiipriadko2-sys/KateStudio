# Admin Subscriptions Surface Decision | KateStudio

> **Date:** 27 May 2026
> **Author:** ChatGPT KateStudio agent
> **Repo ref:** `main`
> **Live project:** `qkaycdcbstjobacmuaro`
> **Mode:** `GOVERNANCE`

---

## Context

[FACT] APP runtime payment canon уже переведён на `create-yookassa-checkout` / `yookassa-webhook` и `payment_orders` / `user_passes`.

[FACT] WEB canon остаётся storefront-only и не считается канонической payment surface.

[FACT] Legacy user-facing subscription flows уже ослаблены или сняты, но admin surface всё ещё зависит от `subscriptions`.

[FACT] В обеих поверхностях есть живой admin path:
- `k-sebe-yoga-studioWEB/components/AdminPanel.tsx` монтирует `UsersTab`
- `k-sebe-yoga-studio-APPp/components/AdminPanel.tsx` монтирует `UsersTab`
- обе версии `UsersTab` читают `subscriptions`
- обе версии `UsersTab` открывают `SubscriptionEditor`
- обе версии `UsersTab` делают `upsert` обратно в `subscriptions`

[FACT] Tests в обеих поверхностях специально требуют, чтобы ошибки по `subscriptions` не скрывались silently.

[INTERP] Это уже не исторический хвост и не dead code. Это действующий admin/support path для legacy subscription state.

---

## Decision

- `Decision:` temporary admin bridge
- `Canonical payment model:` `payment_orders` / `user_passes`
- `Legacy admin bridge:` `UsersTab` + `SubscriptionEditor` + `subscriptions`
- `Owner:` admin/payment governance
- `Expiry condition:` admin users no longer need manual subscription editing to operate or support the product
- `Migration trigger:` a replacement admin workflow exists on top of `payment_orders` / `user_passes` or an explicit decision removes manual subscription control from operations
- `Rollback rule:` if an attempted admin migration removes needed support capability, restore the last known admin subscription-control path temporarily without changing canonical APP payment contour
- `Review date:` next admin-focused migration gate

---

## Why this is not retirement-ready yet

[FACT] AdminPanel still mounts the legacy subscription control surface in both WEB and APP.

[FACT] Admin users can still manually edit plan, status and period end for `subscriptions`.

[INTERP] Therefore the legacy admin surface must be treated as a temporary bridge, not as retirement-ready infrastructure.

---

## What must become true before retirement

- `UsersTab` no longer depends on `subscriptions`
- `SubscriptionEditor` is removed or replaced
- admin operators can do their job using only the canonical payment/pass model
- tests no longer protect `subscriptions`-based admin behavior as required functionality

---

## One-line Result

Result: admin subscription editing remains a temporary bridge until support operations no longer depend on `subscriptions` as an editable control surface.
