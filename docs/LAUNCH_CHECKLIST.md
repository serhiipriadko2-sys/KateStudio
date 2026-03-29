# Launch Checklist & Gap Analysis

> **Обновлено:** 15 марта 2026 | Верифицировано кодом и `npm run test:run`.

---

## 1. Схема БД (таблицы в коде vs миграции)

| Таблица | Статус | Примечание |
| --- | --- | --- |
| `profiles` | ✅ | Миграция + RLS политики исправлены (20260309000002) |
| `bookings` | 🟠 Partial | `ALTER` без `CREATE`, существует в Supabase |
| `subscriptions` | ✅ | RLS обновлён (admin_subscriptions — 20260315000001) |
| `analytics_events` | ✅ | RLS исправлен (admins.user_id — 20260309000001) |
| `user_push_tokens` | ✅ | Миграция 20260309000000 |
| `faq_items` | ✅ | Миграция 20260312000001 |
| `site_images` | ✅ | Миграция 20260312000002 |
| `retreats` | ✅ | Миграция 20260315000000 |
| `admins` | ✅ | Таблица существует, `is_admin` RPC (20260315000003) |
| `contacts` | 🔴 Missing | Не найдена CREATE миграция |
| `classes` | 🔴 Missing | Не найдена CREATE миграция |

**Действие:** создать консолидированную миграцию для `contacts` и `classes`.

---

## 2. Security (P0)

Критические security-исправления из предыдущих аудитов закрыты к марту 2026, но launch-блокеры P0 в разделе 8 остаются открытыми.

| Компонент | Проблема | Статус |
| --- | --- | --- |
| `payment-webhook` | Webhook secret был опциональным | ✅ HMAC verification |
| `create-payment` | Anon fallback при отсутствии serviceRoleKey | ✅ Fails hard |
| Все Edge Functions | CORS `*` | ✅ Ограничен доменами |
| RLS `subscriptions` | Пользователь мог менять статус подписки | ✅ Service Role only |
| Gemini API key | `VITE_GEMINI_API_KEY` fallback в браузере | ✅ Только через proxy |
| `analytics_events` RLS | Неверная ссылка `admins.id` | ✅ Исправлено (20260309000001) |
| `profiles` update policy | Ссылка на удалённую колонку `is_admin` | ✅ Исправлено (20260309000002) |
| Zod validation | Отсутствовала в `gemini-proxy` | ✅ `ProxyRequestSchema` |

**Security Score:** ~90/100

---

## 3. Контент и ассеты

| Ассет | Проблема | Статус |
| --- | --- | --- |
| WEB изображения | Были внешние URL | ✅ Локальные ассеты (`shared/constants/images.ts`) |
| APP изображения | Unsplash placeholder URL | ✅ Убраны (grep не находит) |
| Видео в APP VideoLibrary | 4 placeholder видео | ⏳ Нужны реальные URL в БД |
| PWA иконки | Не было | ✅ 72–512px |
| og-image.jpg | Не было | ✅ Добавлена |

---

## 4. Деплой и инфраструктура

| Элемент | Статус | Примечание |
| --- | --- | --- |
| `.env` файлы (локально) | ⏳ | Создавать вручную из `.env.example` |
| GitHub Secrets | 🟠 Partial | Базовые secrets готовы; для mobile release нужны `ANDROID_*` и `IOS_*` signing secrets |
| Firebase deploy workflow | ✅ | `firebase-deploy.yml` настроен |
| Web 404 handling | ✅ | `public/404.html` для SPA routing |
| Capacitor mobile build | ✅ | `npm run build:mobile` (Android) |
| CI (lint/typecheck/test) | ✅ | 0 errors, 473/473 тестов |

---

## 5. Native / Mobile

| Элемент | Статус | Примечание |
| --- | --- | --- |
| Capacitor scaffold | ✅ | `native/`, `capacitor.config.ts`, все плагины |
| Platform CSS классы | ✅ | `is-ios`, `is-android`, `is-native` |
| Safe area insets | ✅ | `.pt-safe`, `.pb-safe` и т.д. |
| StatusBar / SplashScreen | ✅ | Бренд-зелёный, fade-out |
| Haptic feedback | ✅ | Tab nav + BookingModal |
| Android back button | ✅ | Минимизация при пустой истории |
| Android Studio project | ⏳ | Генерируется локально: `npm run cap:add:android` |
| Xcode project | ⏳ | Требует macOS + CocoaPods |
| Android signed release artifact | 🟠 Partial | Workflow готовит signed `APK/AAB` после настройки `ANDROID_*` secrets |
| iOS signed IPA export | 🟠 Partial | Workflow экспортирует `ipa` после настройки `IOS_*` secrets |

---

## 6. Edge Functions

| Функция | Статус | Примечание |
| --- | --- | --- |
| `gemini-proxy` | ✅ | Zod, rate limiting, JWT auth |
| `create-payment` | 🔄 | YooKassa частично (нет YOOKASSA_* ключей) |
| `payment-webhook` | ✅ | HMAC verification |
| `cancel-subscription` | ✅ | Реализована |
| `cron-maintenance` | ✅ | Реализована |
| `send-push` | ✅ | FCM готова |
| `subscribe-newsletter` | ✅ | Mailchimp готова |

---

## 7. Тестирование

| Метрика | Статус |
| --- | --- |
| Tests passing | ✅ 473 / 473 |
| Test suites | ✅ 60 |
| TypeScript errors | ✅ 0 |
| Lint errors | ✅ 0 |
| Lint warnings | ⚠️ 75 (не блокеры) |
| Coverage | ~35% (цель 70%) |

---

## 8. Открытые блокеры (P0)

| # | Блокер | Действие |
| --- | --- | --- |
| 1 | **GEMINI_API_KEY** не установлен | Семён → Supabase Vault → `supabase secrets set GEMINI_API_KEY=...` |
| 2 | **YooKassa** не live | Получить `YOOKASSA_SHOP_ID` + `YOOKASSA_SECRET_KEY`, установить в Vault |
| 3 | **Видео** в VideoLibrary — placeholder | Загрузить реальные видео, добавить URL в таблицу `videos` |
| 4 | **`contacts`/`classes`** — нет CREATE миграции | Написать миграцию с `CREATE TABLE IF NOT EXISTS` |

---

## 9. Следующие шаги (приоритет)

1. **[P0]** `GEMINI_API_KEY` → Supabase Vault
2. **[P0]** YooKassa ключи → завершить `create-payment`
3. **[P1]** Миграции `contacts` и `classes`
4. **[P1]** Реальные видео в VideoLibrary
5. **[P2]** Lint warnings 75 → 0 (console.log → console.error в Edge Functions)
6. **[P2]** Test coverage 35% → 70%
7. **[P3]** Performance (Lighthouse 90+)
