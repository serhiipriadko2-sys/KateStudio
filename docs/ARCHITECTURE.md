# Архитектура экосистемы KateStudio

## 1) Контекст и цель

Экосистема состоит из двух клиентских приложений (WEB + APP/PWA) и общей
библиотеки `shared`, которые вместе реализуют:

- маркетинг/лендинг (WEB),
- мобильный опыт и кабинет (APP),
- общий UI/утилиты/интеграции (shared).

## 2) Границы систем (repo view)

```
KateStudio/
├── shared/                    # @ksebe/shared — дизайн/компоненты/хуки/сервисы
├── k-sebe-yoga-studioWEB/     # WEB (маркетинг + виджеты + Admin Panel)
├── k-sebe-yoga-studio-APPp/   # APP (PWA + Capacitor native wrapper)
│   ├── native/                #   platform.ts, plugins.ts, index.ts
│   ├── hooks/useNative.ts     #   React hook (haptics, network, platform)
│   └── capacitor.config.ts   #   SplashScreen, StatusBar config
├── supabase/                  # Backend (Edge Functions, DB Migrations)
└── .github/workflows/         # CI/CD
```

## 3) Runtime-архитектура (сервисы и потоки)

```
[User]
  ├─> WEB (GitHub Pages / ksebe-studio.ru)
  │     ├─ UI (React/Vite)
  │     ├─ Supabase Auth (Admin Login)
  │     └─ Edge Functions (Payment, AI Proxy)
  │
  └─> APP (PWA / Firebase Hosting / app.ksebe-studio.ru)
        ├─ UI (React/Vite)
        ├─ Offline cache (IndexedDB/localStorage)
        ├─ Supabase Auth (OTP/Magic Link)
        ├─ Edge Functions (Payment, AI Proxy)
        └─> [Optional] Capacitor (Android / iOS)
              ├─ native/platform.ts  — isNative, isIOS, isAndroid
              ├─ native/plugins.ts   — StatusBar, SplashScreen, Keyboard,
              │                        Haptics, Network, App lifecycle
              └─ native/index.ts     — initNative() / nativeReady()
```

### Обновления 2026 (важно)

- **AI (Gemini)**: Все запросы проходят через `supabase/functions/gemini-proxy`.
  - Клиентские ключи полностью удалены.
  - Используется `supabase.functions.invoke()`.
- **Auth**: Используется Supabase Auth.
  - RLS политики защищают данные.
  - `public.admins` таблица управляет правами доступа к админке.
- **Capacitor (февраль 2026)**: APP оборачивается нативной оболочкой для
  Android/iOS без изменения React-кода.
  - `initNative()` вызывается до рендера React (в `index.tsx`)
  - `nativeReady()` вызывается после первого кадра (скрывает SplashScreen)
  - Нативные проекты (`android/`, `ios/`) генерируются локально и не коммитятся
    в репозиторий

## 4) Конфигурация окружения (единый стандарт)

Источник — `.env` (локально) и Secrets (GitHub/Supabase).

- **Supabase (клиент)**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Gemini (сервер/edge)**:
  - `GEMINI_API_KEY` (секрет в Supabase Vault — недоступен клиенту)

## 5) CI/CD

См. `.github/workflows/ci.yml`:

- lint: `npm run lint` (ESLint Flat Config)
- format: `npm run format:check` (Prettier)
- typecheck: `npm run typecheck` (tsc -b)
- test: `npm run test:run` (Vitest)
- build: `npm run build:web`, `npm run build:app`

WEB deploy:

- GitHub Pages: `.github/workflows/deploy-pages.yml`

## 6) Технические решения

1. **Edge Functions**: Используются для всех чувствительных операций (AI,
   платежи). Никогда не передаём секреты в браузер.
2. **Offline-First**: PWA использует локальный кэш для расписания и контента,
   синхронизируясь при подключении.
3. **Monorepo**: Общий код в `shared` предотвращает дублирование.
4. **Testing**: TDD подход с Vitest для критической логики (208 тестов).
5. **Capacitor-over-PWA**: Native wrapper добавляет хаптику, статус-бар, splash
   screen и управление back button без переписывания React-кода. Все
   platform-specific вызовы изолированы в `native/` — компоненты вызывают только
   `hapticLight()`, `hapticSuccess()` и т.д.

## 7) Правила работы с нативным кодом

- Все импорты нативных API — только через `./native` (не напрямую из
  `@capacitor/*` в компонентах)
- `hapticFn()` всегда `void hapticFn()` (Promise), никогда `await` в рендере
- `isNative()` — guard для всего нативного кода
- Нативные проекты (`android/`, `ios/`) в `.gitignore`, собираются локально
