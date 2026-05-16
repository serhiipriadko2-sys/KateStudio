# Edge Functions Reference | KateStudio

> **Обновлено:** 16 мая 2026 | **Версия:** 3.2.0
> Ниже разделены repo inventory и live inventory. Их смешивать по-прежнему нельзя, но stale claim про missing APP payment pair в live больше недопустим.

---

## 1. Repo inventory

В `supabase/functions/` на `main` сейчас находятся **9** function folders:

| Function | Repo status | Notes |
| --- | --- | --- |
| `cancel-subscription` | present | operational / non-AI |
| `create-payment` | present | legacy/shared payment flow |
| `create-yookassa-checkout` | present | app-target YooKassa checkout |
| `cron-maintenance` | present | ops |
| `gemini-proxy` | present | repo AI contour |
| `payment-webhook` | present | legacy/shared payment callback |
| `send-push` | present | notifications |
| `subscribe-newsletter` | present | public marketing/signup path |
| `yookassa-webhook` | present | app-target YooKassa callback |

---

## 2. Live inventory

Live Supabase project `qkaycdcbstjobacmuaro` currently reports **11 active functions**:

| Function | JWT | Version | Live status |
| --- | --- | --- | --- |
| `ai-run` | true | 7 | ACTIVE |
| `ai-embeddings` | true | 7 | ACTIVE |
| `create-payment` | true | 5 | ACTIVE |
| `payment-webhook` | false | 5 | ACTIVE |
| `cancel-subscription` | true | 5 | ACTIVE |
| `cron-maintenance` | false | 5 | ACTIVE |
| `send-push` | false | 5 | ACTIVE |
| `subscribe-newsletter` | false | 5 | ACTIVE |
| `gemini-proxy` | true | 5 | ACTIVE |
| `create-yookassa-checkout` | true | 7 | ACTIVE |
| `yookassa-webhook` | false | 5 | ACTIVE |

---

## 3. Drift map

### Present in both repo and live

- `cancel-subscription`
- `create-payment`
- `create-yookassa-checkout`
- `cron-maintenance`
- `gemini-proxy`
- `payment-webhook`
- `send-push`
- `subscribe-newsletter`
- `yookassa-webhook`

### Live-only

- `ai-run`
- `ai-embeddings`

### Repo-only

- none on the payment surface

---

## 4. Meaning of the drift

The key drift changed shape.

Old framing that is now stale:
- repo has the APP YooKassa pair but live does not.

Current framing:
- live has **both** the legacy shared payment pair (`create-payment`, `payment-webhook`) and the app-target pair (`create-yookassa-checkout`, `yookassa-webhook`)
- repo still documents APP as the intended YooKassa payment surface
- live AI and repo AI contours are still not identical because `ai-run` and `ai-embeddings` remain live-only

So the real payment problem is no longer missing deployment. The real problem is dual payment contour governance: which pair is canonical now, how long both may coexist, and what retirement rule applies to the legacy pair.

---

## 5. Operational rules

1. Do not assume a repo folder means a live endpoint exists.
2. Do not assume a live endpoint is represented one-to-one by repo naming.
3. Do not claim that live lacks `create-yookassa-checkout` or `yookassa-webhook`; that statement is now stale.
4. Payment docs must distinguish between legacy live payment endpoints and app-target live payment endpoints.
5. WEB should remain on Telegram / lead-form onboarding unless the business operating model changes explicitly.
6. APP payment work should treat dual-contour ownership as the active governance risk until one pair is clearly marked primary and the other is either transitional or retired.
7. AI changes still require an explicit decision because live AI and repo AI shapes are not identical.

---

## 6. Documentation correction

Current truth:

- repo functions: **9**
- live functions: **11**
- APP-target payment pair: **present in both repo and live**
- legacy payment pair: **still live**
- inventories: **not identical overall because of live-only AI functions**
- business canon: WEB non-payment, APP payment, RuStore publication/proof layer

That means operational docs must no longer speak as if the APP payment pair is still repo-only.

---

## 7. Next verification step

Before any function-level refactor or retirement:

1. keep WEB on Telegram / lead-form onboarding only,
2. obtain fresh release-path CI proof,
3. decide whether the dual payment contour is an accepted transition window or an unwanted overlap,
4. if transition is accepted, document expiry criteria for the legacy pair,
5. if transition is not accepted, prepare a controlled retirement path for `create-payment` / `payment-webhook`,
6. decide whether `ai-run` / `ai-embeddings` remain canonical or transitional beside `gemini-proxy`.