# Текущие задачи

Краткая сводка ближайших приоритетов (по **ACTION_PLAN_2026.md**,
**PRODUCTION_READINESS_AUDIT.md** и **REMEDIATION_PLAN.md**). Фокус на задачах,
которые можно брать в работу прямо сейчас.

_Обновлено: 21 февраля 2026 (после синхронизации conflict-resolution по PR)._

---

## Завершённые задачи (P0 Security)

Все критические security-блокеры **устранены** (см.
[Security Report](./docs/SECURITY_REPORT_2026_02_11.md)):

| #     | Задача                                  | Статус       |
| ----- | --------------------------------------- | ------------ |
| **1** | npm install — установить зависимости    | ✅ Завершено |
| **2** | Исправить webhook secret (обязательный) | ✅ Завершено |
| **3** | Убрать subscriptions update RLS policy  | ✅ Завершено |
| **4** | Ограничить CORS конкретными доменами    | ✅ Завершено |
| **5** | Убрать API key fallback для production  | ✅ Завершено |
| **6** | Требовать Service Role Key              | ✅ Завершено |

**Security Score:** 55 → 85+ после исправлений

## Оставшиеся P0 (Блокеры запуска)

| #     | Задача                                  | Где менять      | Время    | Статус |
| ----- | --------------------------------------- | --------------- | -------- | ------ |
| **7** | **Создать .env файлы**                  | Root, WEB, APP  | 15 мин   | ⏳     |
| **8** | **Установить GitHub Secrets**           | GitHub Settings | 10 мин   | ⏳     |
| **9** | **Заменить Unsplash изображения в APP** | APP components  | 2-4 часа | 🔄     |

**Примечание:** WEB-изображения заменены на локальные ассеты
(`shared/constants/images.ts`). Остаётся APP.

**Операционное примечание (repo settings):** `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`
настраиваются вручную в GitHub Secrets (в репозиторий не коммитятся).

---

## Завершённые задачи (Sprint: Полировка экосистемы)

| #   | Задача                                                           | Статус |
| --- | ---------------------------------------------------------------- | ------ |
| 1   | ✅ Создать Edge Function-прокси для Gemini API с rate limiting   | ✅     |
| 2   | ✅ Добавить вебхуки оплаты: `create-payment` и `payment-webhook` | ✅     |
| 3   | ✅ Сгенерировать PWA-иконки 72–512px                             | ✅     |
| 4   | ✅ Добавить `og-image.jpg` для соцсетей                          | ✅     |
| 5   | ✅ Рефакторинг ChatWidget: разбить на подкомпоненты и хук        | ✅     |
| 6   | ✅ Добавить `.env.example` в APP                                 | ✅     |
| 7   | ✅ Добавить `robots.txt` в APP                                   | ✅     |
| 8   | ✅ Добавить `sitemap.xml` в APP                                  | ✅     |
| 9   | ✅ Обновить sitemap.xml с датой 2026                             | ✅     |
| 10  | ✅ Исправить `any` типы в shared/utils                           | ✅     |
| 11  | ✅ Исправить неиспользуемые переменные                           | ✅     |
| 12  | ✅ Исправить a11y предупреждения                                 | ✅     |
| 13  | ✅ Экранирование кавычек в JSX                                   | ✅     |
| 14  | ✅ Обновить типы для геймификации                                | ✅     |
| 15  | ✅ Добавить константы достижений                                 | ✅     |
| 16  | ✅ Добавить INSIDE_FLOW info                                     | ✅     |
| 17  | ✅ Добавить ARIA_CONFIG                                          | ✅     |
| 18  | ✅ Добавить SUBSCRIPTION_PLANS                                   | ✅     |
| 19  | ✅ Создать COMPREHENSIVE_UPDATE_2026.md                          | ✅     |
| 20  | ✅ Обновить документацию (CLAUDE.md, AGENTS.md, skills, docs)    | ✅     |

---

## 🟡 Высокий приоритет (P1) — Очень желательно перед запуском

| #   | Задача                                    | Где менять                                    | Время     | Статус |
| --- | ----------------------------------------- | --------------------------------------------- | --------- | ------ |
| 10  | **Input validation (Zod)**                | `supabase/functions/gemini-proxy/index.ts`    | 2-3 часа  | ✅     |
| 11  | **Rate limiting в Redis/KV**              | `supabase/functions/gemini-proxy/index.ts`    | 3-4 часа  | ✅     |
| 12  | **Webhook signature verification (HMAC)** | `supabase/functions/payment-webhook/index.ts` | ✅        | ✅     |
| 13  | **YooKassa интеграция (полная)**          | `supabase/functions/create-payment/index.ts`  | 1-2 дня   | ⏳     |
| 14  | **Заменить 4 placeholder видео**          | `APP/components/VideoLibrary.tsx`             | 4-8 часов | ⏳     |
| 15  | **Интегрировать расписание с Supabase**   | `APP/services/dataService.ts` + новая таблица | 1-2 дня   | ⏳     |
| 16  | **Добавить database индексы**             | Новая миграция                                | 30 мин    | ⏳     |
| 17  | **Повысить test coverage до 50%+ (178 тестов)** | Все `__tests__/`                         | Ongoing   | ⏳     |
| 18  | **Исправить nullable user_id**            | Миграция cleanup                              | 30 мин    | ⏳     |
| 19  | **Разбить Image.tsx (495 строк)**         | `shared/components/Image.tsx`                 | 2-3 часа  | ⏳     |
| 19a | **APP ChatWidget: non-AI режим (без client live)** | `APP/components/ChatWidget/useChatSession.ts` | 30-60 мин | ✅     |
| 19b | **Toolchain guardrail (Vite/Vitest baseline)** | `docs/TOOLCHAIN_UPGRADE_PLAYBOOK.md` + `scripts/verify_toolchain.mjs` | 30 мин | ✅     |
| 19c | **Снять конфликт PR (CURRENT_TASKS + useChatSession)** | `CURRENT_TASKS.md`, `APP/components/ChatWidget/useChatSession.ts` | 15 мин | ✅     |

**Риск-заметка по зависимостям:** `npm audit` показывает 22 уязвимости в dev-deps
(`minimatch`/`glob` через ESLint-цепочку); production bundle не затронут.

**Total P1:** 1-2 недели **Testing Coverage:** ~20% → 50%+ **Payment
Integration:** 30% → 90%

## 🟢 Средний приоритет (P2) — После запуска, но скоро

| #   | Задача                               | Где менять                                  | Время    | Статус |
| --- | ------------------------------------ | ------------------------------------------- | -------- | ------ |
| 20  | Убрать default exports (8 файлов)    | shared/                                     | 1-2 часа | ⏳     |
| 21  | Вынести хардкод в константы          | Blog, Pricing, Marquee, Breathwork          | 2-3 часа | ⏳     |
| 22  | Оптимизировать изображения (WebP)    | Все public/images/                          | 1 день   | ⏳     |
| 23  | Реализовать Achievements UI          | `shared/components/`                        | 1-2 дня  | ⏳     |
| 24  | Добавить Veo/Image Edit в Edge proxy | `supabase/functions/gemini-proxy/`          | 1 день   | ⏳     |
| 25  | Раскомментировать Subscription UI    | `APP/components/Dashboard.tsx`              | 2 часа   | ⏳     |
| 26  | Newsletter интеграция (Mailchimp)    | `WEB/components/Footer.tsx` + Edge Function | 1 день   | ⏳     |
| 27  | "Все статьи" функционал или убрать   | `WEB/components/Blog.tsx`                   | 3-4 часа | ⏳     |
| 28  | Logging & Monitoring (Sentry)        | WEB/APP                                     | 1 день   | ⏳     |
| 29  | Error recovery & cron jobs           | Supabase Edge Functions                     | 1-2 дня  | ⏳     |
| 30  | Database types generation            | `shared/types/database.types.ts`            | 1 час    | ⏳     |

**Total P2:** 2-4 недели

## 🔵 Низкий приоритет (P3) — Backlog

| #   | Задача                                    | Где менять           | Статус |
| --- | ----------------------------------------- | -------------------- | ------ |
| 31  | Push Notifications (Firebase)             | APP                  | ⏳     |
| 32  | DailyRecommendation компонент             | `shared/components/` | ⏳     |
| 33  | PersonalProgram 7-day programs            | APP                  | ⏳     |
| 34  | StreakCalendar visualization              | `shared/components/` | ⏳     |
| 35  | Активировать Retreats секцию              | `WEB/App.tsx`        | ⏳     |
| 36  | Активировать AI Subscription              | `WEB/App.tsx`        | ⏳     |
| 37  | i18n поддержка                            | WEB/APP              | ⏳     |
| 38  | Storybook для компонентов                 | Все компоненты       | ⏳     |
| 39  | Performance optimization (Lighthouse 90+) | WEB/APP              | ⏳     |
| 40  | Analytics integration (Mixpanel/GA)       | WEB/APP              | ⏳     |

---

## Документация

### Ключевые документы:

- **[AUDIT_EXECUTIVE_SUMMARY.md](./AUDIT_EXECUTIVE_SUMMARY.md)** — краткий обзор
  (3 минуты чтения)
- **[PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)** — полный
  аудит (84 KB, 20 минут чтения)
- **[REMEDIATION_PLAN.md](./REMEDIATION_PLAN.md)** — план исправлений с кодом
  (45 KB, 15 минут чтения)
- **[Security Report (Feb 2026)](./docs/SECURITY_REPORT_2026_02_11.md)** — аудит
  безопасности

### Стратегические:

- **[STRATEGIC_ROADMAP_2026.md](./STRATEGIC_ROADMAP_2026.md)** — дорожная карта
- **[ACTION_PLAN_2026.md](./ACTION_PLAN_2026.md)** — план действий
- **[docs/COMPREHENSIVE_UPDATE_2026.md](./docs/COMPREHENSIVE_UPDATE_2026.md)** —
  комплексное обновление
- **[docs/DEEP_RESEARCH_STACK_2026_02_19.md](./docs/DEEP_RESEARCH_STACK_2026_02_19.md)** —
  глубокое исследование репозитория и roadmap доработки
- **[docs/INDEX.md](./docs/INDEX.md)** — центральный индекс документации

---

## PRODUCTION READINESS

**Текущая оценка: 75/100** (было 68, security P0 устранены)

| Метрика     | Текущее    | После P1   | Цель       |
| ----------- | ---------- | ---------- | ---------- |
| Security    | 85/100     | 90/100     | 95/100     |
| Testing     | 25/100     | 50/100     | 70/100     |
| Content     | 80/100     | 100/100    | 100/100    |
| Payment     | 30/100     | 90/100     | 100/100    |
| **OVERALL** | **75/100** | **85/100** | **90/100** |

---

## TIMELINE

- **Done (P0 Security):** Webhook, RLS, CORS, API key, Service Role Key
- **Week 1 (P0 remaining):** .env, GitHub Secrets, APP images
- **Week 2-3 (P1):** Backend + Features
- **Week 4-6 (P2):** Polish + Optimization
- **Week 7+ (P3):** Advanced Features (ongoing)

---

> Обновляйте таблицу по мере выполнения: ✅ для сделанных, 🔄 для в работе, ⏳
> для запланированных.
