# Дорожная карта развития KateStudio

> **Дата обновления:** 24 декабря 2025 **Версия проекта:** 1.1.0 **Статус:**
> Production с активным развитием

---

## Обзор проекта

**K Sebe Yoga Studio** — InsideFlow yoga ecosystem для студии Кати Габран "К
себе". Монорепозиторий с двумя приложениями и общей библиотекой.

### Архитектура

```
KateStudio/
├── shared/                    # @ksebe/shared (8 компонентов, 25+ типов, 28 утилит)
├── k-sebe-yoga-studioWEB/     # Landing page (30 компонентов, PWA manifest)
└── k-sebe-yoga-studio-APPp/   # PWA приложение (37 компонентов, offline-first)
```

### Технологический стек

| Категория | Технологии                                       |
| --------- | ------------------------------------------------ |
| Frontend  | React 19.2, TypeScript 5.8, Vite 6.2             |
| Styling   | Tailwind CSS (CDN + custom preset)               |
| Backend   | Supabase (Auth, Database, Storage, Realtime)     |
| AI        | Google Gemini API (Chat, Vision, TTS, Image Gen) |
| Testing   | Vitest 2.1.8 + React Testing Library             |
| CI/CD     | GitHub Actions, GitHub Pages                     |
| Offline   | Service Worker, IndexedDB, localStorage          |

---

## Текущее состояние (Декабрь 2025)

### Общая оценка: 7.8/10

| Компонент         | Оценка | Статус                    |
| ----------------- | ------ | ------------------------- |
| Shared библиотека | 9.2/10 | Production-ready          |
| WEB приложение    | 8.5/10 | Production (GitHub Pages) |
| APP приложение    | 8.5/10 | Production с offline      |
| PWA               | 9/10   | Manifest + SW             |
| Безопасность      | 6/10   | Требует внимания          |
| Тестирование      | 4/10   | Минимальное покрытие      |
| Документация      | 8/10   | Хорошая (CLAUDE.md)       |

### Недавние улучшения ✅

- [x] PWA manifest с standalone режимом
- [x] Service Worker с network-first для JS/CSS
- [x] Реальные фотографии в Hero, About, Directions, Gallery
- [x] Исправлены пути изображений для GitHub Pages
- [x] iOS PWA мета-теги для fullscreen

---

## Результаты аудита

### WEB (Landing Page)

| Аспект        | Оценка    | Детали                              |
| ------------- | --------- | ----------------------------------- |
| Компоненты    | 30        | Hero, About, Schedule, Gallery, etc |
| AI-интеграция | 6 режимов | Chat, Vision, Meditation, Art, etc  |
| PWA           | ✅        | manifest.json + SW                  |
| SEO           | 8/10      | Schema.org, OG tags                 |
| Доступность   | 7/10      | Focus visible, scroll behavior      |

**Критические находки:**

- Gemini API key экспонирован в frontend (контролируется rate limiting)
- ChatWidget.tsx: 700+ строк (требует рефакторинга)
- Отсутствуют: favicon.png, apple-touch-icon.png, og-image.jpg

### APP (PWA Dashboard)

| Аспект          | Оценка   | Детали                                                                      |
| --------------- | -------- | --------------------------------------------------------------------------- |
| Компоненты      | 37       | Dashboard, AICoach, VideoLib                                                |
| Offline-support | ✅       | IndexedDB + localStorage                                                    |
| Auth            | ⚠️       | Локальный профиль (phone) + Supabase таблицы (без OTP/сессий Supabase Auth) |
| AI-интеграция   | 4 режима | Chat, Vision, Meditation, Create                                            |
| Sync            | ✅       | Realtime subscriptions                                                      |

**Критические находки:**

- ChatWidget.tsx: 800+ строк (требует рефакторинга)
- Дублирование AuthContext (можно вынести в shared)
- Неиспользуемый useLocalStorage hook

### Shared Library

| Аспект     | Количество | Качество      |
| ---------- | ---------- | ------------- |
| Компоненты | 8          | Production    |
| Hooks      | 5          | Documented    |
| Services   | 2          | Typed         |
| Types      | 25+        | Comprehensive |
| Utils      | 28         | Well-tested   |
| Constants  | 4 модуля   | Brand-aligned |

**Оценка: 92/100** - хорошо структурирована

---

## Исследование индустрии

### Лидеры рынка йога-приложений 2025

| Платформа     | Модель          | Сильные стороны                  | Применимо для K Sebe     |
| ------------- | --------------- | -------------------------------- | ------------------------ |
| **Alo Moves** | $12.99/мес      | 4000+ классов, 70 инструкторов   | Масштабирование контента |
| **Down Dog**  | $9.99/мес       | AI-генерация последовательностей | Персонализация AI        |
| **Glo**       | $30/мес         | Premium позиционирование         | Высокий ARPU             |
| **Mindbody**  | B2B SaaS        | Бронирование, платежи, CRM       | Интеграция расписания    |
| **ClassPass** | Credits система | Multi-studio marketplace         | Партнёрства              |

### Inside Flow экосистема

| Ресурс               | Функционал                      |
| -------------------- | ------------------------------- |
| insideflow.com       | Официальный сайт, тренинги      |
| Inside Flow Academy  | Сертификация, levels система    |
| Young Ho Kim YouTube | Бесплатный контент, продвижение |

### Ключевые инсайты

1. **Персонализация** — Down Dog генерирует уникальную практику каждый раз
2. **Уровни сложности** — Inside Flow Academy использует Credits/Levels
3. **Subscription tiers** — Freemium → Premium → VIP (консультации)
4. **Community** — Insight Timer: 17000+ учителей, социальные функции
5. **Offline** — Glo позволяет скачивать видео для offline

---

## "Что если?" — Стратегическое мышление

### Сценарий A: AI-First Studio

> Что если K Sebe станет первой полностью AI-персонализированной йога-студией?

- Aria генерирует уникальную практику под настроение/цели
- AI-анализ прогресса по видео со временем
- Голосовой ассистент во время практики
- AI-подбор музыки для Inside Flow

### Сценарий B: Inside Flow Academy RU

> Что если создать русскоязычную сертификацию Inside Flow?

- Партнёрство с Inside Flow International
- Онлайн-обучение преподавателей
- Marketplace для сертифицированных учителей
- White-label решение для студий

### Сценарий C: Lifestyle Ecosystem

> Что если расширить экосистему за пределы йоги?

- Интеграция с трекерами сна (Apple Health, Google Fit)
- Mindful eating / рецепты
- Медитации для бизнеса (B2B)
- Retreats marketplace

### Сценарий D: Freemium Scale

> Что если выйти на 100K+ пользователей?

- Бесплатный AI-чат без ограничений
- 3 видео в неделю бесплатно
- Premium: полный доступ + offline
- VIP: личные консультации с Катей

---

## Детализированная дорожная карта

### Фаза 1: Стабилизация и безопасность

**Цель:** Устранить критические проблемы, укрепить фундамент

#### 1.1 Безопасность API ключей

**Текущее состояние:** API ключи в коде (контролируется rate limiting)

**Задачи:**

- [ ] Создать Supabase Edge Function для проксирования Gemini API
- [ ] Перенести API ключи в Supabase secrets
- [ ] Обновить frontend для использования Edge Function
- [ ] Добавить rate limiting на уровне пользователя

**Файлы:**

```
supabase/functions/gemini-proxy/index.ts (новый)
k-sebe-yoga-studioWEB/services/aiService.ts (обновить)
k-sebe-yoga-studio-APPp/services/geminiService.ts (обновить)
```

#### 1.2 Добавить недостающие assets

**Задачи:**

- [ ] Создать favicon.png (192x192)
- [ ] Создать apple-touch-icon.png (180x180)
- [ ] Создать og-image.jpg (1200x630)
- [ ] Добавить иконки для PWA (72-512px)

**Файлы:**

```
k-sebe-yoga-studioWEB/public/favicon.png
k-sebe-yoga-studioWEB/public/apple-touch-icon.png
k-sebe-yoga-studioWEB/public/og-image.jpg
k-sebe-yoga-studioWEB/public/icons/ (папка)
```

#### 1.3 Рефакторинг больших компонентов

**ChatWidget.tsx (WEB) — 700 → 200 строк:**

- [ ] Выделить `ChatInput.tsx` — ввод сообщений
- [ ] Выделить `ChatMessages.tsx` — список сообщений
- [ ] Выделить `ChatModeSelector.tsx` — выбор режима
- [ ] Создать `useChatWidget.ts` — логика чата

**ChatWidget.tsx (APP) — 800 → 200 строк:**

- [ ] Выделить `ChatInput.tsx` — ввод сообщений
- [ ] Выделить `ChatMessages.tsx` — список сообщений
- [ ] Выделить `ChatModeSelector.tsx` — выбор режима
- [ ] Создать `useChatWidget.ts` — логика чата

---

### Фаза 2: Улучшение пользовательского опыта

**Цель:** Повысить вовлечённость и удержание

#### 2.1 Геймификация

**Задачи:**

- [ ] Система достижений (badges)
- [ ] Streak-трекинг практик
- [ ] Уровни мастерства (Beginner → Advanced)
- [ ] Leaderboard (опционально)

**Новые компоненты:**

```
shared/components/Achievements.tsx
shared/components/ProgressTracker.tsx
shared/hooks/useStreak.ts
```

#### 2.2 Push-уведомления

**Задачи:**

- [ ] Интеграция Firebase Cloud Messaging
- [ ] Напоминания о занятиях
- [ ] Мотивационные пуши
- [ ] Новости о ретритах

**Файлы:**

```
k-sebe-yoga-studio-APPp/services/pushService.ts
k-sebe-yoga-studio-APPp/public/firebase-messaging-sw.js
```

#### 2.3 Улучшение offline-режима

**Задачи:**

- [ ] Скачивание видео для offline просмотра
- [ ] Offline-доступ к расписанию
- [ ] Background sync для бронирований
- [ ] Graceful degradation UI

---

### Фаза 3: Монетизация

**Цель:** Внедрить устойчивую бизнес-модель

#### 3.1 Подписочные планы

| План    | Цена/мес | Функции                          |
| ------- | -------- | -------------------------------- |
| Free    | 0₽       | AI-чат, 3 видео/неделю           |
| Premium | 990₽     | Все видео, offline, без рекламы  |
| VIP     | 2990₽    | + Личные консультации, приоритет |

**Задачи:**

- [ ] Интеграция YooKassa/Stripe
- [ ] Paywall компонент
- [ ] Управление подписками в профиле
- [ ] Webhooks для подтверждения платежей

**Файлы:**

```
shared/components/Paywall.tsx
k-sebe-yoga-studio-APPp/services/paymentService.ts
supabase/functions/payment-webhook/index.ts
```

#### 3.2 Реальное расписание

**Задачи:**

- [ ] CRUD для занятий в Supabase
- [ ] Admin интерфейс для Кати
- [ ] Real-time обновления (уже есть subscriptions)
- [ ] Интеграция с Google Calendar

**Supabase schema:**

```sql
create table classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text default 'Катя Габран',
  type text check (type in ('inside-flow', 'hatha', 'meditation')),
  starts_at timestamptz not null,
  duration_minutes int default 60,
  max_participants int default 15,
  current_participants int default 0,
  price int,
  created_at timestamptz default now()
);
```

---

### Фаза 4: Расширение AI-возможностей

**Цель:** Усилить AI-дифференциацию

#### 4.1 Персональные программы

**Задачи:**

- [ ] AI-генерация 7-дневных программ
- [ ] Адаптация под цели (гибкость, сила, релакс)
- [ ] Учёт уровня и истории практик
- [ ] Прогресс-трекинг выполнения

#### 4.2 Live Voice Coach

**Задачи:**

- [ ] Интеграция Gemini Live API
- [ ] Голосовое сопровождение практики
- [ ] Real-time коррекция техники
- [ ] Голосовые команды управления

#### 4.3 AI-аналитика прогресса

**Задачи:**

- [ ] Анализ фото асан со временем
- [ ] Визуализация улучшений
- [ ] Рекомендации на основе прогресса
- [ ] Weekly/monthly отчёты

---

### Фаза 5: Масштабирование

**Цель:** Подготовка к росту аудитории

#### 5.1 Performance-оптимизация

**Задачи:**

- [ ] Lazy loading для всех роутов
- [ ] Image optimization (WebP, srcset)
- [ ] CDN для видеоконтента
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1

#### 5.2 Тестирование

**Цель:** 80% coverage

**Задачи:**

- [ ] Unit тесты для shared компонентов
- [ ] Integration тесты для сервисов
- [ ] E2E тесты для критических flows
- [ ] Visual regression (Chromatic)

**Приоритетные тесты:**

```
shared/__tests__/
├── components/
│   ├── Pricing.test.tsx
│   ├── Blog.test.tsx
│   └── Breathwork.test.tsx
├── hooks/
│   └── useScrollLock.test.ts
└── utils/
    └── cn.test.ts
```

#### 5.3 Документация

**Задачи:**

- [ ] Storybook для компонентов
- [ ] API документация (TypeDoc)
- [ ] Onboarding guide для разработчиков
- [ ] Architecture Decision Records (ADRs)

---

## Метрики успеха

### Технические KPI

| Метрика                | Текущее | Цель (Q1 2026) |
| ---------------------- | ------- | -------------- |
| Lighthouse Performance | ~75     | 90+            |
| Lighthouse A11y        | ~85     | 100            |
| Test coverage          | ~15%    | 80%            |
| Bundle size (APP)      | ~250KB  | <200KB         |
| TTI                    | ~3s     | <2s            |
| Service Worker uptime  | 95%     | 99.5%          |

### Бизнес KPI

| Метрика          | Измерение          | Цель (Q2 2026) |
| ---------------- | ------------------ | -------------- |
| PWA installs     | Analytics events   | 5000+          |
| DAU/MAU          | Supabase analytics | 30%            |
| AI sessions/user | Logs               | 10+/мес        |
| Conversion rate  | Free → Premium     | 5%             |
| Retention D30    | Cohort analysis    | 40%            |

---

## Приоритизация

### Матрица срочности/влияния

```
         Высокое влияние
              ▲
              │
   Фаза 3     │    Фаза 1
   Монетизация│    Безопасность
              │    + Assets
              │
─────────────────────────────────► Срочность
              │
   Фаза 5     │    Фаза 2
   Масштаб    │    UX + PWA
              │
         Низкое влияние
```

### Рекомендуемый порядок

1. **Немедленно:** Фаза 1.2 (Assets) — блокирует визуальное качество
2. **Q1 2026:** Фаза 1.1, 1.3 (Безопасность, рефакторинг)
3. **Q2 2026:** Фаза 2 (UX), Фаза 3.2 (Расписание)
4. **Q3 2026:** Фаза 3.1 (Платежи), Фаза 4 (AI)
5. **Q4 2026:** Фаза 5 (Масштабирование)

---

## Риски и митигация

| Риск                   | Вероятность | Влияние | Митигация                      |
| ---------------------- | ----------- | ------- | ------------------------------ |
| Gemini API deprecation | Средняя     | Высокое | Fallback на Claude/GPT-4       |
| Rate limit exceeded    | Высокая     | Среднее | Кеширование, Edge Functions    |
| Supabase outage        | Низкая      | Высокое | Offline-first уже есть         |
| Payment integration    | Средняя     | Высокое | Начать с простого (YooKassa)   |
| User churn             | Средняя     | Высокое | Push-уведомления, геймификация |

---

## Заключение

KateStudio — хорошо структурированный проект с уникальным позиционированием в
нише Inside Flow. Основные направления развития:

1. **Стабильность** — Assets, безопасность, рефакторинг
2. **Монетизация** — Подписки, реальное расписание
3. **AI-дифференциация** — Live coach, персонализация
4. **Масштаб** — Performance, тесты, документация

Проект готов к переходу от MVP к полноценному продукту с устойчивой
бизнес-моделью.

---

_Документ обновлён: 24 декабря 2025_ _Автор: Claude Opus 4.5_
