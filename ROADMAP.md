# Дорожная карта развития KateStudio

> **Дата анализа:** 22 декабря 2025
> **Версия проекта:** 1.0.0
> **Статус:** Production-ready с замечаниями

---

## Обзор проекта

**K Sebe Yoga Studio** — InsideFlow yoga ecosystem для студии Кати Габран "К себе". Монорепозиторий с двумя приложениями и общей библиотекой.

### Архитектура

```
KateStudio/
├── shared/                    # @ksebe/shared (12 компонентов, 28 типов, 28 утилит)
├── k-sebe-yoga-studioWEB/     # Landing page (30 компонентов, 3774 строк)
└── k-sebe-yoga-studio-APPp/   # PWA приложение (31 компонент, 5539 строк)
```

### Технологический стек

| Категория | Технологии |
|-----------|------------|
| Frontend | React 19.2, TypeScript 5.8, Vite 6.2 |
| Styling | Tailwind CSS (CDN + custom preset) |
| Backend | Supabase (Auth, Database, Storage) |
| AI | Google Gemini API (Chat, Vision, TTS, Image Gen) |
| Testing | Vitest 2.1.8 + React Testing Library |
| CI/CD | GitHub Actions, Firebase Hosting |

---

## Текущее состояние

### Общая оценка: 7.4/10

| Компонент | Оценка | Статус |
|-----------|--------|--------|
| Shared библиотека | 7.4/10 | Production с замечаниями |
| WEB приложение | 8/10 | Production-ready |
| APP приложение | 7/10 | Функционален, есть недоработки |
| Безопасность | 4/10 | Критические проблемы |
| Тестирование | 5/10 | Минимальное покрытие |
| Документация | 7/10 | Базовая (CLAUDE.md) |

---

## Выявленные проблемы

### Критические (Приоритет P0)

| # | Проблема | Расположение | Риск |
|---|----------|--------------|------|
| 1 | **API ключ Supabase в исходном коде** | `shared/services/supabase.ts:11-13` | Компрометация бэкенда |
| 2 | **Gemini API key в коде** | `APP/services/supabaseClient.ts:6` | Утечка квот API |
| 3 | **dangerouslySetInnerHTML без sanitize** | `shared/components/Blog.tsx:266` | XSS уязвимость |

### Высокие (Приоритет P1)

| # | Проблема | Расположение | Влияние |
|---|----------|--------------|---------|
| 4 | Отсутствует Service Worker | APP | Нет offline режима |
| 5 | Нет PWA manifest.json | APP | Не устанавливается как приложение |
| 6 | Неполное тестирование | Весь проект | 5/12 компонентов покрыто |
| 7 | AICoach.tsx слишком большой | APP (837 строк) | Сложность поддержки |
| 8 | Image.tsx слишком большой | Shared (490 строк) | Нарушает guidelines |

### Средние (Приоритет P2)

| # | Проблема | Влияние |
|---|----------|---------|
| 9 | Preview модели Gemini (3-pro-preview) | Могут стать недоступны |
| 10 | Veo видео-генерация не готова | Требует платный API |
| 11 | Нет обработки rate-limiting | Потенциальные ошибки |
| 12 | Дублирование конфигурации Supabase | constants.ts ↔ supabase.ts |
| 13 | Недостаточно хуков в shared | Нужны useLocalStorage, useMediaQuery |

### Низкие (Приоритет P3)

| # | Проблема | Влияние |
|---|----------|---------|
| 14 | Нет alt-текстов для всех изображений | Доступность |
| 15 | Модальные окна без aria-modal | Доступность |
| 16 | Schedule использует mock-данные | UX |
| 17 | Нет skip-links | Навигация с клавиатуры |
| 18 | Stone palette дублируется в preset | Размер бандла |

---

## Дорожная карта

### Фаза 1: Безопасность и стабильность

**Цель:** Устранить критические уязвимости и обеспечить надёжность

#### 1.1 Исправление безопасности API ключей

**Задачи:**
- [ ] Создать `.env.local` с шаблоном
- [ ] Перенести Supabase credentials из `shared/services/supabase.ts` в переменные окружения
- [ ] Перенести Gemini API key из `APP/services/supabaseClient.ts`
- [ ] Обновить `vite.config.ts` для корректной подстановки переменных
- [ ] Добавить `.env.local` в `.gitignore`
- [ ] Обновить CI/CD workflows для использования GitHub Secrets

**Файлы для изменения:**
```
shared/services/supabase.ts
k-sebe-yoga-studio-APPp/services/supabaseClient.ts
k-sebe-yoga-studioWEB/services/supabase.ts
.env.example
.gitignore
```

#### 1.2 XSS защита в Blog компоненте

**Задачи:**
- [ ] Установить DOMPurify: `npm install dompurify @types/dompurify`
- [ ] Заменить `dangerouslySetInnerHTML` на sanitized HTML
- [ ] Добавить тесты на XSS вектора

**Файлы для изменения:**
```
shared/components/Blog.tsx
shared/package.json
```

#### 1.3 Унификация конфигурации

**Задачи:**
- [ ] Централизовать Supabase URL в `shared/constants/index.ts`
- [ ] Удалить дублирование в сервисах
- [ ] Создать config.ts для runtime конфигурации

---

### Фаза 2: PWA и Offline поддержка

**Цель:** Сделать APP полноценным PWA

#### 2.1 PWA Manifest

**Задачи:**
- [ ] Создать `manifest.json` с icons, name, theme_color
- [ ] Добавить link в `index.html`
- [ ] Создать иконки всех размеров (72-512px)
- [ ] Настроить splash screens для iOS

**Файлы для создания:**
```
k-sebe-yoga-studio-APPp/public/manifest.json
k-sebe-yoga-studio-APPp/public/icons/
```

#### 2.2 Service Worker

**Задачи:**
- [ ] Установить workbox: `npm install workbox-cli -D`
- [ ] Создать стратегию кеширования (Cache First для статики, Network First для API)
- [ ] Реализовать offline fallback страницу
- [ ] Добавить обновление уведомлений

**Файлы для создания:**
```
k-sebe-yoga-studio-APPp/src/sw.ts
k-sebe-yoga-studio-APPp/public/offline.html
```

#### 2.3 Offline-first архитектура

**Задачи:**
- [ ] IndexedDB для кеширования данных пользователя
- [ ] Background Sync для отложенных операций
- [ ] Graceful degradation UI при отсутствии сети

---

### Фаза 3: Качество кода и тестирование

**Цель:** Увеличить покрытие тестами до 80%, улучшить maintainability

#### 3.1 Рефакторинг больших компонентов

**AICoach.tsx (837 → ~200 строк каждый):**
- [ ] Выделить `AICoachChat.tsx` — текстовый чат
- [ ] Выделить `AICoachVision.tsx` — анализ поз
- [ ] Выделить `AICoachMeditation.tsx` — медитации
- [ ] Выделить `AICoachCreate.tsx` — генерация контента
- [ ] Создать `useAICoach.ts` хук для общей логики

**Image.tsx (490 → ~150 строк каждый):**
- [ ] Выделить `ImageUploader.tsx` — загрузка файлов
- [ ] Выделить `ImageAnalyzer.tsx` — AI анализ
- [ ] Выделить `useImageStorage.ts` — логика хранения

#### 3.2 Расширение тестового покрытия

**Компоненты для покрытия:**
- [ ] Image (unit + integration)
- [ ] Breathwork (animation states)
- [ ] Pricing (click handlers)
- [ ] Blog (modal, XSS protection)
- [ ] Marquee (animation)
- [ ] ScrollProgress (scroll events)

**Сервисы для покрытия:**
- [ ] geminiService (mock API calls)
- [ ] supabase (mock client)
- [ ] dataService (localStorage + Supabase)

**Новые тесты:**
```
shared/__tests__/Image.test.tsx
shared/__tests__/services/supabase.test.ts
k-sebe-yoga-studio-APPp/__tests__/AICoach.test.tsx
k-sebe-yoga-studio-APPp/__tests__/services/geminiService.test.ts
```

#### 3.3 Дополнительные хуки

**Создать в `shared/hooks/`:**
- [ ] `useLocalStorage.ts` — type-safe localStorage
- [ ] `useMediaQuery.ts` — responsive logic
- [ ] `useDebounce.ts` — debounced value
- [ ] `usePrevious.ts` — previous value reference
- [ ] `useOnlineStatus.ts` — network detection

---

### Фаза 4: Улучшение UX и доступности

**Цель:** WCAG 2.1 AA compliance, улучшение мобильного опыта

#### 4.1 Доступность (a11y)

**Задачи:**
- [ ] Audit с axe-core или Lighthouse
- [ ] Добавить aria-modal на все модальные окна
- [ ] Добавить skip-links в Header
- [ ] Проверить цветовой контраст (особенно brand-green)
- [ ] Добавить alt-тексты для всех изображений
- [ ] Улучшить focus indicators

**Файлы для изменения:**
```
shared/components/Blog.tsx (modal)
k-sebe-yoga-studioWEB/components/BookingModal.tsx
k-sebe-yoga-studioWEB/components/Gallery.tsx
k-sebe-yoga-studio-APPp/components/AICoach.tsx
```

#### 4.2 SEO для WEB

**Задачи:**
- [ ] Генерация отдельных страниц для блога (SSG)
- [ ] Добавить canonical URLs
- [ ] Улучшить structured data (Schema.org)
- [ ] Добавить sitemap.xml
- [ ] Оптимизировать Core Web Vitals (LCP, CLS, FID)

#### 4.3 Улучшение мобильного опыта

**Задачи:**
- [ ] Haptic feedback на кнопках (Vibration API)
- [ ] Pull-to-refresh в APP
- [ ] Swipe gestures для навигации
- [ ] Оптимизация изображений (WebP, srcset)

---

### Фаза 5: Новая функциональность

**Цель:** Расширение возможностей платформы

#### 5.1 Интеграция с платежами

**Задачи:**
- [ ] Интеграция YooKassa или Stripe
- [ ] Страница оплаты абонемента
- [ ] Webhook для подтверждения платежей
- [ ] История транзакций в профиле

#### 5.2 Реальное расписание

**Задачи:**
- [ ] Создать таблицу `classes` в Supabase
- [ ] Admin интерфейс для управления расписанием
- [ ] Real-time обновления (уже есть subscriptions)
- [ ] Push уведомления о занятиях

#### 5.3 Veo видео-генерация

**Задачи:**
- [ ] Получить платный API ключ Google AI Studio
- [ ] Реализовать polling операций
- [ ] UI для выбора параметров видео
- [ ] Галерея сгенерированных видео

#### 5.4 Расширение AI возможностей

**Задачи:**
- [ ] Персональные программы тренировок
- [ ] AI анализ прогресса (история практик)
- [ ] Голосовой ассистент (Live API)
- [ ] Рекомендации на основе настроения

---

## Метрики успеха

### Технические KPI

| Метрика | Текущее | Цель |
|---------|---------|------|
| Test coverage | ~15% | 80% |
| Lighthouse Performance (WEB) | ~70 | 90+ |
| Lighthouse Accessibility | ~85 | 100 |
| Bundle size (APP) | ~245KB | <200KB |
| Time to Interactive | ~3s | <2s |
| Security vulnerabilities | 3 critical | 0 |

### Бизнес KPI

| Метрика | Измерение |
|---------|-----------|
| PWA installs | Analytics events |
| AI Coach sessions | Supabase logs |
| Booking conversions | Funnel analytics |
| User retention | DAU/MAU |

---

## Приоритизация задач

### Матрица приоритетов

```
         Высокое влияние
              ▲
              │
   P1         │         P0
   Фаза 3     │    Фаза 1 (Безопасность)
   (Тесты)    │
              │
─────────────────────────────────► Срочность
              │
   P3         │         P2
   Фаза 4     │    Фаза 2 (PWA)
   (UX)       │
              │
         Низкое влияние
```

### Рекомендуемый порядок

1. **Немедленно (Фаза 1):** Безопасность API ключей
2. **Краткосрочно (Фаза 2):** PWA и offline
3. **Среднесрочно (Фаза 3):** Рефакторинг и тесты
4. **Долгосрочно (Фаза 4-5):** UX и новые фичи

---

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Gemini API deprecation | Средняя | Высокое | Fallback на OpenAI/Claude |
| Supabase outage | Низкая | Высокое | localStorage fallback (уже есть) |
| Breaking changes React 19 | Низкая | Среднее | Pin versions, тесты |
| API key compromise | Высокая (сейчас) | Критичное | Фаза 1 — срочно |

---

## Заключение

KateStudio — хорошо структурированный проект с современным стеком. Основные области для улучшения:

1. **Безопасность** — критически важно исправить утечку API ключей
2. **PWA** — превращение APP в полноценное мобильное приложение
3. **Качество** — рефакторинг больших компонентов, увеличение тестового покрытия
4. **UX** — доступность и производительность

Следуя этой дорожной карте, проект может достичь production-grade качества и обеспечить отличный пользовательский опыт для студии йоги "К себе".

---

*Документ создан автоматически на основе анализа кодовой базы*
