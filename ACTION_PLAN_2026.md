# План действий K Sebe 2026

> **Краткая версия стратегической дорожной карты**
> **Дата:** 25 декабря 2025

---

## Немедленные действия (Январь 2026)

### Критический приоритет

| # | Задача | Ответственный | Срок |
|---|--------|---------------|------|
| 1 | Создать Edge Function для Gemini API proxy | Dev | Неделя 1 |
| 2 | Добавить rate limiting по user_id | Dev | Неделя 1 |
| 3 | Генерировать PWA иконки (72-512px) | Design | Неделя 1 |
| 4 | Создать og-image.jpg для соцсетей | Design | Неделя 1 |
| 5 | Рефакторинг ChatWidget.tsx (700→200 LOC) | Dev | Неделя 2 |

### Файлы для создания

```
supabase/functions/gemini-proxy/index.ts
k-sebe-yoga-studioWEB/public/icons/
k-sebe-yoga-studioWEB/public/og-image.jpg
k-sebe-yoga-studioWEB/components/ChatWidget/
├── index.tsx
├── ChatInput.tsx
├── ChatMessages.tsx
├── ChatModeSelector.tsx
└── useChatWidget.ts
```

---

## Q1 2026: Foundation

### Февраль: Монетизация MVP

```
Подписочные планы:
├── Free: 0₽ (AI-чат 100 msg/день, 3 видео/неделю)
├── Premium: 990₽/мес (всё + offline)
└── VIP: 2,990₽/мес (+ консультации с Катей)
```

**Ключевые задачи:**
- [ ] Регистрация в YooKassa
- [ ] Edge Function `create-payment`
- [ ] Edge Function `payment-webhook`
- [ ] Компонент `Paywall.tsx`
- [ ] Таблица `subscriptions` в Supabase
- [ ] AuthModal с Phone OTP

### Март-Апрель: Retention

```
Геймификация:
├── Streak система (7/30/100 дней)
├── 10 базовых достижений
├── Push-уведомления (FCM)
└── Onboarding optimization
```

**Целевые метрики:**
- D30 Retention: 15% → 25%
- Avg Streak: 3 → 7 дней

---

## Q2 2026: AI Differentiation

### Май-Июль

```
AI-фичи:
├── Daily AI Recommendation
├── Персональные 7-дневные программы
├── Onboarding Quiz (цели, уровень)
└── Enhanced Vision Analysis
```

**Целевые метрики:**
- AI Chat Usage: 50% → 70%
- Program Completion Rate: 40%

---

## Q3-Q4 2026: Scale

### Август-Октябрь

```
Performance:
├── Lighthouse 90+
├── Test coverage 70%+
├── Route-based code splitting
└── CDN для видео
```

### Ноябрь-Декабрь

```
Expansion:
├── Community features
├── Referral program
├── B2B Corporate research
└── Inside Flow Academy research
```

---

## Ключевые KPI

| Метрика | Сейчас | Q2 2026 | Q4 2026 |
|---------|--------|---------|---------|
| MAU | ~500 | 8,000 | 50,000 |
| Paid Users | 0 | 500 | 4,000 |
| MRR | 0₽ | 495K₽ | 3.96M₽ |
| D30 Retention | ~10% | 25% | 40% |
| Test Coverage | 30% | 60% | 70%+ |

---

## Бюджет ресурсов

### Технический долг: ~120 часов

| Категория | Часы |
|-----------|------|
| Рефакторинг компонентов | 40 |
| Безопасность | 30 |
| Тестирование | 40 |
| Документация | 10 |

### Новые фичи: ~200 часов

| Фича | Часы |
|------|------|
| Монетизация | 40 |
| Геймификация | 40 |
| AI-персонализация | 50 |
| Push-уведомления | 20 |
| Performance | 24 |
| Community | 26 |

---

## Риски и митигация

| Риск | Митигация |
|------|-----------|
| Gemini API changes | Абстракция + fallback на Claude |
| Low conversion | A/B тесты, гибкое ценообразование |
| High churn | Геймификация, push, re-engagement |
| Security breach | Edge Functions proxy, audits |

---

## Следующий шаг

**Сегодня:** Создать Edge Function для gemini-proxy

```bash
# Команды для начала
supabase functions new gemini-proxy
supabase secrets set GEMINI_API_KEY=your-key
```

---

*Полная версия: [STRATEGIC_ROADMAP_2026.md](./STRATEGIC_ROADMAP_2026.md)*
