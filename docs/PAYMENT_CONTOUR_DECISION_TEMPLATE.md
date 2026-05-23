# Payment Contour Decision Template

> Назначение: зафиксировать одно явное решение по dual payment contour в KateStudio.

---

## Header

- `Date:`
- `Author:`
- `Repo ref:`
- `Live project:` `qkaycdcbstjobacmuaro`
- `Mode:` `GOVERNANCE`

---

## Context

[FACT] Live currently exposes both:
- legacy pair: `create-payment` / `payment-webhook`
- app-target pair: `create-yookassa-checkout` / `yookassa-webhook`

[FACT] Repo and current docs treat APP payment as the intended business direction.

[INTERP] A release decision requires explicit contour ownership, not silent coexistence.

---

## Decision Options

### Option A — Transitional dual contour

Use when:
- legacy flow still serves a real dependency;
- immediate retirement is unsafe.

Required fields:
- `Decision:` transitional dual contour
- `Primary contour:`
- `Secondary contour:`
- `Owner of primary contour:`
- `Owner of secondary contour:`
- `Expiry criteria:`
- `Review date:`
- `Retirement trigger:`
- `Rollback rule:`

### Option B — Legacy retirement path

Use when:
- legacy contour is no longer needed by any release surface.

Required fields:
- `Decision:` legacy retirement
- `Canonical contour:`
- `Retiring contour:`
- `Pre-retirement proof:`
- `Removal order:`
- `Rollback path:`
- `Owner:`
- `Review date:`

---

## Evidence

- `Repo evidence:`
- `Live function evidence:`
- `Client/runtime dependency evidence:`
- `Release risk:`

---

## Final Decision

- `Selected option:`
- `Why this option:`
- `Why the rejected option is not chosen now:`

---

## One-line Result

Use exactly one ending sentence:
- `Result: dual contour is intentionally transitional until <condition>.`
or
- `Result: legacy contour enters retirement path after <proof>.`