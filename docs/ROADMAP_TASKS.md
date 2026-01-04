# Roadmap задач после анализа

> Обновлено: 4 января 2026 · Основано на `ANALYSIS.md`, `ROADMAP.md` и
> `docs/ROADMAP_EXECUTION_2026.md`

## Краткие выводы анализа

- Монорепо, shared и PWA готовы; слабые места — безопасность ключей, платежи и
  покрытие тестами.
- AI/чат — основная ценность, требует устойчивого прокси и контроля квот.
- Retention держится на streak/push/контенте; монетизация ещё не подключена.

## Roadmap задач

### NOW (январь 2026) — 2 недели

1. **Запустить Supabase Phone Auth в проде + применить миграции RLS.**
   - Результат: OTP-вход работает; `profiles/bookings` привязаны к `auth.users`.
   - Артефакты: `supabase/migrations/*`, `supabase/.env.local.example`,
     `k-sebe-yoga-studio-APPp/components/Profile.tsx`.
2. **Закрыть Gemini proxy секреты и лимиты.**
   - Результат: `GEMINI_API_KEY` в secrets, логирование квот, отказ для дорогих
     операций без JWT.
   - Артефакты: `supabase/functions/gemini-proxy/index.ts`,
     `supabase/functions/README.md`.
3. **Монетизация: каркас платежей.**
   - Результат: Paywall UI + драфт edge functions
     `create-payment`/`payment-webhook`.
   - Артефакты: `shared/components/Paywall.tsx`,
     `k-sebe-yoga-studio-APPp/services/paymentService.ts`,
     `supabase/functions/create-payment/index.ts`,
     `supabase/functions/payment-webhook/index.ts`.
4. **Тесты критических потоков (цель: 40% coverage).**
   - Результат: Vitest-сьюиты для Pricing/Blog/ChatWidget/dataService.
   - Артефакты: `shared/__tests__/`,
     `k-sebe-yoga-studioWEB/components/__tests__/`,
     `k-sebe-yoga-studio-APPp/services/__tests__/`.

### NEXT (февраль–март 2026)

- Push-уведомления: FCM сервис + messaging SW для APP.
- Retention: weekly recap + “практика дня” (сначала эвристика, затем AI).
- Offline видео: загрузка и кеш в IndexedDB; graceful fallback.
- Рефакторинг ChatWidget (APP) до ~200 LOC: вынести input/messages/логика в хук.

### LATER (Q2 2026)

- Продуктовая аналитика + Sentry для WEB/APP.
- Performance: route-based code splitting, WebP/srcset, Core Web Vitals 90+.
- AI-программы на 7 дней + тарифные лимиты AI.

## Метрики контроля

- Auth conversion (OTP → профайл): 60%+.
- AI proxy отказов (429/401): <3% сессий в сутки.
- Время ответа AI (p95): <2.5s на текст, <6s на multimodal.
