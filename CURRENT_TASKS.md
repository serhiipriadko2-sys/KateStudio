# Текущие задачи

> **Обновлено:** 16 мая 2026 | **Версия:** 5.5.0
> Источник истины: GitHub `main` + live Supabase metadata, SQL, advisors и recent logs.
> Текущий режим: doc-sync after live drift check. Этот файл больше не должен говорить так, будто live всё ещё не имеет APP payment surface.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **38** | Supabase `list_migrations` on 2026-05-16 reaches `20260516182944_yookassa_app_payments_live_cutover` |
| Live Edge Functions | **11** | Supabase `list_edge_functions` on 2026-05-16 |
| Live security advisors | **1 warning** | leaked password protection remains disabled |
| Live performance advisors | **warnings remain** | initplan + permissive-policy fan-out + unused indexes |
| Live APP payment tables | **present** | direct SQL confirms `payment_orders` and `user_passes` exist |
| Live APP payment traffic | **present** | recent logs show successful `create-yookassa-checkout`, `payment_orders`, `user_passes` activity |
| Live legacy payment pair | **still present** | `create-payment` and `payment-webhook` remain active |
| Live app-target payment pair | **present** | `create-yookassa-checkout` and `yookassa-webhook` are active |
| `site_images` live rows | **0** | direct SQL on 2026-05-16 |
| `app_settings` live keys | **3** | `opening_hours`, `studio_contacts`, `studio_profile` |
| Fresh green CI on current release path | **UNVERIFIED** | this pass did not obtain a fresh green current-main proof |
| Latest directly observed repo-side CI signal | **RED, but not current-main proof** | PR `#498` reports failing `AuthContext` test path |

Главное изменение по сравнению с canon от 12–13 мая 2026: live больше не находится в состоянии “repo wants app-only YooKassa, live does not”. Live уже содержит новые payment tables, новые APP-target functions и recent traffic on that path. Текущий риск сместился: теперь опаснее dual payment contour и отсутствие свежего green release proof, чем старый narrative про missing live payment surface.

---

## ✅ Что уже подтверждено

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Сохранить late-May live hardening в repo canon | DONE | late governance/security migrations are tracked in repo and live history |
| 2 | Убрать старый payment-gap narrative | DONE | live now has `payment_orders`, `user_passes`, `create-yookassa-checkout`, `yookassa-webhook` |
| 3 | Сузить security tail risk | DONE | only leaked password protection remains in security advisors |
| 4 | Сохранить WEB non-payment canon | DONE | docs still keep WEB as storefront-only surface |
| 5 | Подтвердить APP payment cutover in live | DONE | logs show successful live traffic through the app-target path |

---

## 🔴 P0 — Текущие launch blockers

| # | Задача | Статус | Почему это P0 |
| --- | --- | --- | --- |
| 6 | Разрешить dual payment contour | ⛔ | live currently exposes both legacy `create-payment` / `payment-webhook` and app-target `create-yookassa-checkout` / `yookassa-webhook`; canonical ownership and deprecation path are still not explicit |
| 7 | Получить fresh green CI на текущем release path | ⛔ | this pass did not verify a fresh green current-main run; latest directly observed repo-side signal is red, but it is not enough to stand in for current release proof |
| 8 | Включить leaked password protection в live Supabase Auth | ⛔ | the only remaining live security advisor warning is still the Auth toggle |

---

## 🟠 P1 — Runtime and governance follow-up

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 9 | Разобрать `app_settings` public reads outside `studio_contacts` | ⏳ | recent logs still show `401` on `key=eq.image_map` and `key=eq.theme` |
| 10 | Разобрать empty `site_images` dataset | ⏳ | table exists and reads return `200`, but row count is still `0` |
| 11 | Явно зафиксировать canonical AI contour | ⏳ | live keeps `ai-run` / `ai-embeddings` alongside `gemini-proxy` |
| 12 | Обновить stale operational docs and memory | ⏳ | 12–13 May canon still understates live payment/function state until doc-sync lands everywhere |

---

## 🟡 P2 — Техническая чистка после синхронизации baseline

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 13 | Полностью reconcile older repo/live migration history | ⏳ | baseline is stronger now, but one explicit historical parity pass still has value |
| 14 | Regenerate `shared/types/database.types.ts` after accepted baseline | ⏳ | do this once the reconciled schema baseline is intentionally accepted |
| 15 | Reduce permissive-policy fan-out and initplan noise | ⏳ | performance advisors still flag `payment_orders`, `user_passes`, `app_settings`, `site_images`, and other content tables |

---

## Ближайший рабочий шаг

1. Run a narrow release gate against the 2026-05-16 live baseline.
2. Prove a fresh green CI run on the current release path instead of relying on older red or branch-only evidence.
3. Decide canonical payment ownership: keep dual contour intentionally for a transition window or mark one pair as legacy and document retirement criteria.
4. Enable leaked password protection and verify the already-hardened auth UX against live behavior.
5. Triage the remaining runtime symptoms around `app_settings` and empty `site_images`.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo/live docs coherence | PARTIAL until all operational surfaces adopt the 2026-05-16 baseline |
| Live Supabase governance | STRONG PARTIAL PASS |
| Live payment surface | PRESENT, but dual-contour |
| Live security advisors | **1 warning remaining** |
| Public smoke signal | MIXED, narrower than before |
| Release-path CI | **UNVERIFIED fresh green** |
| Overall launch readiness | **FAIL** until dual contour + fresh green CI + auth toggle are resolved or explicitly accepted |