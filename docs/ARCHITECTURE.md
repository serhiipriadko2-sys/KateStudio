# Архитектура экосистемы KateStudio

> **Обновлено:** 15 марта 2026 | **Версия:** 2.0.0

## 1) Контекст и цель

Экосистема состоит из двух клиентских приложений (WEB + APP/PWA) и общей
библиотеки `shared`, которые вместе реализуют:

- маркетинг/лендинг (WEB),
- мобильный опыт и личный кабинет (APP),
- общий UI/утилиты/интеграции (shared),
- серверную логику через Supabase Edge Functions.

## 2) Структура репозитория

```text
KateStudio/
├── shared/                        # @ksebe/shared — дизайн/компоненты/хуки/сервисы
│   ├── components/                # Reusable React компоненты
│   │   └── Image/                 # Image компонент (разбит на подкомпоненты)
│   ├── hooks/                     # useGamification, useAchievements, useIsAdmin, ...
│   ├── services/                  # supabase.ts, analytics.ts, monitoring.ts
│   ├── types/                     # index.ts, database.types.ts
│   ├── utils/                     # cn, formatDate, formatPrice, logger, ...
│   └── constants/                 # images.ts, BRAND, COLORS, SUBSCRIPTION_PLANS, ...
│
├── k-sebe-yoga-studioWEB/         # WEB (маркетинг + Admin Panel)
│   ├── components/                # WEB-специфичные компоненты (Landing, Admin)
│   ├── services/                  # assistantService, subscriptionService, ...
│   ├── context/                   # AuthContext
│   └── hooks/                     # useContentData, useStudioContacts, ...
│
├── k-sebe-yoga-studio-APPp/       # APP (PWA + Capacitor native wrapper)
│   ├── components/                # Dashboard, VideoLibrary, AICoach, Achievements, ...
│   ├── services/                  # dataService, gamificationService, videoService, ...
│   ├── context/                   # AuthContext, ToastContext
│   ├── hooks/                     # useStreak, usePracticeCompletions, useNative, ...
│   ├── native/                    # platform.ts, plugins.ts, index.ts
│   └── capacitor.config.ts        # SplashScreen, StatusBar config
│
├── supabase/
│   ├── functions/                 # 7 Edge Functions (см. секцию 4)
│   └── migrations/                # 20+ SQL миграций
│
└── .github/workflows/             # CI/CD (ci.yml, deploy-pages.yml, firebase-deploy.yml)
```

## 3) Runtime-архитектура

```text
[Пользователь]
  ├─> WEB (GitHub Pages / ksebe-studio.ru)
  │     ├─ UI (React 19 / Vite 6)
  │     ├─ Supabase Auth (Admin Login, OTP)
  │     └─ Edge Functions (create-payment, gemini-proxy, subscribe-newsletter)
  │
  └─> APP (Firebase Hosting / app.ksebe-studio.ru)
        ├─ UI (React 19 / Vite 6)
        ├─ Offline cache (IndexedDB / localStorage через localCache.ts)
        ├─ Supabase Auth (OTP / Magic Link)
        ├─ Edge Functions (все 7 функций доступны)
        └─> [Опционально] Capacitor (Android / iOS)
              ├─ native/platform.ts  — isNative, isIOS, isAndroid, getPlatform
              ├─ native/plugins.ts   — StatusBar, SplashScreen, Keyboard,
              │                        Haptics, Network, App lifecycle
              └─ native/index.ts     — initNative() / nativeReady()
```

## 4) Edge Functions (7 штук)

Все функции в `supabase/functions/`. Подробно: [EDGE_FUNCTIONS.md](./EDGE_FUNCTIONS.md).

| Функция | Назначение | Auth |
| --- | --- | --- |
| `gemini-proxy` | AI операции (12 типов), Zod validation, rate limiting | JWT |
| `create-payment` | Создание платежа YooKassa | JWT + Service Role |
| `payment-webhook` | HMAC-верификация вебхуков YooKassa | HMAC secret |
| `cancel-subscription` | Отмена подписки | JWT + Service Role |
| `cron-maintenance` | Плановое обслуживание БД | CRON_SECRET |
| `send-push` | FCM push-уведомления | Service Role |
| `subscribe-newsletter` | Подписка на рассылку (Mailchimp) | Public |

**Правило:** AI-контур (`gemini-proxy`) — **frozen by default**. Изменения только с явного разрешения Семёна.

## 5) База данных (Supabase)

### Ключевые таблицы

| Таблица | Описание |
| --- | --- |
| `profiles` | Профили пользователей (user_id → auth.users) |
| `bookings` | Записи на занятия |
| `subscriptions` | Подписки пользователей |
| `analytics_events` | События аналитики |
| `push_tokens` | FCM токены для push-уведомлений |
| `faq_items` | FAQ (с марта 2026) |
| `site_images` | Управление изображениями сайта |
| `retreats` | Таблица ретритов (с марта 2026) |
| `admins` | Таблица администраторов |

### Актуальные миграции (хронология)

```text
supabase/migrations/
├── 20260308000000_secure_video_select_policy.sql
├── 20260308000000_unify_admin_roles.sql
├── 20260308000001_contact_rate_limit.sql
├── 20260308000002_secure_storage.sql
├── 20260308000003_secure_gamification.sql
├── 20260309000000_push_tokens.sql
├── 20260309000001_fix_analytics_rls.sql          # admins.id → admins.user_id
├── 20260309000002_fix_profiles_update_policy.sql  # убрана ref на is_admin
├── 20260312000001_faq_items.sql
├── 20260312000002_site_images.sql
├── 20260315000000_retreats_table.sql
├── 20260315000001_admin_subscriptions_rls.sql
├── 20260315000002_analytics_rpc.sql
└── 20260315000003_grant_is_admin_execute.sql
```

> `9999999999_admin_checklist.sql` — нестандартная нумерация, требует уточнения (checklist или migration?).

## 6) Конфигурация окружения

Источник: `.env` (локально) + Secrets (GitHub / Supabase Vault).

### Клиентские переменные (WEB + APP)

```env
VITE_SUPABASE_URL=https://qkaycdcbstjobacmuaro.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

### Серверные секреты (Supabase Vault, никогда не в браузере)

```sh
GEMINI_API_KEY           — AI (⚠️ не установлен, нужен)
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
PAYMENT_WEBHOOK_SECRET
FIREBASE_SERVICE_ACCOUNT_JSON
YOOKASSA_SHOP_ID         — (⚠️ платежи не live)
YOOKASSA_SECRET_KEY      — (⚠️ платежи не live)
```

### GitHub Secrets (CI/CD)

```sh
VITE_SUPABASE_URL         ✅
VITE_SUPABASE_ANON_KEY    ✅
FIREBASE_SERVICE_ACCOUNT  ✅
CRON_SECRET               ✅
SUPABASE_URL              ✅
```

## 7) CI/CD

`.github/workflows/ci.yml` — основной pipeline:

```text
push/PR → main, develop
  ├─ lint        (ESLint Flat Config)
  ├─ format:check (Prettier)
  ├─ typecheck    (tsc --noEmit, все 3 workspace-а)
  ├─ test:run     (Vitest, 473 тестов)
  ├─ build:web    (только после lint+typecheck+test ✅)
  └─ build:app    (только после lint+typecheck+test ✅)
```

Deploy pipelines:

- `deploy-pages.yml` — WEB → GitHub Pages (только `main`)
- `firebase-deploy.yml` — APP → Firebase Hosting (только `main`)
- `capacitor-build.yml` — Capacitor сборка (mobile)
- `cron.yml` — запуск `cron-maintenance` Edge Function

## 8) Технические решения (ADR)

1. **Edge Functions для всех чувствительных операций** — AI, платежи, push. Секреты никогда не передаются в браузер.
2. **Offline-First APP** — `localCache.ts` (IndexedDB/localStorage) синхронизируется при подключении.
3. **Monorepo + npm workspaces** — `shared/` предотвращает дублирование кода между WEB и APP.
4. **Capacitor-over-PWA** — native wrapper добавляет хаптику, статус-бар, splash screen без переписывания React-кода.
5. **Zod на Edge Functions** — все входящие запросы валидируются `ProxyRequestSchema` (discriminated union по `op`).
6. **Rate limiting в gemini-proxy** — in-memory Map (для production scale нужен KV/Redis).
7. **HMAC webhook verification** — `payment-webhook` отклоняет запросы без корректной подписи.

## 9) Правила работы с нативным кодом

- Все импорты нативных API — только через `./native` (не напрямую из `@capacitor/*` в компонентах)
- `hapticFn()` всегда `void hapticFn()`, никогда `await` в рендере
- `isNative()` — guard для всего нативного кода
- Нативные проекты (`android/`, `ios/`) в `.gitignore`, собираются локально

## 10) Архитектурные ограничения

- **AI-контур frozen**: `gemini-proxy`, model routing, prompt contracts не меняются без явного разрешения
- **Circular dependencies** запрещены
- **`@capacitor/*`** не импортируются напрямую в компонентах — только через `native/`
- **Service Role Key** не передаётся в браузер
- **CORS**: ограничен `ksebe-studio.ru`, `app.ksebe-studio.ru`, `localhost`
- **shared/** изменения затрагивают оба workspace — нужен review в обоих
