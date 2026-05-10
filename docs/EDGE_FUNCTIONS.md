# Edge Functions Reference | KateStudio

> **Обновлено:** 10 мая 2026 | **Версия:** 3.0.0
> Ниже разделены repo inventory и live inventory. Их смешивать больше нельзя.

---

## 1. Repo inventory

В `supabase/functions/` на `main` сейчас находятся **9** function folders:

| Function | Repo status | Notes |
| --- | --- | --- |
| `cancel-subscription` | present | operational / non-AI |
| `create-payment` | present | payment flow |
| `create-yookassa-checkout` | present | payment naming split / legacy-or-alt path |
| `cron-maintenance` | present | ops |
| `gemini-proxy` | present | repo AI contour |
| `payment-webhook` | present | payment callback |
| `send-push` | present | notifications |
| `subscribe-newsletter` | present | public marketing/signup path |
| `yookassa-webhook` | present | payment naming split / legacy-or-alt path |

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

This is no longer the old state where repo functions simply were not deployed. The current state is more subtle:

- live has the repo non-AI deployment wave;
- live also keeps a separate AI contour (`ai-run`, `ai-embeddings`);
- repo still carries two YooKassa-named functions that do not appear in live inventory.

So the problem is not "deployment absent", but "operational function canon is ambiguous".

---

## 5. Operational rules

1. Do not assume a repo folder means a live endpoint exists.
2. Do not assume a live endpoint is represented one-to-one by repo naming.
3. AI changes require an explicit decision because live AI and repo AI shapes are not identical.
4. Payment docs must distinguish active live payment endpoints from repo-only YooKassa variants.

---

## 6. Documentation correction

Older docs that say "repo 7 / live 2" are now outdated.

Current truth:

- repo functions: **9**
- live functions: **9**
- inventories: **not identical**

---

## 7. Next verification step

Before any function-level refactor or deployment:

1. map each client caller to concrete endpoint names,
2. map each secret contract to the currently active live function,
3. decide whether `ai-run` / `ai-embeddings` remain canonical or are transitional beside `gemini-proxy`,
4. decide whether `create-yookassa-checkout` / `yookassa-webhook` are historical debris or planned replacements.
