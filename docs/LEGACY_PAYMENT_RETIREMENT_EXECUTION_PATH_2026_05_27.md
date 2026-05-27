# Legacy Payment Retirement Execution Path | KateStudio

> **Date:** 27 May 2026
> **Author:** ChatGPT KateStudio agent
> **Repo ref:** `main`
> **Live project:** `qkaycdcbstjobacmuaro`
> **Mode:** `EXECUTION-PLANNING`
> **Rule:** read-first, no live mutation without explicit approval

---

## Scope

Этот execution path покрывает controlled live retirement для:
- `create-payment`
- `payment-webhook`
- `cancel-subscription`
- `subscriptions`-dependent surface

Canonical contour, который должен остаться после retirement:
- `create-yookassa-checkout`
- `yookassa-webhook`
- `payment_orders`
- `user_passes`

---

## Current baseline

[FACT] Repo governance уже фиксирует legacy contour как `retirement track`.

[FACT] APP runtime больше не читает legacy `subscriptions` и не использует legacy `subscriptionService`.

[FACT] WEB остаётся storefront-only и не считается канонической payment surface.

[FACT] Live legacy backend pair всё ещё задеплоен:
- `create-payment`
- `payment-webhook`
- `cancel-subscription`

[FACT] Current live evidence не показывает подтверждённого активного business use legacy path в последнем проверенном окне:
- `subscriptions` = `0` rows
- `payment_orders` has confirmed live activity
- `user_passes` has confirmed live activity
- inspected recent logs did not show fresh legacy invocations

[INTERP] Legacy contour выглядит как live backend tail, а не как текущий business path.

---

## Goal

Перевести legacy payment contour из `retirement track` в controlled retirement execution без скрытого product breakage и без неявного изменения canonical APP payment path.

---

## Go / No-Go before any live action

### GO only if all are true

- [ ] APP payment canon подтверждён: `create-yookassa-checkout` / `yookassa-webhook` / `payment_orders` / `user_passes`
- [ ] APP больше не читает `subscriptions`
- [ ] WEB не зависит от legacy checkout flow как от current release surface
- [ ] current docs фиксируют legacy contour как `retirement track`
- [ ] есть rollback note: legacy pair can be temporarily restored without changing APP payment canon

### NO-GO if any are true

- [ ] найден хоть один живой runtime dependency на `create-payment` или `payment-webhook`
- [ ] найден operational dependency на `cancel-subscription`
- [ ] найдены свежие legacy rows in `subscriptions`
- [ ] найдены fresh legacy function invocations in the validation window
- [ ] current APP payment contour не подтверждён как единственный active business path

---

## Controlled order

### Phase 0 — Pre-retirement evidence refresh

Read-only checks:
- re-check deployed Edge Function inventory
- re-check `subscriptions`, `payment_orders`, `user_passes`
- inspect recent logs for `create-payment`, `payment-webhook`, `cancel-subscription`
- verify repo search for any remaining client/runtime calls to legacy contour

PASS:
- no fresh business evidence for legacy contour
- no remaining repo/runtime dependency

FAIL:
- any new dependency or invocation appears

Stop condition:
- if FAIL, keep status at `retirement track` and do not disable anything

### Phase 1 — Freeze the retirement decision

Required artifacts before live change:
- retirement decision note exists
- this execution path exists
- docs index points to both artifacts

PASS:
- governance state is explicit and repo-tracked

FAIL:
- retirement intent still depends on chat context or memory only

### Phase 2 — Isolate `cancel-subscription`

Purpose:
- prove whether `cancel-subscription` is still needed as a user-facing or support-facing action

Read-only checks:
- search repo for `cancel-subscription`
- inspect support/admin flows that may still reference subscription cancellation
- verify no current APP or WEB screen exposes subscription cancellation as required UX

PASS:
- no active dependency remains on `cancel-subscription`

FAIL:
- any support, admin, or user-facing flow still relies on it

Rollback note:
- no live disable should start until this phase is PASS

### Phase 3 — Retire `create-payment`

Live action intent:
- disable or undeploy `create-payment` only after Phases 0-2 pass

Verification immediately after action:
- APP checkout still succeeds through `create-yookassa-checkout`
- no release surface attempts to call `create-payment`
- no new user-facing payment errors appear in the observation window

PASS:
- canonical APP payment path remains healthy
- no hidden consumer appears

FAIL:
- any client still calls `create-payment`
- payment initiation breaks for a real release surface

Rollback checkpoint:
- restore `create-payment` temporarily if any hidden caller appears

### Phase 4 — Retire `payment-webhook`

Live action intent:
- disable or undeploy `payment-webhook` only after `create-payment` retirement remains stable

Verification immediately after action:
- new canonical payments still complete end-to-end
- `payment_orders` and `user_passes` continue updating through canonical contour only
- no background process expects legacy webhook side effects

PASS:
- payment completion remains healthy through `yookassa-webhook`

FAIL:
- any fulfillment or status-update path still relied on legacy webhook behavior

Rollback checkpoint:
- restore `payment-webhook` temporarily if fulfillment regression appears

### Phase 5 — Move `subscriptions` to historical-only status

Purpose:
- stop treating `subscriptions` as active product state

Read-only plus governance checks:
- confirm zero active runtime reads remain
- confirm no support workflow requires writes to `subscriptions`
- decide whether table stays as history or enters later schema cleanup track

PASS:
- `subscriptions` no longer participates in current runtime semantics

FAIL:
- any remaining runtime or support dependency is found

Important:
- table cleanup is a separate future decision; retirement does not require immediate destructive schema change

---

## Removal order summary

1. refresh evidence
2. freeze repo-tracked retirement artifacts
3. prove `cancel-subscription` has no active dependency
4. retire `create-payment`
5. observe and verify
6. retire `payment-webhook`
7. observe and verify
8. mark `subscriptions` as historical-only
9. consider later schema cleanup separately

---

## Verification windows

Use a short explicit observation window after each live retirement step.

Minimum checks after each function retirement:
- current APP checkout starts successfully
- current APP payment completes successfully
- no unexpected errors in relevant function logs
- no new writes appear in `subscriptions`
- canonical tables continue behaving normally

If any check fails:
- stop
- restore the just-retired legacy function if needed
- keep canonical APP contour unchanged
- reopen dependency investigation

---

## Rollback rules

Rollback means only this:
- temporarily restore the just-retired legacy function that caused regression
- keep `create-yookassa-checkout` / `yookassa-webhook` as canonical contour
- do not revert APP back to legacy subscription semantics

Rollback does **not** mean:
- reclassifying legacy contour as primary
- reintroducing APP dependency on `subscriptions`
- undoing payment baseline governance

---

## PASS / FAIL for the execution path

### PASS

This execution path is ready if:
- retirement governance is repo-tracked
- no active dependency remains on `cancel-subscription`
- no active release surface depends on `create-payment` / `payment-webhook`
- rollback checkpoints are explicit
- canonical APP payment path can be verified independently

### FAIL

This execution path is not ready if:
- any hidden consumer of the legacy pair still exists
- retirement requires guessing instead of staged checks
- rollback is undefined
- `subscriptions` still acts as active product state

---

## One-line Result

Result: legacy payment contour can enter controlled live retirement only in staged order, with `cancel-subscription` proof first and rollback checkpoints after each function retirement.
