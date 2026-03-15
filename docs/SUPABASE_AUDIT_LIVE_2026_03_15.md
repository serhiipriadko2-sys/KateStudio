# Аудит внутри Supabase | KateStudio | qkaycdcbstjobacmuaro

> **Дата:** 15 марта 2026
> **Проект:** kate · eu-central-1 · PostgreSQL 17.6.1 · ACTIVE_HEALTHY
> **Метод:** прямые SQL-запросы + Supabase MCP API (live данные)
> **Версия документа:** 1.0.0
> **Примечание sync (15 марта 2026):** количество SQL-файлов в репо обновлено до 35 после переноса checklist-скрипта из `supabase/migrations/`.

---

## 0) Snapshot проекта

| Параметр | Значение |
| --- | --- |
| Project ID | `qkaycdcbstjobacmuaro` |
| Название | kate |
| Регион | eu-central-1 |
| PostgreSQL | 17.6.1 (release channel: ga) |
| Статус | ACTIVE_HEALTHY |
| Таблиц в схеме `public` | **27** |
| Auth users | **2** (15 фев – 22 фев 2026) |
| Admins (в таблице) | **2** |
| Contacts (форм) | **11** |
| Analytics events | **914** |
| Embeddings data | **1.6 MB** (vector, реальные данные) |
| Applied migrations | **12** (из 35 SQL-файлов в репо) |
| Deployed Edge Functions | **2** (`ai-run`, `ai-embeddings`) |

---

## 1) КРИТИЧЕСКИЕ НАХОДКИ (P0)

### 🔴 C1 — `profiles` полностью открыта для чтения и записи анонимами

**Активная политика:**
```sql
policyname : "Allow public read/write profiles"
cmd        : ALL
roles      : {public}      -- включает anonymous
qual       : true          -- USING (true)
with_check : true          -- WITH CHECK (true)
```

**Механика:** PostgreSQL применяет permissive политики через OR. Одна открытая `ALL (true/true)` делает все остальные 7 политик на `profiles` нерелевантными — всегда побеждает самая разрешающая.

**Последствие:** Любой неавторизованный посетитель может:
- `SELECT` — читать все телефоны, имена, города всех пользователей
- `INSERT` — создавать произвольные профили
- `UPDATE` — изменять любой профиль, в том числе `SET is_admin = true`
- `DELETE` — удалять любой профиль

**Усугубляющий фактор:** Колонка `profiles.is_admin boolean default false` по-прежнему существует.
Через открытую политику анонимный пользователь может выполнить:
```sql
UPDATE profiles SET is_admin = true WHERE user_id = '<target>';
```
Если любой код читает `profiles.is_admin` вместо `admins` таблицы — это путь к эскалации привилегий.

**Статус:** 🔴 Производственная безопасность нарушена.

**Fix:**
```sql
DROP POLICY "Allow public read/write profiles" ON public.profiles;
```
Убедиться, что оставшиеся 7 политик покрывают все легитимные операции перед удалением.

---

### 🔴 C2 — Edge Functions: полное расхождение repo ↔ live

**Задеплоено в live:**

| Slug | Version | Status | В репозитории? |
| --- | --- | --- | --- |
| `ai-run` | 3 | ACTIVE | ❌ отсутствует |
| `ai-embeddings` | 3 | ACTIVE | ❌ отсутствует |

**Описано в репозитории (7 функций) — ни одна не задеплоена:**

| Slug | Назначение | Live? |
| --- | --- | --- |
| `gemini-proxy` | AI proxy | ❌ |
| `create-payment` | YooKassa платежи | ❌ |
| `payment-webhook` | HMAC webhook | ❌ |
| `cancel-subscription` | Отмена подписки | ❌ |
| `cron-maintenance` | Обслуживание БД | ❌ |
| `send-push` | FCM push | ❌ |
| `subscribe-newsletter` | Mailchimp | ❌ |

**Вывод:** Живой Supabase и репозиторий — два разных AI-проекта. Подписки, платежи, push-уведомления, рассылка — ни одна Edge Function не работает. Реальный AI реализован через `ai-run` / `ai-embeddings`, которые в репозитории отсутствуют.

---

### 🔴 C3 — Migration drift: 12 из 35 / schema вне контроля версий

**Реально применённые миграции (12):**

| Version | Name |
| --- | --- |
| 20260216191805 | analytics_events |
| 20260216193332 | gamification_schema |
| 20260221151544 | videos_table |
| 20260226185013 | create_app_settings |
| 20260312193045 | reviews_table |
| 20260312193101 | pricing_plans_table |
| 20260312193110 | faq_items_table |
| 20260312193115 | site_images_table |
| 20260312193118 | user_push_tokens_table |
| 20260315114042 | retreats_table |
| 20260315114218 | admin_subscriptions_rls |
| 20260315114222 | analytics_rpc |

**Первая применённая миграция:** `20260216` — февраль 2026.

Всё, что создано до этого (`profiles`, `bookings`, `subscriptions`, `classes`, `contacts`,
`admins`, `articles`, `app_settings`, все RLS политики на них) — **создано вручную через SQL Editor**,
вне системы миграций Supabase CLI.

**Репозиторий содержит 35 SQL-файлов в `supabase/migrations/`**, но их timestamps
(начиная с `20251227`) не совпадают с тем, что применено в БД.

**Опасность:** `supabase db reset` уничтожит всю ручную схему и данные.
Из 27 таблиц воссоздастся только 12. Репозиторий **не описывает** полное
состояние production базы данных.

---

### 🔴 C4 — 6 теневых таблиц в live DB, отсутствующих в репозитории

| Таблица | Размер | Описание | Migration | В репо |
| --- | --- | --- | --- | --- |
| `model_metadata` | 16 kB | Каталог AI-моделей | ❌ нет | ❌ |
| `prompt_requests` | 40 kB | Лог AI-запросов (`ai-run`) | ❌ нет | ❌ |
| `embeddings` | **1.6 MB** | Vector embeddings (pgvector) | ❌ нет | ❌ |
| `ai_jobs` | 24 kB | AI job queue (`ai-run`) | ❌ нет | ❌ |
| `api_logs` | 16 kB | Лог API вызовов | ❌ нет | ❌ |
| `dialogue` | 8 kB | Неизвестное назначение | ❌ нет | ❌ |

`embeddings` содержит **реальные production данные (1.6 MB)** — функция `ai-embeddings`
работала и записывала векторы. Эти данные существуют вне git-контроля и вне backup-стратегии репозитория.

---

### 🔴 C5 — `dialogue`: RLS включён, политик нет → полная недоступность

```text
rls_enabled : true
policies    : 0  (ZERO)
```

PostgreSQL при включённом RLS и отсутствии политик запрещает все операции.
Таблица создана, но полностью нефункциональна. Назначение неизвестно.
Это либо незавершённая реализация, либо артефакт ручных экспериментов.

---

## 2) ВЫСОКИЕ НАХОДКИ (P1)

### 🟠 H1 — Дублирующие и конфликтующие RLS-политики

PostgreSQL оценивает permissive политики через OR — если хоть одна разрешает,
доступ открыт. Дублирование создаёт ложное ощущение защиты и замедляет планировщик.

**`profiles` — 8 политик:**

| Политика | Cmd | Qual | Проблема |
| --- | --- | --- | --- |
| `Allow public read/write profiles` | ALL | `true / true` | 🔴 ОТКРЫТАЯ, перекрывает всё |
| `Admin can read all profiles` | SELECT | `is_admin()` | дубль (нерелевантна из-за выше) |
| `Users can insert own profile` | INSERT | `uid = user_id` | дубль |
| `Users can update own profile` | UPDATE | `uid = user_id` | дубль |
| `Users can view own profile` | SELECT | `uid = user_id` | дубль |
| `profiles_insert_own` | INSERT | `uid = user_id` | дубль второго набора |
| `profiles_select_own` | SELECT | `uid = user_id` | дубль второго набора |
| `profiles_update_own` | UPDATE | `uid = user_id` | дубль второго набора |

**`bookings` — 8 политик (два полных набора):**

Старый набор (`Users can *`) + новый (`bookings_*`). Оба активны одновременно,
каждый запрос проверяет все 8 политик.

**`app_settings` — 4 политики:**

- 2× SELECT public (`Enable read` + `Allow public read`) — дубли
- 2× ALL admin (`Enable write` + `Allow admin write`) — дубли

---

### 🟠 H2 — `is_admin()` и другие функции: mutable search_path

```sql
is_admin()              : security_type = INVOKER, config = null
get_admin_analytics()   : security_type = DEFINER, config = null
set_updated_at()        : security_type = INVOKER, config = null
touch_push_token_updated_at() : security_type = INVOKER, config = null
trigger_set_timestamp() : security_type = INVOKER, config = null
```

Функции без зафиксированного `search_path` уязвимы к path injection атаке:
специально сконструированный `search_path` может направить вызов к таблице `admins`
в другой схеме под контролем атакующего.

Пример правильной конфигурации (как у `rls_auto_enable`):
```sql
ALTER FUNCTION public.is_admin()
  SECURITY DEFINER
  SET search_path = public, pg_catalog;
```

---

### 🟠 H3 — `images` bucket без ограничений типа и размера

```text
name              : images
public            : true
allowed_mime_types: null   -- любой тип файла
file_size_limit   : null   -- любой размер
```

Любой пользователь может загрузить файл любого типа и размера.
При отсутствии MIME-фильтра — включая HTML, JS, исполняемые файлы.

**Fix:**
```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'],
    file_size_limit    = 5242880  -- 5 MB
WHERE name = 'images';
```

---

### 🟠 H4 — `interf`: неизвестный приватный bucket

```text
name       : interf
public     : false
created_at : 2025-12-10   -- день создания проекта
mime_types : null
size_limit : null
```

Создан в первый день существования проекта. Не упоминается ни в одном файле
репозитория. Назначение неизвестно. Требует решения: удалить или задокументировать.

---

### 🟠 H5 — `analytics_events` INSERT полностью открыт (anon + authenticated)

```sql
policy    : "Allow public insert to analytics"
cmd       : INSERT
roles     : {anon, authenticated}
with_check: true
```

Любой анонимный посетитель может вставлять произвольные события без ограничений.
Нет `user_id` привязки, нет rate limiting на уровне RLS. Таблица уже содержит 914 событий.

---

### 🟠 H6 — Leaked Password Protection отключён

Supabase Auth не проверяет пароли через HaveIBeenPwned.
Пользователи могут регистрироваться с известными скомпрометированными паролями.
Включается в: Dashboard → Authentication → Settings → Password Security.

---

## 3) СРЕДНИЕ НАХОДКИ (P2)

### 🟡 M1 — `profiles.is_admin` колонка не удалена

```sql
is_admin boolean default false   -- присутствует в live схеме
```

После переноса admin boundary в таблицу `admins` эта колонка стала legacy.
В сочетании с C1 (открытая политика) — вектор для эскалации привилегий.
Требует: `ALTER TABLE profiles DROP COLUMN is_admin;` после фикса C1.

---

### 🟡 M2 — `ai_jobs` и `api_logs` INSERT открыт для всех authenticated

```sql
-- ai_jobs
policy    : "ai_jobs_service_insert"
cmd       : INSERT
roles     : {authenticated}
with_check: true   -- любой авторизованный может вставить job

-- api_logs
policy    : "api_logs_insert_service"
cmd       : INSERT
roles     : {authenticated}
with_check: true   -- любой авторизованный может вставить лог
```

Намерение — только service_role. Нужно сузить:
```sql
with_check: (auth.role() = 'service_role')
```

---

### 🟡 M3 — `subscriptions` нет триггера `updated_at`

Колонка `updated_at timestamptz` существует, но триггера нет.
Поле обновляется только если код явно передаёт значение.
`cron-maintenance` (не задеплоен) опирается на актуальность этой даты.

---

### 🟡 M4 — `vector` extension в публичной схеме

```text
name   : vector
schema : public   -- должен быть extensions
```

Суперпользовательский объект в публичной схеме. Best practice: перенести в `extensions`.

---

### 🟡 M5 — `booking_status` enum: `cancelled` (double l) vs `canceled`

```sql
booking_status : active, cancelled, completed, no_show
-- subscriptions.status CHECK использует: canceled (single l)
```

Разные написания в разных таблицах. Риск type confusion при совместной обработке.

---

## 4) Полная матрица таблиц (live состояние)

| Таблица | Строк | Размер | RLS | Политик | Migration tracked | В репо |
| --- | --- | --- | --- | --- | --- | --- |
| `profiles` | 1 | 48 kB | ✅ | **8** ⚠️ открытая | ❌ manual | ✅ |
| `bookings` | 0 | 64 kB | ✅ | **8** (дубли) | ❌ manual | ✅ |
| `subscriptions` | 0 | 56 kB | ✅ | 5 ✅ | ❌ manual | ✅ |
| `contacts` | 11 | 48 kB | ✅ | 3 (insert open) | ❌ manual | ✅ |
| `classes` | 0 | 48 kB | ✅ | 3 ✅ | ❌ manual | ✅ |
| `admins` | 2 | 24 kB | ✅ | 2 ✅ | ❌ manual | ✅ |
| `articles` | 0 | 16 kB | ✅ | 2 ✅ | ❌ manual | ✅ |
| `practice_events` | 0 | 32 kB | ✅ | 3 ✅ | ❌ manual | ✅ |
| `app_events` | 0 | 24 kB | ✅ | 2 ✅ | ❌ manual | ✅ |
| `user_preferences` | 0 | 16 kB | ✅ | 3 ✅ | ❌ manual | ✅ |
| `analytics_events` | 914 | 768 kB | ✅ | 2 (insert open) | ✅ 20260216 | ✅ |
| `user_progress` | 0 | 8 kB | ✅ | 3 ✅ | ✅ 20260216 | ✅ |
| `user_achievements` | 0 | 32 kB | ✅ | 3 ✅ | ✅ 20260216 | ✅ |
| `videos` | 4 | 32 kB | ✅ | 2 ✅ | ✅ 20260221 | ✅ |
| `app_settings` | 3 | 32 kB | ✅ | 4 (дубли) | ✅ 20260226 | ✅ |
| `reviews` | 0 | 16 kB | ✅ | 2 ✅ | ✅ 20260312 | ✅ |
| `pricing_plans` | 0 | 16 kB | ✅ | 2 ✅ | ✅ 20260312 | ✅ |
| `faq_items` | 0 | 16 kB | ✅ | 2 ✅ | ✅ 20260312 | ✅ |
| `site_images` | 0 | 16 kB | ✅ | 2 ✅ | ✅ 20260312 | ✅ |
| `user_push_tokens` | 0 | 32 kB | ✅ | 2 ✅ | ✅ 20260312 | ✅ |
| `retreats` | 0 | 16 kB | ✅ | 3 ✅ | ✅ 20260315 | ✅ |
| `model_metadata` | 0 | 16 kB | ✅ | 2 | ❌ **SHADOW** | ❌ |
| `prompt_requests` | 0 | 40 kB | ✅ | 4 ✅ | ❌ **SHADOW** | ❌ |
| `embeddings` | — | **1.6 MB** | ✅ | 2 ✅ | ❌ **SHADOW** | ❌ |
| `ai_jobs` | 0 | 24 kB | ✅ | 2 ⚠️ | ❌ **SHADOW** | ❌ |
| `api_logs` | 0 | 16 kB | ✅ | 2 ⚠️ | ❌ **SHADOW** | ❌ |
| `dialogue` | 0 | 8 kB | ✅ | **0** ❌ | ❌ **SHADOW** | ❌ |

---

## 5) Полная матрица RLS-политик

### `admins`
| Политика | Cmd | Qual | With check |
| --- | --- | --- | --- |
| `admin can read own row` | SELECT | `auth.uid() = user_id` | — |
| `authenticated can check admin status` | SELECT | `user_id = auth.uid()` | — |

### `profiles`
| Политика | Cmd | Qual | With check | Статус |
| --- | --- | --- | --- | --- |
| `Allow public read/write profiles` | ALL | `true` | `true` | 🔴 ОПАСНО |
| `Admin can read all profiles` | SELECT | `is_admin()` | — | нерелевантна |
| `Users can insert own profile` | INSERT | — | `uid=user_id` | нерелевантна |
| `Users can update own profile` | UPDATE | `uid=user_id` | — | нерелевантна |
| `Users can view own profile` | SELECT | `uid=user_id` | — | нерелевантна |
| `profiles_insert_own` | INSERT | — | `uid=user_id` | дубль |
| `profiles_select_own` | SELECT | `uid=user_id` | — | дубль |
| `profiles_update_own` | UPDATE | `uid=user_id` | `uid=user_id` | дубль |

### `subscriptions`
| Политика | Cmd | Qual | With check |
| --- | --- | --- | --- |
| `subscriptions_select_own` | SELECT | `uid=user_id` | — |
| `admin read all subscriptions` | SELECT | `is_admin()` | — |
| `admin insert subscriptions` | INSERT | — | `is_admin()` |
| `admin update subscriptions` | UPDATE | `is_admin()` | `is_admin()` |
| `admin delete subscriptions` | DELETE | `is_admin()` | — |

### `analytics_events`
| Политика | Cmd | Qual | With check | Статус |
| --- | --- | --- | --- | --- |
| `Allow public insert to analytics` | INSERT | — | `true` | ⚠️ open |
| `Allow admins to read analytics` | SELECT | `admins.user_id=uid` | — | ✅ |

### `contacts`
| Политика | Cmd | Qual | With check | Статус |
| --- | --- | --- | --- | --- |
| `Enable insert for all users` | INSERT | — | `true` | ⚠️ public |
| `Enable read for service role only` | SELECT | `role()='service_role'` | — | ✅ |
| `admin read contacts` | SELECT | `is_admin()` | — | ✅ |

### `bookings`
| Политика | Cmd | Qual | With check | Набор |
| --- | --- | --- | --- | --- |
| `Users can view own bookings` | SELECT | `uid=user_id` | — | старый |
| `Users can create bookings` | INSERT | — | `uid=user_id` | старый |
| `Users can delete own bookings` | DELETE | `uid=user_id` | — | старый |
| `admin manage bookings` | ALL | `is_admin()` | — | старый |
| `admin view all bookings` | SELECT | `is_admin()` | — | старый |
| `bookings_select_own` | SELECT | `uid=user_id` | — | новый |
| `bookings_insert_own` | INSERT | — | `uid=user_id` | новый |
| `bookings_update_own` | UPDATE | `uid=user_id` | `uid=user_id` | новый |
| `bookings_delete_own` | DELETE | `uid=user_id` | — | новый |

---

## 6) Функции и Триггеры

### Custom функции

| Функция | Security | search_path | Используется в |
| --- | --- | --- | --- |
| `is_admin()` | INVOKER | ❌ не зафиксирован | RLS политики 8+ таблиц |
| `get_admin_analytics(period_days)` | DEFINER | ❌ не зафиксирован | RPC из admin UI |
| `set_updated_at()` | INVOKER | ❌ не зафиксирован | Триггеры ai_jobs, prompt_requests, retreats |
| `touch_push_token_updated_at()` | INVOKER | ❌ не зафиксирован | Триггер user_push_tokens |
| `trigger_set_timestamp()` | INVOKER | ❌ не зафиксирован | Триггер classes |
| `rls_auto_enable()` | DEFINER | ✅ `search_path=pg_catalog` | Системный |

### Триггеры

| Триггер | Таблица | Event | Функция |
| --- | --- | --- | --- |
| `trg_ai_jobs_updated_at` | `ai_jobs` | BEFORE UPDATE | `set_updated_at()` |
| `set_timestamp` | `classes` | BEFORE UPDATE | `trigger_set_timestamp()` |
| `trg_prompt_requests_updated_at` | `prompt_requests` | BEFORE UPDATE | `set_updated_at()` |
| `retreats_updated_at` | `retreats` | BEFORE UPDATE | `set_updated_at()` |
| `push_token_updated_at` | `user_push_tokens` | BEFORE UPDATE | `touch_push_token_updated_at()` |

**Таблицы без триггера `updated_at`:** `subscriptions` (поле есть, триггера нет), `profiles` (поля нет).

---

## 7) Индексы

| Таблица | Индексы |
| --- | --- |
| `analytics_events` | PK(id), idx(created_at), idx(event_name) |
| `bookings` | PK(id), idx(user_id), idx(status) |
| `classes` | PK(id), idx(date) |
| `contacts` | PK(id), idx(status) |
| `subscriptions` | PK(id), unique(user_id), idx(user_id), idx(status partial), idx(user_id+status+period_end) |
| `practice_events` | PK(id), unique(user_id+day+kind), idx(user_id+day DESC) |
| `user_achievements` | PK(id), unique(user_id+achievement_id), idx(user_id) |
| `user_push_tokens` | PK(id), unique(user_id+token), idx(user_id) |
| `embeddings` | PK(id), idx(namespace), **ivfflat(vector) lists=100** |
| `prompt_requests` | PK(id), idx(user_id), idx(status), idx(created_at) |
| `ai_jobs` | PK(id), idx(status) |

**Отсутствуют индексы** (потенциальные проблемы при росте):
- `profiles(user_id)` — только уникальный partial index (WHERE user_id IS NOT NULL)
- `app_events(user_id)` — есть составной idx(user_id, created_at DESC) ✅
- `analytics_events(user_id)` — **нет** при 914 строках и росте

---

## 8) Типы и Enums

| Тип | Значения |
| --- | --- |
| `booking_status` | active, **cancelled** (double l), completed, no_show |
| `contact_status` | new, read, processed, spam |
| `pricing_category` | yoga, personal, sound, massage |

**Примечание:** `subscriptions.status` использует text CHECK со значением `canceled` (single l).
Разные написания в двух связанных концептах.

---

## 9) Storage

| Bucket | Public | MIME ограничения | Size limit | Статус |
| --- | --- | --- | --- | --- |
| `images` | ✅ да | ❌ не заданы | ❌ не задан | ⚠️ требует ограничений |
| `interf` | ❌ нет | ❌ не заданы | ❌ не задан | ❓ неизвестное назначение |

---

## 10) Extensions (установленные)

| Extension | Schema | Version | Проблема |
| --- | --- | --- | --- |
| `vector` (pgvector) | **public** | 0.8.0 | ⚠️ должен быть в `extensions` |
| `pg_graphql` | graphql | 1.5.11 | ✅ |
| `supabase_vault` | vault | 0.3.1 | ✅ |
| `uuid-ossp` | extensions | 1.1 | ✅ |
| `pgcrypto` | extensions | 1.3 | ✅ |
| `pg_stat_statements` | extensions | 1.11 | ✅ |

---

## 11) Auth State

| Параметр | Значение |
| --- | --- |
| Пользователей | **2** |
| Первая регистрация | 15 февраля 2026 |
| Последняя регистрация | 22 февраля 2026 |
| Admins | **2** |
| Leaked password protection | ❌ отключено |
| Auth provider | email + password, OTP SMS (APP) |

---

## 12) PASS / FAIL сводка

| Домен | Статус | Приоритет |
| --- | --- | --- |
| `profiles` RLS | ❌ FAIL | 🔴 P0 |
| Edge Functions deployment | ❌ FAIL | 🔴 P0 |
| Migration integrity | ❌ FAIL | 🔴 P0 |
| Schema versioning | ❌ FAIL | 🔴 P0 |
| Shadow tables | ❌ FAIL | 🔴 P0 |
| `dialogue` RLS | ❌ FAIL | 🔴 P0 |
| Duplicate RLS policies | ⚠️ WARN | 🟠 P1 |
| Function search_path | ⚠️ WARN | 🟠 P1 |
| Storage restrictions | ⚠️ WARN | 🟠 P1 |
| Unknown `interf` bucket | ⚠️ WARN | 🟠 P1 |
| Analytics insert open | ⚠️ WARN | 🟠 P1 |
| Leaked password protection | ⚠️ WARN | 🟠 P1 |
| `profiles.is_admin` column | ⚠️ WARN | 🟡 P2 |
| `ai_jobs`/`api_logs` INSERT | ⚠️ WARN | 🟡 P2 |
| `subscriptions` updated_at trigger | ⚠️ WARN | 🟡 P2 |
| `vector` extension schema | ⚠️ WARN | 🟡 P2 |
| `booking_status` enum spelling | ℹ️ INFO | 🟡 P2 |
| `subscriptions` RLS | ✅ PASS | — |
| `admins` RLS | ✅ PASS | — |
| gamification RLS | ✅ PASS | — |
| Vault secrets isolation | ✅ PASS | — |

---

## 13) Приоритизированный план действий

### P0 — Немедленно

**1. Удалить опасную политику на `profiles`**
```sql
DROP POLICY "Allow public read/write profiles" ON public.profiles;
-- Проверить что profiles_select_own / profiles_update_own / profiles_insert_own покрывают все операции
```

**2. Принять решение по Edge Functions**

Два варианта — выбрать один:

- **Вариант A:** Задеплоить 7 функций из репозитория (платежи, push, AI proxy, newsletter)
  ```bash
  node_modules/supabase/bin/supabase.exe functions deploy
  ```
- **Вариант B:** Перенести `ai-run` / `ai-embeddings` в репозиторий и сделать их каноном

**3. Зафиксировать live схему в migrations**
```bash
node_modules/supabase/bin/supabase.exe db dump --schema public > supabase/migrations/20260315200000_baseline_live_schema.sql
```
Добавить как baseline миграцию, чтобы `db reset` воспроизводил production схему.

**4. Документировать или удалить 6 shadow таблиц**

Если `ai-run` / `ai-embeddings` — это production архитектура, их схема должна быть в репозитории.

**5. `dialogue` table**
```sql
-- Если не нужна:
DROP TABLE public.dialogue;
-- Если нужна — добавить политики:
CREATE POLICY "..." ON public.dialogue ...;
```

**6. `profiles.is_admin` column — после фикса C1**
```sql
ALTER TABLE public.profiles DROP COLUMN is_admin;
```

### P1 — В течение текущего sprint

**7. Убрать дублирующие политики**
```sql
-- profiles — оставить только три специфичных:
DROP POLICY "Users can insert own profile" ON public.profiles;
DROP POLICY "Users can update own profile" ON public.profiles;
DROP POLICY "Users can view own profile" ON public.profiles;

-- bookings — оставить один набор:
DROP POLICY "Users can view own bookings" ON public.bookings;
DROP POLICY "Users can create bookings" ON public.bookings;
DROP POLICY "Users can delete own bookings" ON public.bookings;

-- app_settings — оставить один набор:
DROP POLICY "Enable read access for all users" ON public.app_settings;
DROP POLICY "Enable write access for admins" ON public.app_settings;
```

**8. Зафиксировать search_path у функций**
```sql
ALTER FUNCTION public.is_admin()
  SECURITY DEFINER
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.get_admin_analytics(integer)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.set_updated_at()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.touch_push_token_updated_at()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.trigger_set_timestamp()
  SET search_path = public, pg_catalog;
```

**9. Ограничить `images` bucket**
```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'],
    file_size_limit    = 5242880
WHERE name = 'images';
```

**10. Разобраться с `interf` bucket** — выяснить назначение у Семёна. Если не нужен — удалить.

**11. Включить Leaked Password Protection**
Dashboard → Authentication → Settings → Enable leaked password protection.

### P2 — Backlog

**12.** `ai_jobs` / `api_logs` INSERT — сузить до `service_role`.

**13.** Добавить триггер `updated_at` на `subscriptions`.

**14.** Перенести `vector` extension в схему `extensions` (требует координации с shadow AI tables).

**15.** `analytics_events` — добавить rate limiting или user_id binding на INSERT.

**16.** `booking_status` enum — рассмотреть унификацию написания (`cancelled` vs `canceled`).

---

## 14) Документационный drift

| Что задокументировано | Реальность |
| --- | --- |
| 7 Edge Functions задеплоены | 2 функции (`ai-run`, `ai-embeddings`), 7 из репо — нет |
| Таблица `push_tokens` | Реальное имя: `user_push_tokens` |
| 34 миграции применены | 12 применены, остальные — ручная схема |
| AI через `gemini-proxy` | AI через `ai-run` / `ai-embeddings` |
| Нет теневых таблиц | 6 shadow таблиц в production |

---

**Последнее обновление:** 15 марта 2026
**Версия:** 1.0.0
**Метод верификации:** Supabase MCP API · прямые SQL-запросы к live DB
**Следующий ревью:** до деплоя в production
