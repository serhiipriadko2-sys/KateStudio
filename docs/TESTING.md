# Testing Architecture | KateStudio

> **Обновлено:** 15 марта 2026
> Верифицировано: `npm run test:run` → 473 passed / 60 suites

---

## Метрики (верифицированы)

| Метрика | Значение |
| --- | --- |
| Tests passing | **473** |
| Test suites | **60** |
| TypeScript errors | **0** |
| Lint errors | **0** |
| Coverage threshold | lines/functions/statements: 30%, branches: 20% |

Динамика: 208 (январь) → 368 (февраль) → **473 (март)**.

---

## Инструменты

| Инструмент | Версия | Назначение |
| --- | --- | --- |
| Vitest | ^4.0 | Test runner |
| @testing-library/react | ^16 | Рендер React компонентов |
| @testing-library/jest-dom | ^6 | DOM matchers |
| @testing-library/user-event | ^14 | Симуляция пользовательских событий |
| MSW (Mock Service Worker) | ^2 | Мокирование HTTP запросов |
| jsdom | ^28 | DOM environment |
| @vitest/coverage-v8 | ^4.0 | Coverage репорты |

---

## Конфигурация

`vitest.config.ts` — корень репозитория.

**Ключевые настройки:**

```typescript
// Единый runner для всех workspace-ов
include: [
  'shared/**/*.{test,spec}.{ts,tsx}',
  'k-sebe-yoga-studioWEB/**/*.{test,spec}.{ts,tsx}',
  'k-sebe-yoga-studio-APPp/**/*.{test,spec}.{ts,tsx}',
]

// Supabase placeholder — MSW перехватывает все HTTP
env: {
  VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
}

// Path aliases
'@ksebe/shared' → './shared/index.ts'
'@web'          → './k-sebe-yoga-studioWEB'
'@app'          → './k-sebe-yoga-studio-APPp'
```

**Coverage** отключён по умолчанию (`enabled: false`) для быстрого CI.
Для отчёта: `npm run test:coverage`.

---

## Global Setup (`vitest.setup.ts`)

Выполняется перед всеми тестами:

- `@testing-library/jest-dom` — кастомные матчеры (`toBeInTheDocument`, `toHaveClass`, ...)
- **MSW сервер** — `beforeAll: server.listen()`, `afterEach: server.resetHandlers()`, `afterAll: server.close()`
- `window.matchMedia` mock
- `IntersectionObserver` mock
- `ResizeObserver` mock
- `window.scrollTo` mock

---

## Структура тест-файлов

```text
shared/
├── __tests__/
│   ├── mocks/           # MSW handlers и server setup
│   ├── components.test.tsx
│   ├── image.test.tsx
│   ├── imageStorage.test.ts
│   ├── marquee.test.tsx
│   └── utils.test.ts
├── components/
│   ├── Image/__tests__/
│   │   ├── AsanaAnalysisCard.test.tsx
│   │   └── utils.test.ts
│   └── __tests__/
│       ├── BackToTop.test.tsx
│       ├── CookieBanner.test.tsx
│       ├── Image.test.tsx
│       ├── NewComponents.test.tsx
│       ├── Paywall.test.tsx
│       └── UIComponents.test.tsx
├── hooks/__tests__/
│   ├── hooks.test.ts
│   ├── useAchievements.test.ts
│   ├── useGamification.test.ts
│   └── useIsAdmin.test.ts
├── services/__tests__/
│   ├── analytics.test.ts
│   └── monitoring.test.ts
└── utils/__tests__/
    ├── async.test.ts
    ├── formatting.test.ts
    ├── logger.test.ts
    └── webVitals.test.ts

k-sebe-yoga-studioWEB/
├── __tests__/Landing.test.tsx
├── components/__tests__/   (14 файлов: Blog, Booking, Breathwork, Chat, ...)
├── hooks/__tests__/         (useFocusTrap, useStudioContacts)
├── services/__tests__/      (contentStore, serviceWorker, theme)
└── viteConfig.test.ts

k-sebe-yoga-studio-APPp/
├── components/__tests__/   (AuthScreen, Dashboard, VideoLibrary)
├── context/__tests__/       (AuthContext, ToastContext)
├── hooks/__tests__/         (usePracticeCompletions, useStreak)
├── services/__tests__/      (dataService, gamification, gemini, retention, subscription, video)
├── utils/__tests__/         (practiceLog, streak)
└── viteConfig.test.ts
```

---

## Ключевые паттерны

### 1. `vi.hoisted` — для mock-переменных в фабриках

**Обязательно** если mock-переменная используется внутри `vi.mock()` factory:

```typescript
// ✅ Правильно
const mockFn = vi.hoisted(() => vi.fn());
vi.mock('../service', () => ({ fetchData: mockFn }));

// ❌ Падает — переменная не поднята в момент выполнения factory
const mockFn = vi.fn();
vi.mock('../service', () => ({ fetchData: mockFn }));
```

### 2. Пути в mock — относительно TEST файла

```typescript
// В файле: k-sebe-yoga-studio-APPp/services/__tests__/geminiService.test.ts
vi.mock('../geminiService');          // ✅ относительно test-файла
vi.mock('@ksebe/shared/services');    // ✅ через path alias
```

### 3. MSW для HTTP-запросов (Supabase, внешние API)

```typescript
// shared/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://placeholder.supabase.co/rest/v1/profiles', () =>
    HttpResponse.json([{ id: '1', name: 'Test' }])
  ),
];
```

MSW запущен глобально через `vitest.setup.ts`. Unhandled requests → `warn` (не `error`).

### 4. Auth-dependent компоненты — мокируй контекст

```typescript
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{ user: mockUser, logout: vi.fn() }}>
    {children}
  </AuthContext.Provider>
);

render(<Dashboard />, { wrapper });
```

### 5. Тест-дисциплина

- Тестируй поведение, не реализацию
- Один `describe` — один модуль / один компонент
- `beforeEach` — сброс состояния, `afterEach` — MSW resetHandlers (делается глобально)
- Для сложных async сценариев: `waitFor(() => expect(...).toBeTruthy())`
- Минимум один тест, который **падал бы до фикса**

---

## Команды

```bash
npm run test:run       # Быстрый запуск (CI default) — 473 тестов
npm run test           # Watch mode (локальная разработка)
npm run test:coverage  # С coverage репортом (медленнее)
npm run test:ui        # Vitest UI (визуальный браузерный интерфейс)
```

---

## Coverage thresholds (`vitest.config.ts`)

```typescript
thresholds: {
  lines:      30,
  functions:  30,
  branches:   20,
  statements: 30,
}
```

Цель: **70%** к Q4 2026. Текущее: ~35%.

---

## Известные особенности

- **monitoring.test.ts** генерирует MSW warnings о `sentry.io` — это ожидаемо (Sentry mock с `fake` DSN). Тесты зелёные, warnings информационные.
- **viteConfig.test.ts** в WEB и APP — проверяют конфигурацию Vite, не компоненты.
- Coverage **отключён по умолчанию** — `enabled: false`. CI не блокируется низким coverage.
