# Edge Functions Reference | KateStudio

> **Обновлено:** 16 июня 2026 | **Версия:** 3.3.0
> Source of truth for this file: GitHub branch `codex/security-retire-live-ai-cron-20260616` + live Supabase function inventory for project `qkaycdcbstjobacmuaro` after the 2026-06-16 security hardening deploy.

---

## 1. Current branch intent

This change-set reconciles the live Edge Function surface with repo-tracked intent without reopening the legacy AI contour:

| Function | Branch status | Intended behavior |
| --- | --- | --- |
| `ai-run` | present | retired-in-place stub; JWT required; returns controlled `410` for POST |
| `ai-embeddings` | present | retired-in-place stub; JWT required; returns controlled `410` for POST |
| `cron-maintenance` | present | custom bearer cron endpoint; fails closed if `CRON_SECRET` is missing or invalid |
| `gemini-proxy` | present | canonical supported AI contour |
| `create-yookassa-checkout` | present | canonical APP YooKassa checkout |
| `yookassa-webhook` | present | canonical APP YooKassa callback |
| `create-payment` | present | legacy payment stub |
| `payment-webhook` | present | legacy payment stub |
| `cancel-subscription` | present | legacy payment/subscription stub |
| `book-class-with-access` | present | authenticated APP booking/access wrapper |
| `send-push` | present | notifications |
| `subscribe-newsletter` | present | public marketing/signup path |

---

## 2. Live inventory after deploy

Live Supabase currently reports **12 active functions**:

| Function | JWT | Version | Live status |
| --- | --- | --- | --- |
| `ai-run` | true | 8 | ACTIVE, retired-in-place AI stub |
| `ai-embeddings` | true | 8 | ACTIVE, retired-in-place AI stub |
| `create-payment` | true | 7 | ACTIVE, retired-in-place payment stub |
| `payment-webhook` | false | 7 | ACTIVE, retired-in-place payment stub |
| `cancel-subscription` | true | 7 | ACTIVE, retired-in-place payment/subscription stub |
| `cron-maintenance` | false | 6 | ACTIVE, custom bearer auth, fail-closed on missing/invalid `CRON_SECRET` |
| `send-push` | false | 5 | ACTIVE |
| `subscribe-newsletter` | false | 5 | ACTIVE |
| `gemini-proxy` | true | 5 | ACTIVE, canonical supported AI contour |
| `create-yookassa-checkout` | true | 7 | ACTIVE, canonical APP payment path |
| `yookassa-webhook` | false | 5 | ACTIVE, signed webhook path |
| `book-class-with-access` | true | 7 | ACTIVE, authenticated APP access booking path |

---

## 3. Drift map

### Closed by this change-set

- `ai-run` is no longer a live-only source surface on this branch.
- `ai-embeddings` is no longer a live-only source surface on this branch.
- `cron-maintenance` no longer has the old fail-open behavior when `CRON_SECRET` is absent.

### Still true until merge

- `main` is not reconciled until this branch is merged.
- Full release PASS still requires a fresh green CI/release receipt for this branch or the post-merge SHA.

---

## 4. Operational rules

1. Treat `gemini-proxy` as the only supported AI operation path.
2. Treat `ai-run` and `ai-embeddings` as compatibility stubs only, not product features.
3. Do not reintroduce service-role AI writes from user-controlled payloads without a new design review.
4. Keep `cron-maintenance` with `verify_jwt=false` only because it has custom bearer auth and is called by scheduled infrastructure.
5. Never allow `cron-maintenance` to run privileged tasks when `CRON_SECRET` is missing.
6. Keep APP payment ownership on `create-yookassa-checkout` + `yookassa-webhook`.
7. Do not use historical late-May function counts as present-tense truth.

---

## 5. Release implication

Current security posture improved from the previous FAIL gate, but release status remains **PARTIAL** until:

1. the branch has fresh green CI;
2. the branch is merged or otherwise promoted intentionally;
3. the final release receipt is attached to the exact promoted SHA.
