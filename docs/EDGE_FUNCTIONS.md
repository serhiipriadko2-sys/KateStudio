# Edge Functions Reference | KateStudio

> **Обновлено:** 28 мая 2026 | **Версия:** 3.2.3
> Ниже разделены repo inventory и live inventory. Их смешивать по-прежнему нельзя.
> APP-target YooKassa pair is live and canonical; legacy trio remains deployed
> only as retired-in-place stubs.

---

## 1. Repo inventory

В `supabase/functions/` на `main` сейчас находятся **9** function folders:

| Function | Repo status | Notes |
| --- | --- | --- |
| `cancel-subscription` | present | retired-in-place stub |
| `create-payment` | present | retired-in-place stub |
| `create-yookassa-checkout` | present | app-target YooKassa checkout |
| `cron-maintenance` | present | ops |
| `gemini-proxy` | present | repo AI contour |
| `payment-webhook` | present | retired-in-place stub |
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
| `create-payment` | true | 7 | ACTIVE, retired-in-place stub |
| `payment-webhook` | false | 6 | ACTIVE, retired-in-place stub |
| `cancel-subscription` | true | 7 | ACTIVE, retired-in-place stub |
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

The key payment drift changed shape again.

Old framing that is now stale:
- live had an active dual payment contour that was still operationally open.

Current framing:
- app-target pair (`create-yookassa-checkout`, `yookassa-webhook`) remains the only canonical live payment path;
- legacy trio (`create-payment`, `payment-webhook`, `cancel-subscription`) remains deployed only as retired-in-place stubs returning controlled retirement responses;
- live AI and repo AI contours are still not identical because `ai-run` and `ai-embeddings` remain live-only;
- fresh release-path green CI after the final retirement sync is still unverified.

So the payment problem is no longer contour ambiguity. The remaining release truth gap is now **fresh post-retirement release verification**, not active dual payment ownership.

---

## 5. Operational rules

1. Do not assume a repo folder means a live endpoint is still operational in the old business sense.
2. Do not assume a deployed live endpoint is intended for continued product use.
3. Do not describe the app-target YooKassa pair as repo-only or not-yet-live; that wording is stale.
4. Do not describe the legacy trio as active transitional payment surfaces; they are now retired in place.
5. WEB should remain on Telegram / lead-form onboarding unless the business operating model changes explicitly.
6. APP payment work should treat `create-yookassa-checkout` + `yookassa-webhook` as the canonical live contour.
7. Do not present function-side retirement as full launch proof until a fresh green release-path CI run is actually verified.
8. AI changes still require an explicit decision because live AI and repo AI shapes are not identical.

---

## 6. Documentation correction

Current truth:

- repo functions: **9**
- live functions: **11**
- APP-target payment pair: **present in both repo and live**
- legacy payment trio: **present in both repo and live, but retired in place**
- inventories: **not identical overall because of live-only AI functions**
- business canon: WEB non-payment, APP payment, RuStore publication/proof layer

That means operational docs must no longer speak as if the live payment problem is an unresolved dual contour.

---

## 7. Next verification step

After the retired-in-place sync:

1. keep WEB on Telegram / lead-form onboarding only,
2. obtain fresh release-path CI proof,
3. rebuild the release gate on the post-retirement canon,
4. decide whether `ai-run` / `ai-embeddings` remain canonical or transitional beside `gemini-proxy`.
