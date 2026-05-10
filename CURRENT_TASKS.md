# Текущие задачи

> **Обновлено:** 10 мая 2026 | **Версия:** 5.0.0
> Источник истины: GitHub `main` + live Supabase metadata/advisors.
> Текущий режим: audit-first governance. Production mutation без отдельного разрешения не выполнялась.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Repo migrations | **42** | дерево `supabase/migrations` в `main` |
| Live applied migrations | **14** | Supabase MCP `list_migrations` |
| Repo Edge Functions | **9** | дерево `supabase/functions` в `main` |
| Live Edge Functions | **9** | Supabase MCP `list_edge_functions` |
| Public/live tables | **27** | Supabase MCP schema inventory |
| Latest repo-stated tests | **489 / 64** | `CURRENT_TASKS.md` в репозитории от 2026-05-02 |
| Typecheck status | **repo-stated PASS** | `CURRENT_TASKS.md` / `LAUNCH_CHECKLIST.md` |
| Lint status | **repo-stated PASS** | `CURRENT_TASKS.md` / `LAUNCH_CHECKLIST.md` |
| Web/App builds | **repo-stated PASS** | `CURRENT_TASKS.md` / `LAUNCH_CHECKLIST.md` |

Ключевое изменение относительно майского канона: live больше не равен снимку "2 функции / 12 миграций". На 10 мая 2026 live уже содержит 9 функций и 14 applied migrations, но production governance по-прежнему не сведена к одному воспроизводимому baseline.

---

## 🔴 P0 — Блокеры рабочего канона

| # | Задача | Статус | Почему это P0 |
| --- | --- | --- | --- |
| 1 | Убрать public policy `Allow public read/write profiles` | ⛔ | Policy всё ещё `ALL` с `USING true` и `WITH CHECK true` |
| 2 | Свести repo/live migration truth к воспроизводимому baseline | ⛔ | Repo: 42 SQL files, live: 14 applied migrations |
| 3 | Разрешить function drift между repo и live | ⛔ | Repo-only: `create-yookassa-checkout`, `yookassa-webhook`; live-only: `ai-run`, `ai-embeddings` |
| 4 | Зафиксировать admin/data contract вокруг `profiles` | ⛔ | Live `profiles` всё ещё содержит legacy `is_admin`; patch path подготовлен, но не подтверждён в staging |

---

## 🟠 P1 — Безопасность и управляемость

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 5 | Закрыть `dialogue` ambiguity | ⏳ | RLS enabled, policies отсутствуют |
| 6 | Pin `search_path` и пересмотреть executable functions | ⏳ | Advisors flag `is_admin`, `set_updated_at`, `touch_push_token_updated_at`, `trigger_set_timestamp`, `get_admin_analytics` |
| 7 | Harden storage bucket `images` | ⏳ | broad listing policy, нет MIME allowlist/size limit live |
| 8 | Перепроверить GraphQL exposure | ⏳ | Many tables discoverable by `anon` / `authenticated` |
| 9 | Включить leaked password protection | ⏳ | Supabase advisor still warns |

---

## 🟡 P2 — Контракты и производительность

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 10 | Regenerate `shared/types/database.types.ts` после schema reconciliation | ⏳ | Current file частично patched, но не auto-generated from current live truth |
| 11 | Закрыть unindexed FK findings | ⏳ | `ai_jobs`, `api_logs`, `bookings`, `prompt_requests` |
| 12 | Свести duplicate permissive policies | ⏳ | `reviews`, `site_images`, `subscriptions`, `user_push_tokens`, `videos`, others |
| 13 | Перевести RLS auth calls на initplan-friendly form | ⏳ | repeated `auth.uid()` / auth helpers in policies |
| 14 | Разобрать large bundle warning | ⏳ | latest repo docs still mention Vite large chunk warning |

---

## 🔵 P3 — Product / domain expansion

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 15 | Довести trainers domain до полного operational docs coverage | 🔄 | live уже содержит `trainers`, repo получил trainer migrations 2026-05-09/10 |
| 16 | Уточнить платежный contour | 🔄 | repo теперь содержит legacy/new YooKassa function names одновременно |
| 17 | Перевести старые audit docs в historical status | 🔄 | рабочий канон устарел быстрее, чем архив был промаркирован |

---

## Что изменилось с 2026-05-02

- Live applied migrations: `12 → 14`.
- Live Edge Functions: `2 → 9`.
- Repo migrations: `37 → 42`.
- Repo functions: `7 → 9`.
- Live database now includes active `trainers` domain objects and `classes.trainer_id`.
- Главный риск сместился: это уже не "ничего не развернуто", а "частично развернуто, но канон кода, миграций и live inventory расходится".

---

## Ближайший рабочий шаг

1. Подготовить approved non-production target.
2. Сравнить repo SQL baseline против live 14-applied state.
3. Проверить catch-up migration path для `profiles` / admin boundary.
4. Отдельно принять решение по AI/YooKassa function naming split.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo documentation coherence | FAIL |
| Live Supabase governance | FAIL |
| Function inventory clarity | FAIL |
| Local code health | LAST KNOWN PASS, not re-run in this audit |
| Overall launch readiness | **FAIL** |
