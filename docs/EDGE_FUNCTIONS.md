# Edge Functions Reference | KateStudio

> **Обновлено:** 12 мая 2026 | **Версия:** 3.1.0
> Ниже разделены repo inventory и live inventory. Их смешивать больше нельзя.

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

Live Supabase project `qkaycdcbstjobacmuaro` currently reports **9 active functions**:

| Function | JWT | Version | Live status |
| --- | --- | --- | --- |
| `ai-run` | true | 4 | ACTIVE |
| `ai-embeddings` | true | 4 | ACTIVE |
| `create-payment` | true | 2 | ACTIVE |
| `payment-webhook` | false | 2 | ACTIVE |
| `cancel-subscription` | true | 2 | ACTIVE |
| `cron-maintenance` | false | 2 | ACTIVE |
| `send-push` | false | 2 | ACTIVE |
| `subscribe-newsletter` | false | 2 | ACTIVE |
| `gemini-proxy` | true | 2 | ACTIVE |

---

## 3. Drift map

### Present in both repo and live

- `create-payment`
- `payment-webhook`
- `cancel-subscription`
- `cron-maintenance`
- `send-push`
- `subscribe-newsletter`
- `gemini-proxy`

### Live-only

- `ai-run`
- `ai-embeddings`

### Repo-only

- `create-yookassa-checkout`
- `yookassa-webhook`

---

## 4. Meaning of the drift

The function split is no longer just a deployment lag. The business model is now explicit:

- WEB is storefront-only and should not be treated as a direct payment surface.
- APP is the intended YooKassa payment surface for approved users.
- live still exposes the older shared payment pair (`create-payment`, `payment-webhook`).
- repo carries the app-target pair (`create-yookassa-checkout`, `yookassa-webhook`) that is not yet deployed live.

So the real problem is not "which name sounds better". The real problem is that the app-only payment canon is decided at the business level, but not yet promoted to live backend truth.

---

## 5. Operational rules

1. Do not assume a repo folder means a live endpoint exists.
2. Do not assume a live endpoint is represented one-to-one by repo naming.
3. AI changes require an explicit decision because live AI and repo AI shapes are not identical.
4. Payment docs must distinguish active live payment endpoints from repo-only YooKassa variants.
5. WEB should not gain a direct checkout path unless the business operating model is explicitly changed.
6. APP payment work should treat `create-yookassa-checkout` + `yookassa-webhook` as the target pair, but not as live canon until migration + deploy evidence exists.

---

## 6. Documentation correction

Older docs that imply WEB is a direct payment surface are now incorrect.

Current truth:

- repo functions: **9**
- live functions: **9**
- inventories: **not identical**
- business canon: WEB non-payment, APP payment, RuStore publication/proof layer

---

## 7. Next verification step

Before any function-level refactor or deployment:

1. keep WEB on Telegram / lead-form onboarding only,
2. map APP callers to `create-yookassa-checkout`,
3. deploy the app-target YooKassa pair only together with the required schema,
4. keep `create-payment` / `payment-webhook` documented as legacy/shared live paths until cutover is complete,
5. decide whether `ai-run` / `ai-embeddings` remain canonical or are transitional beside `gemini-proxy`.
