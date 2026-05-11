# Текущие задачи

> **Обновлено:** 11 мая 2026 | **Версия:** 5.1.0
> Источник истины: GitHub `main` + live Supabase metadata/advisors.
> Текущий режим: controlled production hardening. 11 мая 2026 были выполнены только узкие live-изменения с низким риском и они сразу записаны в `main`.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **25** | Supabase MCP `list_migrations` after 2026-05-11 hardening pass |
| Live Edge Functions | **9** | Supabase MCP `list_edge_functions` |
| Public/live tables | **27** | Supabase MCP schema inventory |
| 2026-05-11 new live migrations recorded in repo | **3** | committed to `supabase/migrations/` in `main` during this pass |
| Latest repo-stated tests | **489 / 64** | previous repo documentation; not re-run in this pass |
| Typecheck status | **last known PASS** | repo-stated, not freshly re-run now |
| Lint status | **last known PASS** | repo-stated, not freshly re-run now |
| Web/App builds | **last known PASS** | repo-stated, not freshly re-run now |

Главное изменение: production state больше не находится в точке старого security emergency around `profiles`. Этот контур закрыт. Текущий риск сместился в сторону release discipline: function naming drift, GraphQL discoverability, auth hardening, and missing final verification on repo head.

---

## ✅ Что уже закрыто

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Убрать dangerous `profiles` public drift | DONE | legacy `profiles` public policy / legacy `is_admin` drift были закрыты ранее и в этой сессии не resurfaced in advisors |
| 2 | Закрыть dead permissive AI insert policies | DONE | removed `ai_jobs_service_insert` and `api_logs_insert_service` |
| 3 | Закрыть unindexed FK findings on current AI + bookings path | DONE | added indexes for `ai_jobs`, `api_logs`, `bookings`, `prompt_requests` |
| 4 | Снизить RLS planner churn on hot self-access tables | DONE | initplan-friendly rewrites applied to `profiles`, `bookings`, `practice_events`, `user_preferences`, `app_events`, `subscriptions`, `user_progress`, `user_achievements`, `classes`, `retreats`, `user_push_tokens` |
| 5 | Сохранить live 2026-05-11 hardening steps в repo canon | DONE | 3 new migration files committed to `main` |

---

## 🔴 P0 — Оставшиеся launch blockers

| # | Задача | Статус | Почему это P0 |
| --- | --- | --- | --- |
| 6 | Разрешить function drift между repo и live | ⛔ | live keeps `ai-run` / `ai-embeddings`, repo still carries `create-yookassa-checkout` / `yookassa-webhook` |
| 7 | Прогнать финальный verification suite на текущем repo head | ⛔ | no fresh `lint` / `typecheck` / `test:run` / `build:web` / `build:app` in this pass |

---

## 🟠 P1 — Безопасность и управляемость

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 8 | Перепроверить GraphQL exposure | ⏳ | advisor still flags many `anon` / `authenticated` visible tables; some may be intentional public content, some may need narrowing |
| 9 | Включить leaked password protection | ⏳ | Supabase auth advisor still warns |
| 10 | Разобрать `vector` extension placement | ⏳ | security advisor still flags `vector` in `public` |
| 11 | Проверить storage bucket `images` как operational surface | ⏳ | earlier concern remains worth one explicit review even though it is not the current top warning |

---

## 🟡 P2 — Техническая чистка после релизного прохода

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 12 | Полностью reconcile older repo/live migration history | ⏳ | current pass recorded the new live mutations, but did not fully enumerate older drift |
| 13 | Regenerate `shared/types/database.types.ts` after accepted baseline | ⏳ | do this only after migration truth is intentionally settled |
| 14 | Reduce duplicate permissive policies on content/admin tables | ⏳ | still noisy on `app_settings`, `articles`, `reviews`, `site_images`, `subscriptions`, `user_push_tokens`, `videos`, others |
| 15 | Revisit unused-index noise after real traffic appears | ⏳ | current unused-index findings are not launch blockers on a near-empty dataset |

---

## Ближайший рабочий шаг

1. Fresh-run the repo verification suite on current `main`.
2. Decide canonical function surface for AI and YooKassa.
3. Enable leaked password protection in Supabase Auth.
4. Make an explicit call on GraphQL discoverability: accept public-content exposure or reduce grants for sensitive tables.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo documentation coherence | IMPROVED, not complete |
| Live Supabase governance | PARTIAL PASS |
| Function inventory clarity | FAIL |
| Local code health | UNKNOWN on current head |
| Overall launch readiness | **FAIL, but materially closer** |
