# Supabase Edge Functions

## Функции

- `gemini-proxy` — серверный прокси для Gemini (ключ хранится в secrets)
- `create-payment` — создание платежа/подписки
- `payment-webhook` — webhook обновления статусов подписки

## Настройка секретов (обязательно)

В Supabase Dashboard или через CLI:

```bash
supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
supabase secrets set PAYMENT_CHECKOUT_URL="https://pay.example.com/checkout"
supabase secrets set PAYMENT_WEBHOOK_SECRET="super-secret"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="service-role-key"
```

## Переменные окружения

В Edge Runtime обычно уже доступны:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Если вы используете иной runtime/хостинг для функции — задайте их вручную.

## Деплой

```bash
supabase functions deploy gemini-proxy
supabase functions deploy create-payment
supabase functions deploy payment-webhook
```

## Миграции (Sprint 1: user_id + RLS)

Миграция лежит в
`supabase/migrations/20251227160000_profiles_bookings_user_id_rls.sql`.

Применение (через CLI, если проект подключён):

```bash
supabase db push
```

## Проверка (smoke test)

После деплоя:

```bash
curl -sS "${SUPABASE_URL}/functions/v1/gemini-proxy" \
  -H "content-type: application/json" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
  --data '{"op":"chat","message":"Привет"}'
```

Ожидаемый ответ: JSON с полем `text`.

## Важно про безопасность

- Дорогие операции (медиа‑анализ/генерации/транскрипция) требуют **реального JWT
  пользователя** (Supabase Auth).  
  До внедрения Auth в APP/WEB они будут возвращать `401`.
