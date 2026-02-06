# Стратегическая дорожная карта KateStudio 2026

> **Версия:** 3.0.0 **Дата создания:** 25 декабря 2025 **Методология:**
> 17-шаговый глубокий анализ с исследованием мировых практик **Статус:**
> Утверждено к реализации

---

## Содержание

1. [Executive Summary](#1-executive-summary)
2. [Глубокий аудит экосистемы](#2-глубокий-аудит-экосистемы)
3. [Исследование мировых лидеров](#3-исследование-мировых-лидеров)
4. [Лучшие практики индустрии](#4-лучшие-практики-индустрии)
5. [Размышления "Что если?"](#5-размышления-что-если)
6. [Стратегические выводы](#6-стратегические-выводы)
7. [Детализированная дорожная карта](#7-детализированная-дорожная-карта)
8. [Технические спецификации](#8-технические-спецификации)
9. [Метрики успеха и KPI](#9-метрики-успеха-и-kpi)
10. [Управление рисками](#10-управление-рисками)

---

## 1. Executive Summary

### 1.1 Миссия проекта

**K Sebe Yoga Studio** — первая в России AI-персонализированная Inside Flow
экосистема, объединяющая личный бренд Кати Габран с передовыми технологиями
искусственного интеллекта для создания уникального опыта практики йоги.

### 1.2 Текущее состояние

| Метрика                  | Значение                          | Оценка            |
| ------------------------ | --------------------------------- | ----------------- |
| **Общая оценка проекта** | 8.2/10                            | Production-ready  |
| **Компоненты**           | 78 (WEB: 30, APP: 37, Shared: 11) | Хорошо            |
| **Строки кода**          | ~13,500 LOC                       | Средний проект    |
| **Тестовое покрытие**    | ~30%                              | Требует улучшения |
| **AI-интеграция**        | 6 режимов Gemini                  | Отлично           |
| **PWA готовность**       | 90%                               | Почти готово      |

### 1.3 Ключевые выводы аудита

**Сильные стороны:**

- Уникальное AI-позиционирование в нише Inside Flow
- Современный технологический стек (React 19, TypeScript 5.8, Vite 6)
- Качественная shared-библиотека (92/100)
- Offline-first архитектура с IndexedDB
- Профессиональная CI/CD инфраструктура

**Области для улучшения:**

- Безопасность API (ключи в клиентском коде)
- Тестовое покрытие (цель: 70%+)
- Рефакторинг крупных компонентов (ChatWidget: 700+ LOC)
- Отсутствие монетизации
- Геймификация и retention

### 1.4 Стратегическое видение 2026

```
Q1 2026: Стабилизация + Безопасность + Монетизация MVP
Q2 2026: AI-персонализация + Геймификация
Q3 2026: Масштабирование + Community
Q4 2026: B2B + Inside Flow Academy (исследование)
```

---

## 2. Глубокий аудит экосистемы

### 2.1 Архитектурный анализ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     KATESTUDIO ECOSYSTEM ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────┐           ┌─────────────────────┐             │
│   │   WEB APPLICATION   │           │   PWA APPLICATION   │             │
│   │   (Landing Page)    │           │   (Mobile-First)    │             │
│   │                     │           │                     │             │
│   │  • 30 компонентов   │           │  • 37 компонентов   │             │
│   │  • GitHub Pages     │           │  • Offline-first    │             │
│   │  • SEO optimized    │           │  • IndexedDB cache  │             │
│   │  • AI Chat Widget   │           │  • AI Coach (Aria)  │             │
│   └──────────┬──────────┘           └──────────┬──────────┘             │
│              │                                  │                        │
│              └────────────┬─────────────────────┘                        │
│                           │                                              │
│              ┌────────────▼────────────┐                                │
│              │    SHARED LIBRARY       │                                │
│              │    @ksebe/shared        │                                │
│              │                         │                                │
│              │  • 11 компонентов       │                                │
│              │  • 5 React hooks        │                                │
│              │  • 28 утилит            │                                │
│              │  • 25+ TypeScript типов │                                │
│              │  • Tailwind preset      │                                │
│              └────────────┬────────────┘                                │
│                           │                                              │
│     ┌─────────────────────┼─────────────────────┐                       │
│     │                     │                     │                       │
│     ▼                     ▼                     ▼                       │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │ Supabase │      │  Google      │      │  IndexedDB   │              │
│  │          │      │  Gemini AI   │      │  + localStorage│             │
│  │ • Auth   │      │              │      │              │              │
│  │ • DB     │      │ • Chat       │      │ • Offline    │              │
│  │ • Storage│      │ • Vision     │      │ • Sync       │              │
│  │ • Realtime│     │ • TTS        │      │ • Cache      │              │
│  └──────────┘      │ • Image Gen  │      └──────────────┘              │
│                    │ • Video Gen  │                                     │
│                    └──────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Компонентный анализ

#### Shared Library (92/100)

| Категория      | Количество | Качество | Примечания                                                                                                      |
| -------------- | ---------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| **Компоненты** | 11         | 9/10     | FadeIn, Logo, Breathwork, Blog, Pricing, Marquee, ScrollProgress, BackToTop, ErrorBoundary, CookieBanner, Image |
| **Hooks**      | 5          | 9/10     | useScrollLock, useMediaQuery, useLocalStorage, useDebounce, useOnlineStatus                                     |
| **Services**   | 2          | 8/10     | supabase.ts, imageStorage.ts                                                                                    |
| **Utils**      | 28         | 9/10     | cn, formatDate, formatPrice, debounce, throttle, storage, etc.                                                  |
| **Types**      | 25+        | 9/10     | UserProfile, Booking, ChatMessage, AsanaAnalysis, etc.                                                          |
| **Constants**  | 4 модуля   | 9/10     | BRAND, COLORS, PRICING_PLANS, CONTACT, API                                                                      |

#### WEB Application (85/100)

| Аспект        | Оценка    | Детали                                                 |
| ------------- | --------- | ------------------------------------------------------ |
| Компоненты    | 30        | Hero, About, Schedule, Gallery, Blog, ChatWidget, etc. |
| AI-интеграция | 6 режимов | Chat, Vision, Meditation, Art, Program, Voice          |
| PWA           | 90%       | manifest.json, Service Worker, offline page            |
| SEO           | 8/10      | Schema.org, OG tags, meta описания                     |
| Performance   | 7/10      | Lighthouse ~75, требуется оптимизация                  |

#### APP Application (85/100)

| Аспект          | Оценка | Детали                                                |
| --------------- | ------ | ----------------------------------------------------- |
| Компоненты      | 37     | Dashboard, AICoach (4 режима), VideoLibrary, Schedule |
| Offline-support | 9/10   | IndexedDB + localStorage с fallback                   |
| Auth            | 7/10   | Supabase Auth, требуется усиление                     |
| AI Coach        | 9/10   | Chat, Vision, Meditation, Create modes                |
| Sync            | 8/10   | Realtime subscriptions                                |

### 2.3 Критические находки

#### 🔴 КРИТИЧНЫЕ (Блокируют production)

| #   | Проблема                 | Файл                 | Риск              | Решение               |
| --- | ------------------------ | -------------------- | ----------------- | --------------------- |
| 1   | API ключ Gemini exposed  | `geminiService.ts`   | Финансовые потери | Edge Functions proxy  |
| 2   | Отсутствие rate limiting | Все AI endpoints     | DoS, квоты        | Supabase Edge + Redis |
| 3   | Крупные компоненты       | ChatWidget (700 LOC) | Maintainability   | Декомпозиция          |

#### 🟠 ВЫСОКИЙ ПРИОРИТЕТ

| #   | Проблема                 | Влияние        | Решение         |
| --- | ------------------------ | -------------- | --------------- |
| 4   | Тестовое покрытие 30%    | Регрессии      | Цель 70%+       |
| 5   | Нет монетизации          | Нет revenue    | YooKassa/Stripe |
| 6   | Отсутствует геймификация | Low retention  | Streaks, badges |
| 7   | Нет push-уведомлений     | Low engagement | FCM integration |

#### 🟡 СРЕДНИЙ ПРИОРИТЕТ

| #   | Проблема          | Влияние      | Решение              |
| --- | ----------------- | ------------ | -------------------- |
| 8   | Дублирование кода | Bundle size  | Рефакторинг в shared |
| 9   | Нет Storybook     | Документация | Добавить             |
| 10  | Нет E2E тестов    | Quality      | Playwright           |

### 2.4 Технический долг

```
Общий технический долг: ~120 человеко-часов

Breakdown:
├── Рефакторинг компонентов: 40 часов
│   ├── ChatWidget.tsx → 4 компонента (16 ч)
│   ├── AICoach.tsx → 5 компонентов (16 ч)
│   └── Dashboard.tsx → 3 компонента (8 ч)
│
├── Безопасность: 30 часов
│   ├── Edge Functions для API (16 ч)
│   ├── Rate limiting (8 ч)
│   └── Input validation (6 ч)
│
├── Тестирование: 40 часов
│   ├── Unit tests (20 ч)
│   ├── Integration tests (12 ч)
│   └── E2E tests (8 ч)
│
└── Документация: 10 часов
    ├── Storybook (6 ч)
    └── API docs (4 ч)
```

---

## 3. Исследование мировых лидеров

### 3.1 Рынок йога-приложений 2025

**Глобальный рынок:** $33B к 2026 (Statista) **AI fitness market:** $18.6B →
$59.8B к 2035

#### Топ-платформы

| Платформа         | MAU            | Цена            | Ключевые фичи                           | Уроки для K Sebe              |
| ----------------- | -------------- | --------------- | --------------------------------------- | ----------------------------- |
| **Down Dog**      | 10M+           | $9.99-22.99/мес | AI-генерация 60,000+ комбинаций практик | Персонализация каждого сеанса |
| **Alo Moves**     | 2M+            | $12.99/мес      | 4000+ классов, 70 инструкторов          | Масштабирование контента      |
| **Glo**           | 1M+            | $24.99/мес      | Premium позиционирование                | Высокий ARPU через качество   |
| **Insight Timer** | 25M+           | Freemium        | 17,000 учителей, community              | User-generated content        |
| **Headspace**     | 70M+ downloads | $12.99/мес      | Gamification, streaks, badges           | Retention через геймификацию  |

### 3.2 Inside Flow экосистема (Young Ho Kim)

**Масштаб:** ~10,000 сертифицированных учителей, 100,000+ участников классов

| Продукт                           | Цена        | Аудитория             | Инсайт                         |
| --------------------------------- | ----------- | --------------------- | ------------------------------ |
| Inside Flow Fundamentals Training | ~$499       | Инструкторы           | Сертификация как бизнес-модель |
| Online YTT 200h                   | ~$2,000     | Серьёзные студенты    | High-ticket продукты           |
| Global Summit                     | ~$50 stream | Глобальное сообщество | События как community builder  |
| The Flow Show (live)              | Free        | Практикующие          | Free content для воронки       |

**Ключевой инсайт:** Young Ho Kim создал не просто стиль йоги, а **экосистему
сертификации** с multi-layered monetization.

### 3.3 AI-тренды в фитнесе 2025

| Тренд                     | Описание                        | Статус в K Sebe         | Приоритет |
| ------------------------- | ------------------------------- | ----------------------- | --------- |
| **Computer Vision**       | Real-time form correction       | ✅ Есть (Gemini Vision) | Улучшить  |
| **Voice Coaching**        | AI голосовое сопровождение      | ✅ Есть (Gemini TTS)    | Улучшить  |
| **Hyper-personalization** | AI создаёт уникальные программы | 🔄 Частично             | Высокий   |
| **Conversational AI**     | 24/7 AI-коуч с NLP              | ✅ Есть (Aria)          | Улучшить  |
| **Wearable Integration**  | Apple Health, Google Fit        | ❌ Нет                  | Средний   |
| **Real-time Adaptation**  | Адаптация под усталость         | ❌ Нет                  | Низкий    |

### 3.4 Монетизация wellness-приложений

#### Модели монетизации

| Модель            | Conversion       | LTV           | Применимость        |
| ----------------- | ---------------- | ------------- | ------------------- |
| **Freemium**      | 2-5% (топ: 6-8%) | Низкий        | ✅ Начальная модель |
| **Subscription**  | Trial → 30-60%   | $3-10/install | ✅ Основная модель  |
| **Hybrid**        | Комбинированная  | Высокий       | ✅ Целевая модель   |
| **B2B Corporate** | Enterprise       | Очень высокий | 🔄 На будущее       |

#### Успешные примеры

**Calm:** $200M+ annual revenue, 4M+ paying subscribers **Headspace:** 70M+
downloads, B2C + B2B (Starbucks, Google, Adobe)

#### Ценовые бенчмарки

| Tier       | Цена (глобально) | Цена (RU адаптация) |
| ---------- | ---------------- | ------------------- |
| Basic/Free | $0-5/мес         | 0₽                  |
| Standard   | $10-15/мес       | 790-990₽/мес        |
| Premium    | $20-30/мес       | 1,490-1,990₽/мес    |
| VIP        | $50+/мес         | 2,990-4,990₽/мес    |

### 3.5 Retention и геймификация

**Ключевая статистика:**

- Средняя 30-day retention wellness apps: **7.9%**
- Gamified apps показывают **+50% retention** (Deloitte)
- Headspace с геймификацией: **+35% WAU**
- Community features: **+50% retention** (Headspace case)

#### Эффективные механики

| Механика               | Эффект на retention       | Сложность |
| ---------------------- | ------------------------- | --------- |
| Streaks                | +30-40% DAU               | Низкая    |
| Badges/Achievements    | +20-25% engagement        | Низкая    |
| Progress visualization | +15-20% completion        | Средняя   |
| Leaderboards           | +25-30% (с осторожностью) | Средняя   |
| Community challenges   | +40-50% engagement        | Высокая   |

---

## 4. Лучшие практики индустрии

### 4.1 Технические практики

#### PWA Best Practices 2025

| Практика               | Описание                 | Статус K Sebe          |
| ---------------------- | ------------------------ | ---------------------- |
| Service Worker         | Background sync, offline | ✅ Есть                |
| App Shell Architecture | Быстрая загрузка UI      | ✅ Есть                |
| Manifest.json          | Installability           | ✅ Есть                |
| HTTPS                  | Безопасность             | ✅ Есть                |
| Core Web Vitals        | LCP < 2.5s, CLS < 0.1    | 🔄 Требует оптимизации |
| Offline fallback UI    | Graceful degradation     | ❌ Добавить            |

#### AI Integration Best Practices

```typescript
// Рекомендуемая архитектура AI-сервиса
interface AIServiceArchitecture {
  // 1. Backend proxy для безопасности
  endpoint: '/api/ai/gemini';

  // 2. Rate limiting per user
  rateLimit: {
    requests: 100;
    window: '1h';
    userId: string;
  };

  // 3. Caching для экономии
  cache: {
    ttl: 3600;
    key: 'hash(prompt + model)';
  };

  // 4. Fallback при ошибках
  fallback: {
    onError: 'cached_response';
    onRateLimit: 'queue';
  };
}
```

### 4.2 UX практики лидеров

| Практика             | Down Dog | Headspace | Применение к K Sebe            |
| -------------------- | -------- | --------- | ------------------------------ |
| Onboarding quiz      | ✅       | ✅        | Добавить: цели, уровень, время |
| Daily recommendation | ✅       | ✅        | AI выбирает практику дня       |
| Progress dashboard   | ✅       | ✅        | Визуализация прогресса         |
| Streak calendar      | ❌       | ✅        | Добавить с наградами           |
| Social sharing       | ❌       | ✅        | Instagram Stories интеграция   |
| Offline downloads    | ✅       | ✅        | Скачивание видео               |

### 4.3 Retention Best Practices

```
RETENTION FRAMEWORK для K Sebe:

Day 0 (Onboarding):
├── Welcome от Кати (видео)
├── Quiz: цели, уровень, доступное время
├── Первая практика (короткая, 10 мин)
└── Push permission request

Day 1-7 (Activation):
├── Daily push с рекомендацией
├── Streak начинается
├── Первый badge после 3 дней
└── Персонализированный контент

Day 8-30 (Habit Formation):
├── Weekly progress summary
├── AI insights о прогрессе
├── Community challenge invitation
└── Upsell to Premium (после Day 7)

Day 30+ (Retention):
├── Monthly recap
├── New content notifications
├── Milestone celebrations
└── Referral program activation
```

---

## 5. Размышления "Что если?"

### 5.1 Сценарий A: AI-First Yoga Studio (Рекомендуемый)

> **Что если K Sebe станет первой полностью AI-персонализированной Inside Flow
> студией в России?**

#### Видение

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-FIRST YOGA EXPERIENCE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Пользователь открывает APP]                                  │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ "Как ты себя    │ ◄── AI анализирует:                       │
│   │  чувствуешь?"   │     • Историю практик                     │
│   └────────┬────────┘     • Время суток                         │
│            │              • Последнюю практику                   │
│            ▼              • Streak status                        │
│   ┌─────────────────┐                                           │
│   │ AI генерирует   │                                           │
│   │ уникальную      │ ◄── 60,000+ комбинаций:                   │
│   │ практику        │     • Асаны под цель                      │
│   └────────┬────────┘     • Музыка под настроение               │
│            │              • Длительность под время               │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ Live Voice      │ ◄── Aria сопровождает:                    │
│   │ Coaching        │     • Голосовые инструкции                │
│   └────────┬────────┘     • Real-time коррекция                 │
│            │              • Мотивация                            │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ Post-practice   │ ◄── AI анализирует:                       │
│   │ Analysis        │     • Прогресс (Vision)                   │
│   └────────┬────────┘     • Рекомендации                        │
│            │              • Следующая практика                   │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ Progress        │ ◄── Gamification:                         │
│   │ & Rewards       │     • Streak update                       │
│   └─────────────────┘     • Badge earned                        │
│                           • Share to Instagram                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Реализация

| Фаза | Функционал                    | Инвестиции | Срок    |
| ---- | ----------------------------- | ---------- | ------- |
| MVP  | AI Daily Recommendation       | Низкие     | Q1 2026 |
| v1.0 | Персонализированные программы | Средние    | Q2 2026 |
| v2.0 | Live Voice Coaching           | Средние    | Q3 2026 |
| v3.0 | Full AI-персонализация        | Высокие    | Q4 2026 |

#### Конкурентное преимущество

| Фича                      | K Sebe  | Down Dog | Alo Moves |
| ------------------------- | ------- | -------- | --------- |
| Inside Flow специализация | ✅      | ❌       | Частично  |
| AI анализ асан (Vision)   | ✅      | ❌       | ❌        |
| AI генерация медитаций    | ✅      | ❌       | ❌        |
| Личный бренд инструктора  | ✅ Катя | ❌       | ❌        |
| Русский язык native       | ✅      | Частично | ❌        |
| Live Voice AI Coach       | ✅ Plan | ❌       | ❌        |

**Feasibility: 9/10** | **Impact: 9/10** | **Priority: #1**

---

### 5.2 Сценарий B: Freemium Scale Machine

> **Что если выйти на 100,000+ MAU с устойчивой unit economics?**

#### Финансовая модель

```
UNIT ECONOMICS:

CAC (Customer Acquisition Cost):
├── Organic (Instagram, word-of-mouth): ~$2
├── Paid (targeted ads): ~$8
└── Blended CAC: ~$5

LTV (Lifetime Value):
├── Free user: $0 (but drives virality)
├── Premium (990₽/мес × 6 мес): $60
├── VIP (2990₽/мес × 6 мес): $180
└── Weighted average LTV: ~$45

LTV/CAC Ratio: 9:1 (отлично, target: >3:1)
```

#### Прогноз роста

| Месяц | MAU     | Paid Users | Conversion | MRR        | ARR         |
| ----- | ------- | ---------- | ---------- | ---------- | ----------- |
| M1    | 1,000   | 50         | 5%         | 49,500₽    | -           |
| M3    | 5,000   | 300        | 6%         | 297,000₽   | -           |
| M6    | 15,000  | 1,050      | 7%         | 1,039,500₽ | -           |
| M12   | 50,000  | 4,000      | 8%         | 3,960,000₽ | **47.5M₽**  |
| M24   | 100,000 | 10,000     | 10%        | 9,900,000₽ | **118.8M₽** |

#### Стратегия роста

```
GROWTH FLYWHEEL:

    ┌─────────────────┐
    │  Free AI Chat   │ ◄── Hook: бесплатный AI-коуч
    │  (без лимитов)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  3 видео/неделю │ ◄── Value demonstration
    │  (бесплатно)    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Paywall:       │ ◄── Conversion trigger
    │  "Хочешь больше?│     (после 7 дней streak)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Premium        │ ◄── Monetization
    │  (990₽/мес)     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Share & Refer  │ ◄── Viral loop
    │  (+1 мес free)  │
    └─────────────────┘
```

**Feasibility: 8/10** | **Impact: 10/10** | **Priority: #2**

---

### 5.3 Сценарий C: Inside Flow Academy Russia

> **Что если создать русскоязычную сертификацию Inside Flow?**

#### Бизнес-модель

| Продукт                   | Цена         | Target           | Revenue potential |
| ------------------------- | ------------ | ---------------- | ----------------- |
| Online Fundamentals (30h) | 29,900₽      | 200 учителей/год | 5.98M₽            |
| Advanced Training (50h)   | 49,900₽      | 100 учителей/год | 4.99M₽            |
| Teacher Marketplace       | 15% комиссия | 300 учителей     | 2M₽/год           |
| Annual Summit (online)    | 4,990₽       | 1000 участников  | 4.99M₽            |

**Total B2B Revenue Potential: ~18M₽/год**

#### Требования

- Партнёрство с Inside Yoga Academy (Young Ho Kim)
- Юридическое оформление лицензии
- Контент-производство (50+ часов видео)
- Платформа для сертификации

**Feasibility: 5/10** | **Impact: 9/10** | **Priority: #3 (долгосрочно)**

---

### 5.4 Сценарий D: Lifestyle Ecosystem

> **Что если расширить экосистему за пределы йоги?**

#### Модули экосистемы

```
K SEBE LIFESTYLE ECOSYSTEM:

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   🧘 YOGA (текущее)     🍎 NUTRITION      😴 SLEEP          │
│   ├── Inside Flow       ├── Mindful Eating├── Sleep tracks  │
│   ├── Hatha             ├── Recipes       ├── AI-генерация  │
│   ├── Meditation        ├── Meal plans    ├── Sleep score   │
│   └── Breathwork        └── AI nutrition  └── Morning routine│
│                              coach                           │
│                                                              │
│   🏃 MOVEMENT           🧠 MENTAL HEALTH  📊 ANALYTICS      │
│   ├── Morning routine   ├── Mood journal  ├── Unified       │
│   ├── Desk stretches    ├── AI therapy    │   dashboard     │
│   ├── Evening wind-down ├── Stress mgmt   ├── Wearables     │
│   └── Walking meditation└── Gratitude     │   integration   │
│                              practice      └── Progress      │
│                                                tracking      │
└─────────────────────────────────────────────────────────────┘
```

**Feasibility: 4/10** | **Impact: 10/10** | **Priority: #4 (2027+)**

---

### 5.5 Приоритизация сценариев

```
PRIORITY MATRIX:

                    HIGH IMPACT
                         ▲
                         │
         Сценарий B      │      Сценарий A
         (Scale)         │      (AI-First)
         ★★★★☆           │      ★★★★★
                         │
    ─────────────────────┼─────────────────────► HIGH FEASIBILITY
                         │
         Сценарий C      │
         (Academy)       │
         ★★★☆☆           │
                         │
         Сценарий D      │
         (Lifestyle)     │
         ★★☆☆☆           │
                         │
                    LOW IMPACT
```

**Рекомендация: Сценарий A + B (AI-First + Freemium Scale)**

---

## 6. Стратегические выводы

### 6.1 SWOT-анализ (обновлённый)

|                | Положительное                                                                                                                                  | Отрицательное                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Внутреннее** | **Strengths:** AI-first позиционирование, современный стек, Inside Flow ниша, личный бренд Кати, offline-first, качественная shared-библиотека | **Weaknesses:** Безопасность API, низкое тестовое покрытие, отсутствие монетизации, нет геймификации, крупные компоненты                     |
| **Внешнее**    | **Opportunities:** Рынок $33B к 2026, AI fitness $59.8B к 2035, Inside Flow растёт глобально, русскоязычный рынок недообслужен                 | **Threats:** Конкуренция (Down Dog, Alo Moves), зависимость от Gemini API, изменения законодательства о данных, экономическая нестабильность |

### 6.2 Ключевые выводы

1. **AI — главное конкурентное преимущество.** K Sebe уже имеет 6 режимов
   AI-интеграции, что превосходит большинство конкурентов. Нужно усилить и
   углубить это преимущество.

2. **Retention — критический показатель.** Средняя retention в wellness apps
   7.9%. Геймификация может дать +50%. Это приоритет #1.

3. **Freemium работает.** Conversion 5-8% при правильном value staging.
   Бесплатный AI-чат как hook.

4. **Inside Flow — уникальная ниша.** 10,000+ сертифицированных учителей в мире,
   растущее сообщество. K Sebe может стать русскоязычным хабом.

5. **Безопасность блокирует scale.** API ключи в клиенте — риск финансовых
   потерь при росте.

### 6.3 Стратегические приоритеты

```
STRATEGIC PRIORITIES 2026:

#1 FOUNDATION (Q1)
├── Безопасность API
├── Монетизация MVP
└── Критические исправления

#2 RETENTION (Q1-Q2)
├── Геймификация (streaks, badges)
├── Push-уведомления
└── Onboarding optimization

#3 AI DIFFERENTIATION (Q2-Q3)
├── Daily AI recommendations
├── Персональные программы
└── Enhanced Vision analysis

#4 SCALE (Q3-Q4)
├── Performance optimization
├── Community features
└── Referral program

#5 EXPANSION (Q4+)
├── B2B corporate wellness
├── Inside Flow Academy research
└── International (CIS markets)
```

---

## 7. Детализированная дорожная карта

### 7.1 Фаза 0: Критические исправления (Январь 2026)

#### 0.1 Безопасность API

**Цель:** Перенести API ключи на backend

**Задачи:**

| #     | Задача                                        | Файлы                                               | Часы |
| ----- | --------------------------------------------- | --------------------------------------------------- | ---- |
| 0.1.1 | Создать Supabase Edge Function `gemini-proxy` | `supabase/functions/gemini-proxy/index.ts`          | 8    |
| 0.1.2 | Добавить rate limiting по user_id             | `supabase/functions/gemini-proxy/index.ts`          | 4    |
| 0.1.3 | Обновить WEB geminiService                    | `k-sebe-yoga-studioWEB/services/geminiService.ts`   | 4    |
| 0.1.4 | Обновить APP geminiService                    | `k-sebe-yoga-studio-APPp/services/geminiService.ts` | 4    |
| 0.1.5 | Добавить GEMINI_API_KEY в Supabase secrets    | Supabase Dashboard                                  | 1    |
| 0.1.6 | Тестирование proxy                            | E2E tests                                           | 3    |

**Архитектура:**

```typescript
// supabase/functions/gemini-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const RATE_LIMIT = 100; // requests per hour per user

serve(async (req) => {
  // 1. Verify auth
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(/* ... */);
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader);

  // 2. Check rate limit
  const requestCount = await getRequestCount(user.id);
  if (requestCount > RATE_LIMIT) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
    });
  }

  // 3. Proxy to Gemini
  const { prompt, model } = await req.json();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/...`,
    {
      headers: { 'x-goog-api-key': GEMINI_API_KEY },
    }
  );

  // 4. Increment rate limit counter
  await incrementRequestCount(user.id);

  return response;
});
```

#### 0.2 PWA Assets

**Задачи:**

| #     | Задача                                 | Файлы                         | Часы |
| ----- | -------------------------------------- | ----------------------------- | ---- |
| 0.2.1 | Генерировать иконки 72-512px           | `public/icons/`               | 2    |
| 0.2.2 | Создать favicon.png (192x192)          | `public/favicon.png`          | 0.5  |
| 0.2.3 | Создать apple-touch-icon.png (180x180) | `public/apple-touch-icon.png` | 0.5  |
| 0.2.4 | Создать og-image.jpg (1200x630)        | `public/og-image.jpg`         | 1    |
| 0.2.5 | Обновить manifest.json                 | `public/manifest.json`        | 1    |
| 0.2.6 | Добавить splash screens для iOS        | `public/splash/`              | 2    |

#### 0.3 Рефакторинг ChatWidget

**Текущее состояние:** 700+ LOC в одном файле

**Целевая архитектура:**

```
ChatWidget/ (бывший ChatWidget.tsx)
├── index.tsx (150 LOC) - контейнер
├── ChatInput.tsx (100 LOC) - ввод сообщений
├── ChatMessages.tsx (150 LOC) - список сообщений
├── ChatMessage.tsx (80 LOC) - одно сообщение
├── ChatModeSelector.tsx (100 LOC) - выбор режима
├── ChatAttachments.tsx (80 LOC) - вложения
└── useChatWidget.ts (200 LOC) - логика
```

**Задачи:**

| #     | Задача                          | Часы |
| ----- | ------------------------------- | ---- |
| 0.3.1 | Создать папку `ChatWidget/`     | 0.5  |
| 0.3.2 | Извлечь `ChatInput.tsx`         | 3    |
| 0.3.3 | Извлечь `ChatMessages.tsx`      | 3    |
| 0.3.4 | Извлечь `ChatModeSelector.tsx`  | 2    |
| 0.3.5 | Создать `useChatWidget.ts` hook | 4    |
| 0.3.6 | Написать тесты                  | 4    |

---

### 7.2 Фаза 1: Монетизация MVP (Февраль 2026)

#### 1.1 Платёжная интеграция

**Выбор:** YooKassa (для RU) + Stripe (для international)

**Подписочные планы:**

| План        | Цена       | Функции                                                               |
| ----------- | ---------- | --------------------------------------------------------------------- |
| **Free**    | 0₽         | AI-чат Aria (100 сообщений/день), 3 видео/неделю, Breathwork          |
| **Premium** | 990₽/мес   | Все видео, offline download, AI-программы, без рекламы                |
| **VIP**     | 2,990₽/мес | Premium + личные консультации с Катей (2/мес), приоритетная поддержка |

**Задачи:**

| #     | Задача                                      | Файлы                                    | Часы |
| ----- | ------------------------------------------- | ---------------------------------------- | ---- |
| 1.1.1 | Регистрация в YooKassa                      | External                                 | 4    |
| 1.1.2 | Создать Edge Function `create-payment`      | `supabase/functions/create-payment/`     | 8    |
| 1.1.3 | Создать Edge Function `payment-webhook`     | `supabase/functions/payment-webhook/`    | 8    |
| 1.1.4 | Создать `Paywall.tsx` компонент             | `shared/components/Paywall.tsx`          | 6    |
| 1.1.5 | Создать `SubscriptionContext`               | `shared/context/SubscriptionContext.tsx` | 4    |
| 1.1.6 | Добавить таблицу `subscriptions` в Supabase | SQL migration                            | 2    |
| 1.1.7 | Интегрировать paywall в APP                 | `APP/components/`                        | 4    |
| 1.1.8 | Тестирование платежей                       | E2E                                      | 4    |

**Supabase Schema:**

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'premium', 'vip')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  yookassa_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

#### 1.2 Усиление аутентификации

**Задачи:**

| #     | Задача                                 | Часы |
| ----- | -------------------------------------- | ---- |
| 1.2.1 | Включить Supabase Phone Auth           | 2    |
| 1.2.2 | Создать `AuthModal.tsx` (phone OTP)    | 6    |
| 1.2.3 | Добавить `ProfilePage.tsx`             | 6    |
| 1.2.4 | Защитить routes с помощью guards       | 4    |
| 1.2.5 | Добавить email verification (optional) | 4    |

---

### 7.3 Фаза 2: Retention & Геймификация (Март-Апрель 2026)

#### 2.1 Streak System

**Компоненты:**

```typescript
// shared/types/gamification.ts
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalPractices: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
}
```

**Задачи:**

| #     | Задача                             | Часы |
| ----- | ---------------------------------- | ---- |
| 2.1.1 | Создать таблицу `user_progress`    | 2    |
| 2.1.2 | Создать `useStreak.ts` hook        | 4    |
| 2.1.3 | Создать `StreakCard.tsx` компонент | 4    |
| 2.1.4 | Создать `StreakCalendar.tsx`       | 6    |
| 2.1.5 | Интегрировать в Dashboard          | 4    |

#### 2.2 Achievements System

**Базовые достижения:**

| ID                 | Название            | Описание                  | Условие               |
| ------------------ | ------------------- | ------------------------- | --------------------- |
| `first_practice`   | Первый шаг          | Завершите первую практику | 1 практика            |
| `streak_7`         | Неделя силы         | 7 дней подряд             | streak >= 7           |
| `streak_30`        | Месяц трансформации | 30 дней подряд            | streak >= 30          |
| `streak_100`       | Мастер дисциплины   | 100 дней подряд           | streak >= 100         |
| `practices_10`     | Начинающий йог      | 10 практик                | total >= 10           |
| `practices_50`     | Опытный практик     | 50 практик                | total >= 50           |
| `practices_100`    | Йога-энтузиаст      | 100 практик               | total >= 100          |
| `vision_first`     | AI-анализ           | Первый анализ асаны       | vision_count >= 1     |
| `meditation_first` | Внутренний покой    | Первая AI-медитация       | meditation_count >= 1 |
| `all_modes`        | Исследователь       | Попробовать все режимы AI | all_modes_used        |

**Задачи:**

| #     | Задача                                 | Часы |
| ----- | -------------------------------------- | ---- |
| 2.2.1 | Создать таблицу `achievements`         | 2    |
| 2.2.2 | Создать `useAchievements.ts` hook      | 4    |
| 2.2.3 | Создать `AchievementCard.tsx`          | 3    |
| 2.2.4 | Создать `AchievementsGrid.tsx`         | 4    |
| 2.2.5 | Создать `AchievementUnlockedModal.tsx` | 3    |
| 2.2.6 | Интегрировать в профиль                | 4    |

#### 2.3 Push-уведомления

**Firebase Cloud Messaging интеграция:**

```typescript
// Типы уведомлений
enum NotificationType {
  STREAK_REMINDER = 'streak_reminder', // "Не забудь практику!"
  STREAK_AT_RISK = 'streak_at_risk', // "Твой streak под угрозой!"
  ACHIEVEMENT_UNLOCKED = 'achievement', // "Новое достижение!"
  NEW_CONTENT = 'new_content', // "Новое видео от Кати"
  CLASS_REMINDER = 'class_reminder', // "Занятие через 1 час"
  WEEKLY_SUMMARY = 'weekly_summary', // "Твоя неделя в цифрах"
  AI_RECOMMENDATION = 'ai_recommendation', // "Aria рекомендует..."
}
```

**Задачи:**

| #     | Задача                                      | Часы |
| ----- | ------------------------------------------- | ---- |
| 2.3.1 | Настроить Firebase проект                   | 2    |
| 2.3.2 | Создать `firebase-messaging-sw.js`          | 2    |
| 2.3.3 | Создать `pushService.ts`                    | 4    |
| 2.3.4 | Создать Edge Function для отправки push     | 4    |
| 2.3.5 | Создать UI для управления уведомлениями     | 4    |
| 2.3.6 | Настроить scheduled functions для reminders | 4    |

---

### 7.4 Фаза 3: AI Differentiation (Май-Июль 2026)

#### 3.1 Daily AI Recommendation

**Алгоритм:**

```typescript
interface DailyRecommendation {
  practiceId: string;
  title: string;
  duration: number;
  reason: string; // AI-generated explanation
  matchScore: number; // 0-100
}

// Факторы для рекомендации:
const recommendationFactors = {
  timeOfDay: 0.2, // Утро: энергичное, вечер: расслабляющее
  lastPractice: 0.2, // Разнообразие vs consistency
  streakStatus: 0.15, // Короткие для поддержания streak
  userGoals: 0.25, // Цели из onboarding
  weatherMood: 0.1, // Опционально: погода
  completionHistory: 0.1, // Что пользователь обычно завершает
};
```

**Задачи:**

| #     | Задача                                   | Часы |
| ----- | ---------------------------------------- | ---- |
| 3.1.1 | Создать `DailyRecommendation.tsx`        | 6    |
| 3.1.2 | Создать `useRecommendation.ts` hook      | 4    |
| 3.1.3 | Добавить AI prompt для генерации причины | 3    |
| 3.1.4 | Интегрировать в Dashboard                | 4    |
| 3.1.5 | Push notification с рекомендацией        | 3    |

#### 3.2 Персональные программы

**7-дневная AI-программа:**

```typescript
interface PersonalProgram {
  id: string;
  userId: string;
  goal: 'flexibility' | 'strength' | 'relaxation' | 'energy' | 'balance';
  level: 'beginner' | 'intermediate' | 'advanced';
  days: ProgramDay[];
  createdAt: string;
  completedDays: number;
}

interface ProgramDay {
  day: number;
  practiceType: string;
  duration: number;
  focus: string;
  aiNotes: string;
  completed: boolean;
  completedAt?: string;
}
```

**Задачи:**

| #     | Задача                                   | Часы |
| ----- | ---------------------------------------- | ---- |
| 3.2.1 | Создать `OnboardingQuiz.tsx`             | 8    |
| 3.2.2 | Создать AI prompt для генерации программ | 4    |
| 3.2.3 | Создать `PersonalProgram.tsx`            | 8    |
| 3.2.4 | Создать `ProgramDay.tsx`                 | 4    |
| 3.2.5 | Создать `ProgramProgress.tsx`            | 4    |
| 3.2.6 | Сохранение программ в Supabase           | 4    |

#### 3.3 Enhanced Vision Analysis

**Улучшения:**

```typescript
interface EnhancedAsanaAnalysis {
  // Существующее
  poseName: string;
  overallScore: number;
  feedback: string[];

  // Новое
  bodyParts: {
    part: 'spine' | 'shoulders' | 'hips' | 'knees' | 'ankles';
    alignment: 'correct' | 'needs_adjustment';
    suggestion: string;
  }[];

  comparisonWithIdeal: {
    imageOverlay: string; // base64 image with skeleton overlay
    deviationPoints: { x: number; y: number; severity: number }[];
  };

  progressTracking: {
    previousAnalyses: AsanaAnalysis[];
    improvementAreas: string[];
    trend: 'improving' | 'stable' | 'needs_attention';
  };
}
```

**Задачи:**

| #     | Задача                                        | Часы |
| ----- | --------------------------------------------- | ---- |
| 3.3.1 | Улучшить Gemini prompt для детального анализа | 4    |
| 3.3.2 | Создать `AnalysisOverlay.tsx`                 | 6    |
| 3.3.3 | Создать `ProgressComparison.tsx`              | 6    |
| 3.3.4 | Сохранение истории анализов                   | 4    |
| 3.3.5 | Создать `ProgressReport.tsx`                  | 6    |

---

### 7.5 Фаза 4: Scale & Community (Август-Октябрь 2026)

#### 4.1 Performance Optimization

**Цели:**

- Lighthouse Performance: 90+
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Bundle size: < 200KB (gzipped)

**Задачи:**

| #     | Задача                            | Часы |
| ----- | --------------------------------- | ---- |
| 4.1.1 | Route-based code splitting        | 4    |
| 4.1.2 | Lazy loading компонентов          | 4    |
| 4.1.3 | Image optimization (WebP, srcset) | 4    |
| 4.1.4 | Service Worker caching strategy   | 4    |
| 4.1.5 | Bundle analysis и tree shaking    | 4    |
| 4.1.6 | CDN для видео контента            | 4    |

#### 4.2 Community Features

**Функционал:**

```typescript
interface CommunityFeatures {
  // Challenges
  challenges: {
    weekly: WeeklyChallenge;
    monthly: MonthlyChallenge;
    leaderboard: LeaderboardEntry[];
  };

  // Social
  social: {
    shareToInstagram: (achievement: Achievement) => void;
    referralProgram: {
      code: string;
      referrals: number;
      rewards: Reward[];
    };
  };

  // Community content
  content: {
    userReviews: Review[];
    testimonials: Testimonial[];
    beforeAfter: BeforeAfterStory[];
  };
}
```

**Задачи:**

| #     | Задача                              | Часы |
| ----- | ----------------------------------- | ---- |
| 4.2.1 | Создать `WeeklyChallenge.tsx`       | 6    |
| 4.2.2 | Создать `Leaderboard.tsx`           | 4    |
| 4.2.3 | Создать Instagram share integration | 4    |
| 4.2.4 | Создать referral system             | 8    |
| 4.2.5 | Создать `UserTestimonials.tsx`      | 4    |

#### 4.3 Тестирование

**Цель:** 70%+ coverage

| Тип         | Текущее | Цель           | Приоритетные области        |
| ----------- | ------- | -------------- | --------------------------- |
| Unit        | ~30%    | 70%            | Utils, hooks, services      |
| Integration | ~5%     | 50%            | API calls, state management |
| E2E         | 0%      | Critical flows | Auth, payment, booking      |

**Задачи:**

| #     | Задача                         | Часы |
| ----- | ------------------------------ | ---- |
| 4.3.1 | Unit tests для shared utils    | 8    |
| 4.3.2 | Unit tests для hooks           | 6    |
| 4.3.3 | Integration tests для services | 8    |
| 4.3.4 | Настроить Playwright           | 4    |
| 4.3.5 | E2E: Auth flow                 | 4    |
| 4.3.6 | E2E: Payment flow              | 4    |
| 4.3.7 | E2E: Booking flow              | 4    |

---

### 7.6 Фаза 5: Expansion (Ноябрь-Декабрь 2026)

#### 5.1 B2B Corporate Wellness

**Продукт:** K Sebe for Teams

| План           | Цена                             | Функции                         |
| -------------- | -------------------------------- | ------------------------------- |
| **Starter**    | 9,900₽/мес (до 20 сотрудников)   | Базовый доступ, аналитика       |
| **Business**   | 29,900₽/мес (до 100 сотрудников) | + Live классы, custom branding  |
| **Enterprise** | Custom                           | + Dedicated support, API access |

#### 5.2 Inside Flow Academy Research

**Исследование возможности партнёрства:**

- Контакт с Inside Yoga Academy
- Юридический анализ лицензирования
- Оценка контент-производства
- Business case для 2027

---

## 8. Технические спецификации

### 8.1 Новые компоненты

```
shared/
├── components/
│   ├── Paywall.tsx
│   ├── AuthModal.tsx
│   ├── StreakCard.tsx
│   ├── StreakCalendar.tsx
│   ├── AchievementCard.tsx
│   ├── AchievementsGrid.tsx
│   ├── AchievementUnlockedModal.tsx
│   ├── DailyRecommendation.tsx
│   ├── OnboardingQuiz.tsx
│   ├── PersonalProgram.tsx
│   ├── ProgressReport.tsx
│   ├── WeeklyChallenge.tsx
│   └── Leaderboard.tsx
│
├── hooks/
│   ├── useStreak.ts
│   ├── useAchievements.ts
│   ├── useRecommendation.ts
│   ├── useSubscription.ts
│   └── usePushNotifications.ts
│
├── context/
│   ├── SubscriptionContext.tsx
│   └── GamificationContext.tsx
│
└── services/
    ├── paymentService.ts
    └── pushService.ts

supabase/functions/
├── gemini-proxy/
├── create-payment/
├── payment-webhook/
└── send-push/
```

### 8.2 Database Schema (Additions)

```sql
-- User progress and gamification
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_practices INT DEFAULT 0,
  last_practice_date DATE,
  weekly_goal INT DEFAULT 5,
  weekly_progress INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Personal programs
CREATE TABLE personal_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  level TEXT NOT NULL,
  days JSONB NOT NULL,
  completed_days INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Push notification tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'web', 'ios', 'android'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  streak_reminder BOOLEAN DEFAULT TRUE,
  new_content BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT TRUE,
  ai_recommendations BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.3 API Endpoints (Edge Functions)

| Endpoint                             | Method | Description               |
| ------------------------------------ | ------ | ------------------------- |
| `/functions/v1/gemini-proxy`         | POST   | Proxy for Gemini API      |
| `/functions/v1/create-payment`       | POST   | Create YooKassa payment   |
| `/functions/v1/payment-webhook`      | POST   | Handle payment callbacks  |
| `/functions/v1/send-push`            | POST   | Send push notification    |
| `/functions/v1/generate-program`     | POST   | Generate personal program |
| `/functions/v1/daily-recommendation` | GET    | Get AI recommendation     |

---

## 9. Метрики успеха и KPI

### 9.1 Технические KPI

| Метрика                | Текущее | Q1 2026 | Q2 2026 | Q4 2026 |
| ---------------------- | ------- | ------- | ------- | ------- |
| Lighthouse Performance | ~75     | 80      | 85      | 90+     |
| Test Coverage          | 30%     | 50%     | 60%     | 70%+    |
| Bundle Size (gzip)     | ~300KB  | 250KB   | 220KB   | <200KB  |
| LCP                    | ~3s     | 2.8s    | 2.5s    | <2.5s   |
| Uptime                 | 99%     | 99.5%   | 99.5%   | 99.9%   |
| API Response Time      | -       | <500ms  | <300ms  | <200ms  |

### 9.2 Бизнес KPI

| Метрика         | Q1 2026 | Q2 2026  | Q3 2026    | Q4 2026    |
| --------------- | ------- | -------- | ---------- | ---------- |
| MAU             | 2,000   | 8,000    | 20,000     | 50,000     |
| Paid Users      | 100     | 500      | 1,600      | 4,000      |
| Conversion Rate | 5%      | 6%       | 8%         | 8%         |
| MRR             | 99,000₽ | 495,000₽ | 1,584,000₽ | 3,960,000₽ |
| ARR             | -       | -        | -          | **47.5M₽** |
| D30 Retention   | 15%     | 25%      | 35%        | 40%        |
| NPS             | -       | 40       | 50         | 60+        |

### 9.3 Engagement KPI

| Метрика                 | Q1 2026 | Q2 2026 | Q3 2026 | Q4 2026 |
| ----------------------- | ------- | ------- | ------- | ------- |
| Avg Sessions/Week       | 2       | 3       | 4       | 5       |
| Avg Session Duration    | 15 min  | 20 min  | 25 min  | 30 min  |
| AI Chat Usage           | 50%     | 60%     | 70%     | 75%     |
| Video Completion Rate   | 40%     | 50%     | 60%     | 70%     |
| Streak Avg Length       | 3 days  | 7 days  | 14 days | 21 days |
| Achievement Unlock Rate | -       | 30%     | 50%     | 70%     |

---

## 10. Управление рисками

### 10.1 Risk Matrix

| Риск                               | Вероятность | Влияние       | Митигация                                                 |
| ---------------------------------- | ----------- | ------------- | --------------------------------------------------------- |
| **Gemini API deprecation/changes** | Средняя     | Высокое       | Абстракция AI-сервиса, fallback на Claude/GPT-4           |
| **Rate limit exceeded**            | Высокая     | Среднее       | Edge Functions proxy, caching, rate limiting              |
| **Security breach**                | Низкая      | Очень высокое | API proxy, input validation, security audits              |
| **Payment integration issues**     | Средняя     | Высокое       | Sandbox testing, fallback provider (Stripe)               |
| **User churn**                     | Средняя     | Высокое       | Gamification, push notifications, re-engagement campaigns |
| **Competition from big players**   | Средняя     | Среднее       | Focus on Inside Flow niche, personal brand of Katya       |
| **Economic downturn**              | Средняя     | Среднее       | Flexible pricing, strong free tier                        |
| **Supabase outage**                | Низкая      | Высокое       | Offline-first architecture already in place               |

### 10.2 Contingency Plans

#### Plan A: Gemini API Issues

```
IF Gemini API unavailable OR pricing changes significantly:
  1. Switch to Claude API (similar capabilities)
  2. Implement local fallback responses for common queries
  3. Cache frequently used AI responses
  4. Notify users of temporary limitations
```

#### Plan B: Monetization Underperformance

```
IF Conversion < 3% after 3 months:
  1. A/B test different pricing tiers
  2. Extend free trial period
  3. Add more free features as hooks
  4. Implement referral program with incentives
  5. Consider ad-supported tier
```

#### Plan C: Retention Crisis

```
IF D30 Retention < 10%:
  1. Deep user research (interviews, surveys)
  2. Aggressive push notification strategy
  3. Email re-engagement campaigns
  4. Add more gamification elements
  5. Personalize onboarding based on user goals
```

---

## Приложения

### A. Checklist по фазам

#### Фаза 0 (Январь 2026)

- [ ] Edge Function gemini-proxy
- [ ] Rate limiting
- [ ] PWA icons (72-512px)
- [ ] favicon.png, apple-touch-icon.png
- [ ] og-image.jpg
- [ ] Refactor ChatWidget → 6 files
- [ ] Refactor AICoach → 5 files

#### Фаза 1 (Февраль 2026)

- [ ] YooKassa integration
- [ ] create-payment Edge Function
- [ ] payment-webhook Edge Function
- [ ] Paywall.tsx
- [ ] SubscriptionContext
- [ ] subscriptions table
- [ ] AuthModal.tsx (phone OTP)
- [ ] ProfilePage.tsx

#### Фаза 2 (Март-Апрель 2026)

- [ ] user_progress table
- [ ] useStreak hook
- [ ] StreakCard.tsx
- [ ] StreakCalendar.tsx
- [ ] Achievements system (10 achievements)
- [ ] AchievementUnlockedModal.tsx
- [ ] Firebase FCM setup
- [ ] pushService.ts
- [ ] Notification preferences UI

#### Фаза 3 (Май-Июль 2026)

- [ ] DailyRecommendation.tsx
- [ ] OnboardingQuiz.tsx
- [ ] PersonalProgram.tsx
- [ ] Enhanced Vision analysis
- [ ] ProgressReport.tsx
- [ ] Progress comparison feature

#### Фаза 4 (Август-Октябрь 2026)

- [ ] Route-based code splitting
- [ ] Image optimization
- [ ] Lighthouse 90+
- [ ] WeeklyChallenge.tsx
- [ ] Leaderboard.tsx
- [ ] Referral system
- [ ] 70% test coverage
- [ ] Playwright E2E tests

#### Фаза 5 (Ноябрь-Декабрь 2026)

- [ ] B2B landing page
- [ ] Corporate pricing
- [ ] Inside Flow Academy research
- [ ] 2027 roadmap

### B. Источники исследования

#### Йога-приложения

- [HeyWellness - Best Yoga Apps](https://heywellness.com/yoga-apps)
- [Reviewed - Best Yoga Apps 2025](https://www.reviewed.com/health/best-right-now/best-yoga-apps)
- [Asivana Yoga - AI and Yoga](https://asivanayoga.com/blogs/yoga-blog/yoga-and-artificial-intelligence)

#### AI в фитнесе

- [Orangesoft - AI in Fitness](https://orangesoft.co/blog/ai-in-fitness-industry)
- [KitLabs - AI Personalized Fitness](https://www.kitlabs.us/ai-personalized-fitness-apps/)
- [SoluteLabs - Future of Fitness](https://www.solutelabs.com/blog/future-of-fitness)

#### Монетизация

- [RevenueCat - App Monetization 2025](https://www.revenuecat.com/blog/growth/2025-app-monetization-trends/)
- [Apptunix - Meditation App Development](https://www.apptunix.com/blog/meditation-app-development/)

#### Inside Flow

- [Inside Yoga Official](https://insideyoga.org/)
- [Inside Flow](https://insideflow.com/)
- [Inside Online](https://online.insideyoga.org/)

#### PWA Best Practices

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Microsoft - PWA Best Practices](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/best-practices)

---

_Документ создан: 25 декабря 2025_ _Автор: Claude Opus 4.5_ _Методология:
17-шаговый глубокий анализ с исследованием мировых практик_ _Следующее
обновление: Q1 2026_
