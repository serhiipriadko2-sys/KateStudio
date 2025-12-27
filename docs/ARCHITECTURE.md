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
├── k-sebe-yoga-studioWEB/     # WEB (маркетинг + виджеты)
├── k-sebe-yoga-studio-APPp/   # APP (PWA, offline-first)
└── .github/workflows/         # CI/CD
```

## 3) Runtime-архитектура (сервисы и потоки)

```
[User]
  ├─> WEB (GitHub Pages/Firebase Hosting)
  │     ├─ UI (React/Vite)
  │     ├─ Gemini (client-side ключ)  ⚠️
  │     └─ Supabase (anon key)        ⚠️ зависит от RLS
  │
  └─> APP (PWA)
        ├─ UI (React/Vite)
        ├─ Offline cache (IndexedDB/localStorage)
        ├─ Gemini (client-side ключ)  ⚠️
        └─ Supabase (anon key)        ⚠️ зависит от RLS
```

### Наблюдение (важно)

- **Gemini сейчас вызывается из браузера**, ключ подставляется на этапе сборки
  (см. `k-sebe-yoga-studioWEB/vite.config.ts`,
  `k-sebe-yoga-studio-APPp/vite.config.ts`).  
  Это нормально для демо, но **небезопасно для масштаба/продакшена** → нужен
  прокси/Edge Function.
- **APP “Auth” сейчас — профайл по телефону + локальный кэш**, а не Supabase
  Auth с серверными сессиями.

## 4) Конфигурация окружения (единый стандарт)

Источник — `.env.example` в корне.

- **Supabase (клиент)**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Gemini (клиент, демо)**:
  - `VITE_GEMINI_API_KEY`
- **Gemini (сервер/edge, целевое состояние)**:
  - `GEMINI_API_KEY` (секрет в Supabase/Firebase/Cloud Functions — не в клиенте)

Текущее состояние поддерживает _оба_ варианта (`VITE_GEMINI_API_KEY` и
`GEMINI_API_KEY`) для обратной совместимости, но **рекомендуемый** —
`VITE_GEMINI_API_KEY`.

## 5) CI/CD (что реально проверяется)

См. `.github/workflows/ci.yml`:

- lint: `npm run lint` (ESLint)
- format: `npm run format:check` (Prettier)
- typecheck: `npm run typecheck` (tsc)
- test: `npm run test:run` (Vitest)
- build: `npm run build:web`, `npm run build:app`

WEB deploy:

- GitHub Pages: `.github/workflows/deploy-pages.yml`
- Firebase Hosting: `.github/workflows/firebase-deploy.yml`

## 6) Технические “узкие места” (архитектурные)

1. **AI ключ в клиенте** → обязательный шаг: вынос в edge/proxy.
2. **Аутентификация APP** (сейчас “демо-логин”) → перейти на Supabase Auth
   (OTP/Email).
3. **Большие компоненты**:
   - WEB `components/ChatWidget.tsx` ~700 строк
   - APP `components/ChatWidget.tsx` ~818 строк → декомпозиция + тесты.
