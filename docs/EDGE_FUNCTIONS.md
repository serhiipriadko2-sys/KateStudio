# Edge Functions Reference | KateStudio

> **Обновлено:** 15 марта 2026
> Все функции в `supabase/functions/`. Runtime: Deno, `npm:` imports.

---

## Обзор (7 функций)

| Функция | Endpoint | Auth | Статус |
| --- | --- | --- | --- |
| `gemini-proxy` | `POST /functions/v1/gemini-proxy` | JWT | ✅ |
| `create-payment` | `POST /functions/v1/create-payment` | JWT + Service Role | 🔄 (нет YooKassa ключей) |
| `payment-webhook` | `POST /functions/v1/payment-webhook` | HMAC secret | ✅ |
| `cancel-subscription` | `POST /functions/v1/cancel-subscription` | JWT + Service Role | ✅ |
| `cron-maintenance` | `POST /functions/v1/cron-maintenance` | CRON_SECRET | ✅ |
| `send-push` | `POST /functions/v1/send-push` | Service Role | ✅ |
| `subscribe-newsletter` | `POST /functions/v1/subscribe-newsletter` | Public | ✅ |

**CORS**: все функции ограничены `ksebe-studio.ru`, `app.ksebe-studio.ru`, `localhost` (dev).

---

## Общие правила

- **AI-контур frozen**: `gemini-proxy` не меняется без явного разрешения Семёна.
- **Секреты**: только через Supabase Vault (`supabase secrets set KEY=VALUE`).
- **Service Role Key**: никогда не передавать в браузер.
- **Deno runtime**: импорты через `npm:package@version` или `https://deno.land/std@...`.

---

## 1. `gemini-proxy`

**Назначение:** Единственная точка входа для всех AI-операций. Хранит `GEMINI_API_KEY` на сервере.

**Auth:** JWT (Supabase anon token) → проверяется через `supabase.auth.getUser()`.

**Требуемые секреты:**

```sh
GEMINI_API_KEY              # ⚠️ не установлен — AI не работает
SUPABASE_URL
SUPABASE_ANON_KEY
```

**Поддерживаемые операции** (`op` field, Zod discriminated union):

| `op` | Описание | Модель |
| --- | --- | --- |
| `chat` | AI-чат с опциональной геолокацией | Gemini Flash |
| `thinking` | Расширенное рассуждение | Gemini Flash Thinking |
| `generateSpeech` | Текст → аудио (TTS) | Gemini |
| `generateMeditationScript` | Генерация медитации | Gemini Flash |
| `createMeditation` | Создание медитации с параметрами | Gemini Flash |
| `generateYogaImage` | Генерация изображения йоги (Imagen 3) | Imagen 3 |
| `generatePersonalProgram` | Персональная программа практик | Gemini Flash |
| `transcribeDiaryEntry` | Транскрипция аудио-дневника | Gemini |
| `analyzeYogaVideo` | Анализ видео асаны | Gemini |
| `analyzeMedia` | Анализ изображения/видео | Gemini |
| `analyzeImageContent` | Анализ изображения | Gemini |
| `editYogaImage` | Редактирование изображения (Imagen 3 edit) | Imagen 3 |
| `generateYogaVideo` | Генерация видео (Veo) | Veo |

**Rate limiting:** in-memory Map (per-user). Для production scale нужен KV/Redis.

**Request:**

```typescript
const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-proxy`;
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    authorization: `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({ op: 'chat', message: 'Hello' }),
});
```

> Note: current client code calls Edge Functions via `fetch` to `/functions/v1/...`; `gemini-proxy` is not wired to ChatWidget (KB fallback).

---

## 2. `create-payment`

**Назначение:** Создание платежа YooKassa для оформления подписки.

**Auth:** JWT (пользователь) + Service Role Key (для записи в БД).

**Требуемые секреты:**

```sh
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
YOOKASSA_SHOP_ID     # ⚠️ не установлен
YOOKASSA_SECRET_KEY  # ⚠️ не установлен
```

**Тело запроса (Zod-валидированное):**

```typescript
{
  plan: 'free' | 'premium' | 'vip',
  returnUrl?: string  // URL или app scheme (ksebe:, capacitor:)
}
```

**Статус:** 🔄 Реализована, но платежи не live — нет YooKassa ключей.

---

## 3. `payment-webhook`

**Назначение:** Обработка вебхуков от YooKassa. Обновляет статус подписки в БД.

**Auth:** HMAC-подпись (`PAYMENT_WEBHOOK_SECRET`). Запрос без валидной подписи → 401.

**Требуемые секреты:**

```sh
PAYMENT_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

**Поток:**

```text
YooKassa → POST /payment-webhook
  ├─ Verify HMAC signature
  ├─ Parse event (payment.succeeded | payment.canceled)
  ├─ Update subscriptions table (Service Role)
  └─ 200 OK
```

---

## 4. `cancel-subscription`

**Назначение:** Отмена активной подписки текущего пользователя. Использует Service Role для обхода RLS (пользователи не могут менять свой статус напрямую).

**Auth:** JWT (Bearer token пользователя).

**Требуемые секреты:**

```sh
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

**Тело запроса:** пустое (пользователь идентифицируется по JWT).

**Ответ:** `{ success: true, subscription_id: string }` или `{ error: string }`.

---

## 5. `cron-maintenance`

**Назначение:** Плановое обслуживание БД. Запускается ежедневно через `cron.yml` (GitHub Actions) или `pg_cron`.

**Auth:** `Authorization: Bearer <CRON_SECRET>`.

**Требуемые секреты:**

```sh
SUPABASE_SERVICE_ROLE_KEY
YOOKASSA_SHOP_ID      # для recover_payments
YOOKASSA_SECRET_KEY   # для recover_payments
CRON_SECRET
```

**Задачи:**

| Задача | Описание |
| --- | --- |
| `expire_subscriptions` | Переводит просроченные подписки в `past_due` |
| `recover_payments` | Проверяет YooKassa для pending платежей >30 мин |
| `cleanup_analytics` | Удаляет `analytics_events` старше 90 дней |

**Запрос:**

```sh
# Все задачи
POST /functions/v1/cron-maintenance
Authorization: Bearer <CRON_SECRET>

# Конкретная задача
Body: { "tasks": ["expire_subscriptions"] }
```

---

## 6. `send-push`

**Назначение:** Отправка Firebase Cloud Messaging (FCM) push-уведомлений одному или нескольким пользователям.

**Auth:** `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` — только внутреннее использование (проверяется явно в коде функции).

**Требуемые секреты:**

```sh
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT_JSON  # полный JSON service account
```

**Тело запроса:**

```typescript
{
  userIds: string[],              // Supabase auth user IDs
  title: string,
  body: string,
  data?: Record<string, string>,  // кастомный payload
  imageUrl?: string,
}
```

**Поток:**

```text
→ Получить FCM токены из таблицы user_push_tokens (по userIds)
→ Для каждого токена: POST к FCM API
→ Удалить невалидные токены (registration-token-not-registered)
→ Вернуть { sent: N, failed: M }
```

---

## 7. `subscribe-newsletter`

**Назначение:** Подписка email-адреса на Mailchimp audience list.

**Auth:** Public (без JWT). Rate limiting на уровне Mailchimp.

**Требуемые секреты:**

```sh
MAILCHIMP_API_KEY   # формат: "...key...-dc21" (datacenter парсится из суффикса)
MAILCHIMP_LIST_ID   # ID аудитории из Mailchimp dashboard
```

**Тело запроса:**

```typescript
{ email: string; name?: string }
```

**Ответы:**

| Код | Тело | Причина |
| --- | --- | --- |
| 200 | `{ success: true }` | Подписан |
| 400 | `{ error: 'missing_email' \| 'invalid_email' }` | Невалидный email |
| 409 | `{ error: 'already_subscribed' }` | Уже подписан |
| 500 | `{ error: 'server_error' }` | Ошибка Mailchimp |

---

## Деплой

```bash
# Деплой одной функции
node_modules/supabase/bin/supabase.exe functions deploy gemini-proxy

# Деплой всех функций
node_modules/supabase/bin/supabase.exe functions deploy

# Установка секрета
node_modules/supabase/bin/supabase.exe secrets set GEMINI_API_KEY=<value>

# Просмотр логов
node_modules/supabase/bin/supabase.exe functions logs gemini-proxy
```

Supabase CLI установлен как devDependency: `node_modules/supabase/bin/supabase.exe`.

---

## Неустановленные секреты (блокеры)

| Секрет | Блокирует | Действие |
| --- | --- | --- |
| `GEMINI_API_KEY` | Все AI features | Получить у Семёна → Vault |
| `YOOKASSA_SHOP_ID` | Платежи | YooKassa dashboard |
| `YOOKASSA_SECRET_KEY` | Платежи | YooKassa dashboard |
| `MAILCHIMP_API_KEY` | Newsletter | Mailchimp dashboard |
| `MAILCHIMP_LIST_ID` | Newsletter | Mailchimp dashboard |
