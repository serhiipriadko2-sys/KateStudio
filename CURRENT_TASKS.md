# Текущие задачи

Краткая сводка ближайших приоритетов (по **ACTION_PLAN_2026.md**,
**PRODUCTION_READINESS_AUDIT.md** и **REMEDIATION_PLAN.md**). Фокус на задачах,
которые можно брать в работу прямо сейчас.

_Обновлено: 12 января 2026 (после полного production audit)._

---

## 🚨 КРИТИЧЕСКИЕ БЛОКЕРЫ (P0) - Немедленное внимание!

**Нельзя запускать в продакшн без исправления этих проблем!**

| #     | Задача                                      | Где менять                                          | Время    | Статус |
| ----- | ------------------------------------------- | --------------------------------------------------- | -------- | ------ |
| **1** | **npm install - установить зависимости**    | Root                                                | 5 мин    | 🔴     |
| **2** | **Исправить webhook secret (обязательный)** | `supabase/functions/payment-webhook/index.ts:41-46` | 10 мин   | 🔴     |
| **3** | **Убрать subscriptions update RLS policy**  | Новая миграция `20260112_fix_subscriptions_rls.sql` | 15 мин   | 🔴     |
| **4** | **Ограничить CORS конкретными доменами**    | Все 3 Edge Functions                                | 15 мин   | 🔴     |
| **5** | **Убрать API key fallback для production**  | `vite.config.ts` (WEB+APP)                          | 20 мин   | 🔴     |
| **6** | **Требовать Service Role Key**              | `supabase/functions/create-payment/index.ts:32-34`  | 10 мин   | 🔴     |
| **7** | **Создать .env файлы**                      | Root, WEB, APP                                      | 15 мин   | 🔴     |
| **8** | **Установить GitHub Secrets**               | GitHub Settings                                     | 10 мин   | 🔴     |
| **9** | **Заменить 16 Unsplash изображений**        | Reviews, Blog, Retreats, VideoLibrary               | 2-4 часа | 🔴     |

**Total P0:** ~1.5 часа + контент (2-4 часа) **Security Score:** 55 → 85+ после
исправления

## Завершённые задачи

| #   | Задача                                                                      | Где менять                                                                                  | Ожидаемый результат                                       |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | ✅ Создать Edge Function-прокси для Gemini API с rate limiting по `user_id` | `supabase/functions/gemini-proxy/index.ts`                                                  | Безопасный прокси для Gemini, ограничение частоты вызовов |
| 2   | ✅ Добавить вебхуки оплаты: `create-payment` и `payment-webhook`            | `supabase/functions/create-payment/index.ts`, `supabase/functions/payment-webhook/index.ts` | Готовая обработка оплаты и подтверждения статуса          |
| 3   | ✅ Сгенерировать PWA-иконки 72–512px                                        | `k-sebe-yoga-studioWEB/public/icons/`                                                       | Полный набор иконок для manifest/PWA                      |
| 4   | ✅ Добавить `og-image.jpg` для соцсетей                                     | `k-sebe-yoga-studioWEB/public/og-image.jpg`                                                 | Корректный предпросмотр ссылок сайта                      |
| 5   | ✅ Рефакторинг ChatWidget: разбить на подкомпоненты и хук                   | `k-sebe-yoga-studioWEB/components/ChatWidget/`                                              | Компактный (<200 LOC) и поддерживаемый виджет чата        |

## Sprint: Полировка экосистемы (Январь 2026)

| #   | Задача                                 | Где менять                                   | Статус |
| --- | -------------------------------------- | -------------------------------------------- | ------ |
| 6   | ✅ Добавить `.env.example` в APP       | `k-sebe-yoga-studio-APPp/.env.example`       | ✅     |
| 7   | ✅ Добавить `robots.txt` в APP         | `k-sebe-yoga-studio-APPp/public/robots.txt`  | ✅     |
| 8   | ✅ Добавить `sitemap.xml` в APP        | `k-sebe-yoga-studio-APPp/public/sitemap.xml` | ✅     |
| 9   | ✅ Обновить sitemap.xml с датой 2026   | `k-sebe-yoga-studioWEB/public/sitemap.xml`   | ✅     |
| 10  | ✅ Исправить `any` типы в shared/utils | `shared/utils/index.ts`                      | ✅     |
| 11  | ✅ Исправить неиспользуемые переменные | `shared/components/Marquee.tsx`              | ✅     |
| 12  | ✅ Исправить a11y предупреждения       | Blog, BookingModal, Image                    | ✅     |
| 13  | ✅ Экранирование кавычек в JSX         | Blog.tsx, Image.tsx                          | ✅     |

## Sprint: Глобальное обновление (Январь 2026)

| #   | Задача                                  | Где менять                          | Статус |
| --- | --------------------------------------- | ----------------------------------- | ------ |
| 14  | ✅ Обновить типы для геймификации       | `shared/types/index.ts`             | ✅     |
| 15  | ✅ Добавить константы достижений        | `shared/constants/index.ts`         | ✅     |
| 16  | ✅ Добавить INSIDE_FLOW info            | `shared/constants/index.ts`         | ✅     |
| 17  | ✅ Добавить ARIA_CONFIG                 | `shared/constants/index.ts`         | ✅     |
| 18  | ✅ Добавить SUBSCRIPTION_PLANS          | `shared/constants/index.ts`         | ✅     |
| 19  | ✅ Создать COMPREHENSIVE_UPDATE_2026.md | `docs/COMPREHENSIVE_UPDATE_2026.md` | ✅     |

## 🟡 Высокий приоритет (P1) - Очень желательно перед запуском

**Рекомендуется исправить для качественного запуска**

| #   | Задача                                    | Где менять                                    | Время     | Статус |
| --- | ----------------------------------------- | --------------------------------------------- | --------- | ------ |
| 10  | **Input validation (Zod)**                | `supabase/functions/gemini-proxy/index.ts`    | 2-3 часа  | ⏳     |
| 11  | **Rate limiting в Redis/KV**              | `supabase/functions/gemini-proxy/index.ts`    | 3-4 часа  | ⏳     |
| 12  | **Webhook signature verification (HMAC)** | `supabase/functions/payment-webhook/index.ts` | 1-2 часа  | ⏳     |
| 13  | **YooKassa интеграция (полная)**          | `supabase/functions/create-payment/index.ts`  | 1-2 дня   | ⏳     |
| 14  | **Заменить 4 placeholder видео**          | `APP/components/VideoLibrary.tsx`             | 4-8 часов | ⏳     |
| 15  | **Интегрировать расписание с Supabase**   | `APP/services/dataService.ts` + новая таблица | 1-2 дня   | ⏳     |
| 16  | **Добавить database индексы**             | Новая миграция                                | 30 мин    | ⏳     |
| 17  | **Повысить test coverage до 50%+**        | Все `__tests__/`                              | Ongoing   | ⏳     |
| 18  | **Исправить nullable user_id**            | Миграция cleanup                              | 30 мин    | ⏳     |
| 19  | **Разбить Image.tsx (495 строк)**         | `shared/components/Image.tsx`                 | 2-3 часа  | ⏳     |

**Total P1:** 1-2 недели **Testing Coverage:** 15% → 50%+ **Payment
Integration:** 30% → 90%

## 🟢 Средний приоритет (P2) - После запуска, но скоро

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

## 🔵 Низкий приоритет (P3) - Backlog

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

## 📚 НОВАЯ ДОКУМЕНТАЦИЯ (январь 2026)

После полного production audit созданы три ключевых документа:

### 🎯 Для быстрого ознакомления:

- **[AUDIT_EXECUTIVE_SUMMARY.md](./AUDIT_EXECUTIVE_SUMMARY.md)** - краткий обзор
  (3 минуты чтения)

### 📊 Для детального изучения:

- **[PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)** - полный
  аудит (84 KB, 20 минут чтения)
- **[REMEDIATION_PLAN.md](./REMEDIATION_PLAN.md)** - план исправлений с кодом
  (45 KB, 15 минут чтения)

### 📖 Предыдущая документация:

- **Стратегическая дорожная карта**:
  [STRATEGIC_ROADMAP_2026.md](./STRATEGIC_ROADMAP_2026.md)
- **План действий**: [ACTION_PLAN_2026.md](./ACTION_PLAN_2026.md)
- **Комплексное обновление 2026**:
  [docs/COMPREHENSIVE_UPDATE_2026.md](./docs/COMPREHENSIVE_UPDATE_2026.md)
- **Исполнительная дорожная карта**:
  [docs/ROADMAP_EXECUTION_2026.md](./docs/ROADMAP_EXECUTION_2026.md)

---

## 📈 PRODUCTION READINESS

**Текущая оценка: 68/100**

| Метрика     | Текущее    | После P0   | После P1   | Цель       |
| ----------- | ---------- | ---------- | ---------- | ---------- |
| Security    | 55/100 🔴  | 85/100 🟢  | 90/100 🟢  | 95/100     |
| Testing     | 25/100 🔴  | 25/100 🔴  | 50/100 🟡  | 70/100     |
| Content     | 60/100 🟡  | 95/100 🟢  | 100/100 🟢 | 100/100    |
| Payment     | 30/100 🔴  | 30/100 🔴  | 90/100 🟢  | 100/100    |
| **OVERALL** | **68/100** | **75/100** | **85/100** | **90/100** |

---

## ⏱️ TIMELINE

- **Week 1 (P0):** Security + Content → 75/100
- **Week 2-3 (P1):** Backend + Features → 85/100
- **Week 4-6 (P2):** Polish + Optimization → 90/100
- **Week 7+ (P3):** Advanced Features (ongoing)

---

> Обновляйте таблицу по мере выполнения: ✅ для сделанных, ⚠️ для в работе, ⏳
> для запланированных, 🔴 для блокеров.
