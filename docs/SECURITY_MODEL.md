# Security Model | KateStudio

> **Обновлено:** 15 марта 2026
> Role narrative — кто, что видит и почему.

---

## Роли и границы доступа

### App User (клиент студии)

- Аутентифицируется через Supabase Auth (OTP/Magic Link).
- Видит **только свои** записи: профиль, бронирования, подписку, историю практик.
- Isolation механизм: RLS политика `auth.uid() = user_id` на каждой чувствительной таблице.
- Не может обновить свой статус подписки напрямую — только через Edge Function (service role обходит RLS контролируемо).
- Не имеет доступа к таблице `admins`, расписанию других пользователей, аналитике.

### Studio Admin (сотрудник студии)

- Работает через WEB (`ksebe-studio.ru`), **отдельная auth boundary** от APP.
- Права администратора хранятся в таблице `admins` (`user_id` → `auth.users`).
- Проверка прав происходит на сервере (Edge Functions / RLS `is_admin()` function).
- Клиентский код **не определяет** admin-права — только читает флаг, полученный с сервера.
- Доступ к административным операциям: управление расписанием, просмотр аналитики, управление подписками.

### Edge Functions (серверный периметр)

- Единственное место, где хранятся и используются секреты: `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `YOOKASSA_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`.
- Все чувствительные операции проходят через Edge Functions — AI, платежи, push, обслуживание.
- Каждая функция проверяет auth самостоятельно: JWT validation, HMAC verification, CRON_SECRET.
- Service Role Key используется только внутри Edge Functions для операций, которые пользователь не может выполнить напрямую (обход RLS контролируемо).

---

## Что клиент получает, а что — нет

| | Browser / Device |
| --- | --- |
| ✅ Получает | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (публичные, безопасны) |
| ✅ Получает | JWT токен своего сеанса (истекает, не даёт admin-прав) |
| ❌ Не получает | `SUPABASE_SERVICE_ROLE_KEY` |
| ❌ Не получает | `GEMINI_API_KEY` |
| ❌ Не получает | `YOOKASSA_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` |
| ❌ Не получает | `FIREBASE_SERVICE_ACCOUNT_JSON` |

---

## Механизмы защиты

| Механизм | Что закрывает |
| --- | --- |
| **Supabase RLS** | Изоляция пользовательских данных (`auth.uid() = user_id`) |
| **`admins` table** | Административные права хранятся на сервере, не в JWT claims |
| **HMAC webhook** | `payment-webhook` отклоняет запросы без валидной подписи YooKassa |
| **JWT validation** | Все Edge Functions проверяют токен через `supabase.auth.getUser()` |
| **Zod validation** | `gemini-proxy` валидирует каждый входящий запрос (discriminated union по `op`) |
| **CORS allowlist** | `ksebe-studio.ru`, `app.ksebe-studio.ru`, `localhost` — остальные отклоняются |
| **Rate limiting** | `gemini-proxy` — in-memory лимиты per user (дорогие операции требуют auth) |
| **CRON_SECRET** | `cron-maintenance` — недоступна без bearer token |

---

## Что остаётся открытым

| Риск | Статус |
| --- | --- |
| `GEMINI_API_KEY` не установлен в Vault | ⏳ AI features не работают |
| `YOOKASSA_*` не установлены | ⏳ Платежи не live |
| Rate limiting in-memory (не persistent) | ⚠️ Для production scale нужен KV/Redis |
| `contacts` / `classes` — нет CREATE миграции | ⚠️ Таблицы существуют, но без явной схемы |

---

## Правило для разработчиков

> Секреты живут только в Supabase Vault и GitHub Secrets.
> В `.env.example` — только публичные переменные с placeholder-значениями.
> Никакой секретный ключ не попадает в `VITE_*` переменные для production.
