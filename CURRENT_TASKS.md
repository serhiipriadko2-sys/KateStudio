# Текущие задачи

> **Обновлено:** 15 марта 2026 | **Версия:** 4.0.0
> Источник истины: код + `package.json` + миграции. Цифры верифицированы запуском.

---

## Верифицированные метрики (15 марта 2026)

| Метрика | Значение | Как проверено |
| --- | --- | --- |
| Tests passing | **473** | `npm run test:run` |
| Test suites | **60** | `npm run test:run` |
| TypeScript errors | **0** | `npm run typecheck` |
| Lint errors | **0** | `npm run lint` |
| Lint warnings | **75** | `npm run lint` |
| Edge Functions | **7** | `ls supabase/functions/` |
| Migrations | **20+** | `ls supabase/migrations/` |

---

## 🔴 P0 — Блокеры запуска

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 1 | **GEMINI_API_KEY** — установить в Supabase Vault | ⏳ | AI features не работают без него |
| 2 | **YooKassa** — завершить интеграцию платежей | 🔄 | `create-payment` Edge Function частично готова |
| 3 | **Placeholder видео** в APP VideoLibrary | ⏳ | 4 URL нужно заменить реальными |
| 4 | **.env файлы** — создать локально из `.env.example` | ⏳ | Нужно каждому разработчику вручную |

> GitHub Secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `FIREBASE_SERVICE_ACCOUNT`) — ✅ установлены Семёном.

---

## 🟡 P1 — Завершено с февраля

| # | Задача | Статус |
| --- | --- | --- |
| 5 | Zod input validation в `gemini-proxy` | ✅ |
| 6 | Rate limiting в `gemini-proxy` | ✅ |
| 7 | Webhook HMAC verification | ✅ |
| 8 | Расписание интегрировано с Supabase | ✅ |
| 9 | Database индексы (миграция) | ✅ |
| 10 | Nullable `user_id` — исправлен | ✅ |
| 11 | `Image.tsx` разбит на подкомпоненты | ✅ |
| 12 | Типы БД `database.types.ts` — сгенерированы | ✅ |

---

## 🟢 P2 — Завершено с февраля

| # | Задача | Статус |
| --- | --- | --- |
| 13 | Default exports убраны из `shared/` | ✅ |
| 14 | Хардкод вынесен в константы | ✅ |
| 15 | `Achievements` UI | ✅ |
| 16 | `DailyRecommendation` компонент | ✅ |
| 17 | `StreakCalendar` визуализация | ✅ |
| 18 | Veo + Image Edit в `gemini-proxy` | ✅ |
| 19 | Newsletter Edge Function (`subscribe-newsletter`) | ✅ |
| 20 | Monitoring / Sentry (`shared/services/monitoring.ts`) | ✅ |
| 21 | Cron jobs (`cron-maintenance` Edge Function) | ✅ |
| 22 | Push Notifications FCM (`send-push` Edge Function) | ✅ |
| 23 | Cancel Subscription (`cancel-subscription` Edge Function) | ✅ |
| 24 | Оптимизация изображений WebP | 🔄 |

---

## 🔵 P3 — Backlog

| # | Задача | Статус |
| --- | --- | --- |
| 25 | `PersonalProgram` 7-дневные программы | ⏳ |
| 26 | Активировать секцию Retreats в WEB (`App.tsx`) | ⏳ |
| 27 | Активировать AI Subscription в WEB | ⏳ |
| 28 | i18n поддержка | ⏳ |
| 29 | Storybook для компонентов | ⏳ |
| 30 | Performance optimization (Lighthouse 90+) | ⏳ |
| 31 | Analytics integration (Mixpanel/GA) | ⏳ |

---

## Тесты

| Метрика | Текущее | Цель |
| --- | --- | --- |
| Tests passing | **473** | 600+ |
| Test suites | **60** | 80+ |
| Coverage | ~35%+ | 70% |

Динамика: 208 (янв) → 368 (фев) → **473 (март)**.

---

## Production Readiness (оценка)

| Метрика | Текущее | Цель |
| --- | --- | --- |
| Security | 90/100 | 95/100 |
| Testing | 35/100 | 70/100 |
| Content | 85/100 | 100/100 |
| Payment | 30/100 | 100/100 |
| Mobile/Native | 75/100 | 90/100 |
| **OVERALL** | **~82/100** | **90/100** |

---

## Ключевые команды

```bash
npm run test:run       # 473 тестов / 60 suites
npm run typecheck      # 0 ошибок
npm run lint           # 0 errors / 75 warnings
npm run build:web
npm run build:app
```

Источник команд: `package.json` (не старые доки).

---

> Обновляй таблицы по мере выполнения: ✅ / 🔄 / ⏳
