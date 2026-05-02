# Центральный индекс документации | K Sebe Ecosystem

> **Единая точка входа для всей технической и стратегической документации**
> **Обновлено:** 2 мая 2026 | **Версия:** 8.1.0

---

## Навигация

### Инженерный протокол (читать первым)

- [**ISKRA_CODER.md**](../ISKRA_CODER.md) — **КАНОН** Полный инженерный протокол Искра-Кодер vΩ.6
- [**AGENTS.md**](../AGENTS.md) — Мульти-агентная архитектура и приоритет источников
- [**CLAUDE.md**](../CLAUDE.md) — Claude Code overlay (быстрый рабочий контур)
- [**QWEN.md**](../QWEN.md) — Qwen overlay

---

### Активная работа

- [**CURRENT_TASKS.md**](../CURRENT_TASKS.md) — **СЮДА** Верифицированные задачи и метрики (май 2026)
- [**CHANGELOG.md**](../CHANGELOG.md) — История версий (последняя: 3.0.0 — март 2026)

---

### Техническая документация

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) — Архитектура системы, workspace topology, CI/CD
- [**EDGE_FUNCTIONS.md**](./EDGE_FUNCTIONS.md) — 7 Edge Functions: назначение, env, auth, endpoints
- [**TESTING.md**](./TESTING.md) — Тестовая архитектура, паттерны, coverage (актуальная проверка: 489 тестов / 64 suites)
- [**LAUNCH_CHECKLIST.md**](./LAUNCH_CHECKLIST.md) — Pre-launch gap analysis (статус: май 2026)
- [**SECURITY_MODEL.md**](./SECURITY_MODEL.md) — Role narrative: кто что видит, trust boundaries, механизмы защиты
- [**ADMIN_SETUP.md**](./ADMIN_SETUP.md) — Настройка admin-панели

---

### Security и аудиты

- [**SUPABASE_AUDIT_LIVE_2026_05_02.md**](./SUPABASE_AUDIT_LIVE_2026_05_02.md) — **АКТУАЛЬНО** Audit-first live Supabase recheck (май 2026): P0 repo/live drift сохраняется
- [**SUPABASE_AUDIT_LIVE_2026_03_15.md**](./SUPABASE_AUDIT_LIVE_2026_03_15.md) — Исторический прямой аудит live Supabase (март 2026)
- [**SECURITY_REPORT_2026_02_11.md**](./SECURITY_REPORT_2026_02_11.md) — Аудит безопасности (февраль 2026): все P0 устранены
- [**COMPREHENSIVE_AUDIT_FEB_2026.md**](./COMPREHENSIVE_AUDIT_FEB_2026.md) — Полный аудит (февраль 2026)
- [**SUPABASE_AUDIT_REPORT.md**](./SUPABASE_AUDIT_REPORT.md) — Аудит базы данных (устаревший)

---

### Стратегия 2026

- [**DEEP_ANALYSIS_2026.md**](./DEEP_ANALYSIS_2026.md) — Глубокий анализ с исследованием трендов
- [**IMPLEMENTATION_GUIDE_2026.md**](./IMPLEMENTATION_GUIDE_2026.md) — Практическое руководство разработчика
- [**COMPREHENSIVE_UPDATE_2026.md**](./COMPREHENSIVE_UPDATE_2026.md) — Комплексное обновление (AI, монетизация)
- [**STRATEGIC_ROADMAP_2026.md**](../STRATEGIC_ROADMAP_2026.md) — Дорожная карта Q1–Q4 2026
- [**PRODUCT_GROWTH_PLAYBOOK.md**](./PRODUCT_GROWTH_PLAYBOOK.md) — Стратегия роста и метрики

---

### Для контрибьюторов

- [**DEVELOPER_GUIDE.md**](../DEVELOPER_GUIDE.md) — Быстрый старт для разработчиков
- [**CONTRIBUTING.md**](../CONTRIBUTING.md) — Руководство контрибьютора
- [**CODE_OF_CONDUCT.md**](../CODE_OF_CONDUCT.md) — Кодекс поведения

---

### Компонентная документация

- [**shared/README.md**](../shared/README.md) — Документация shared-библиотеки (`@ksebe/shared`)
- [**k-sebe-yoga-studio-APPp/README.md**](../k-sebe-yoga-studio-APPp/README.md) — APP: запуск, Capacitor, Android/iOS
- [**k-sebe-yoga-studioWEB/CACHE_STRATEGY.md**](../k-sebe-yoga-studioWEB/CACHE_STRATEGY.md) — Стратегия кеширования WEB

---

## Верифицированные метрики (2 мая 2026)

### Технические метрики

| Метрика | Текущее | Q4 2026 Target |
| --- | --- | --- |
| Tests passing | **489** | 600+ |
| Test suites | **64** | 80+ |
| TypeScript errors | **0** | 0 |
| Lint errors | **0** | 0 |
| Lint warnings | not counted in current audit | 0 |
| Edge Functions | repo 7 / live 2 | 7+ |
| Coverage | ~35% | 70%+ |

### Бизнес метрики (план)

| Метрика | Q1 2026 | Q4 2026 Target |
| --- | --- | --- |
| MAU | 2,000 | 50,000 |
| Paid Users | 100 | 4,000 |
| Conversion | 5% | 8% |
| D30 Retention | 15% | 40% |

---

## Текущий статус (2 мая 2026)

**TypeScript:** 0 ошибок | **Lint:** PASS | **Tests:** 489/64 ✅ | **Launch readiness:** FAIL до снятия P0 Supabase drift

### Завершено (с февраля 2026)

- ✅ Zod validation в `gemini-proxy`
- ✅ 4 новых Edge Functions: `cancel-subscription`, `cron-maintenance`, `send-push`, `subscribe-newsletter`
- ✅ `Achievements` UI, `DailyRecommendation`, `StreakCalendar`
- ✅ RLS фиксы: `analytics_events`, `profiles` update policy
- ✅ Миграции: `retreats_table`, `admin_subscriptions_rls`, `analytics_rpc`
- ✅ Monitoring (Sentry), Push Notifications (FCM)
- ✅ Tests: 208 → 473 (рост ×2.3)

### Открыто (P0 блокеры)

- 🔴 Live `profiles` имеет public `ALL true/true` RLS policy
- 🔴 Migration drift: 12 applied live migrations vs 36 repo SQL files
- 🔴 Edge Functions drift: live `ai-run`/`ai-embeddings`, repo 7 functions not deployed
- 🔒 AI contour frozen: не менять `gemini-proxy`, live AI functions, prompts/model routing без отдельного решения
- 🔄 YooKassa / push / newsletter / cron зависят от решения по non-AI Edge Function deployment

---

## Статус drift-документов

Следующие документы содержат устаревшие данные и не являются рабочим каноном:

| Документ | Проблема |
| --- | --- |
| `PRODUCTION_READINESS_AUDIT.md` | Дата февраль 2026, цифры устарели |
| `AUDIT_EXECUTIVE_SUMMARY.md` | Устаревший статус задач |
| `ECOSYSTEM_AUDIT.md` | Исторический аудит, не актуален |
| `SYNC_REPORT.md` | Устаревший отчёт о синхронизации |

Рабочий канон: `CURRENT_TASKS.md` + код + миграции + текущий live audit 2026-05-02.

---

**Последнее обновление:** 2 мая 2026 | **Версия:** 8.1.0 | **Следующий ревью:** после branch-first Supabase remediation
