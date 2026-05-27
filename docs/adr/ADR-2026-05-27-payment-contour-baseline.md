# ADR: Payment Contour Baseline | KateStudio

> **Date:** 27 May 2026
> **Status:** accepted as current review and release baseline
> **Scope:** payment governance, release alignment, security review baseline

---

## 1. Context

KateStudio currently exposes two payment contours in the broader system picture.

### APP-oriented contour

- `create-yookassa-checkout`
- `yookassa-webhook`
- `payment_orders`
- `user_passes`

### Legacy contour

- `create-payment`
- `payment-webhook`
- `subscriptions`

Operationally, product intent and APP behavior indicate that `WEB` serves as a storefront and onboarding surface, while `APP` serves as the real payment surface.

Without an explicit decision, release review, rollback reasoning, support statements, and security review remain vulnerable to payment-contour ambiguity.

---

## 2. Decision

KateStudio adopts the following payment baseline:

- `WEB` is a storefront-only surface.
- `WEB` is not the canonical checkout surface.
- `APP` is the canonical real-payment surface.
- The primary APP payment contour is:
  - `create-yookassa-checkout`
  - `yookassa-webhook`
  - `payment_orders`
  - `user_passes`
- The legacy contour remains secondary and transitional until a separate retirement or coexistence decision closes it explicitly.

---

## 3. Canonical operational wording

Use this wording in release, docs, and support contexts:

> KateStudio uses WEB as a storefront and APP as the canonical real-payment surface.
> Legacy payment functions may remain live temporarily, but they do not redefine the primary contour.

---

## 4. Consequences

### Accepted consequences

- Payment reviews should evaluate APP as the primary payment path.
- `WEB` must not be described as a direct payment surface unless a later ADR changes that rule.
- Legacy payment presence in live does not by itself redefine product canon.

### Governance consequences

- Release gates should treat payment ambiguity as reduced only when this baseline is the active review frame.
- Security review should assess whether legacy contour retention is justified, bounded, and documented.
- Rollback language must not imply that `WEB` becomes canonical checkout by default.

---

## 5. Review and retirement rule

- Review trigger: next payment-focused release gate or explicit payment hardening cycle.
- Retirement-ready signal: APP contour is fully accepted as the sole operational payment path and there is no remaining business dependency on the legacy subscriptions-based contour.
- If coexistence must continue, the legacy contour must stay explicitly labeled as secondary.

---

## 6. PASS / FAIL criteria

### PASS

Repo docs explicitly define:

- `WEB` storefront-only role
- `APP` canonical payment role
- primary contour
- secondary contour
- review or retirement rule
- rollback framing

### FAIL

- Payment remains described only informally.
- `WEB` and `APP` roles remain ambiguous.
- Legacy and APP contours remain live without explicit status.

---

## 7. Notes

This ADR is a governance artifact only.
It does not deploy, retire, or modify any live function by itself.
