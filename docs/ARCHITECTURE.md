# Архитектура экосистемы KateStudio

> **Обновлено:** 12 мая 2026 | **Версия:** 3.2.0
> Этот документ описывает не идеальную схему, а текущую реальную систему с отмеченными разломами между repo и live.

---

## 1. Контур системы

KateStudio — monorepo с двумя клиентскими поверхностями, общей библиотекой и Supabase backend:

- `k-sebe-yoga-studioWEB/` — маркетинговый сайт, витрина и входной фильтр через Telegram Кати и lead form; не является каноничной payment surface.
- `k-sebe-yoga-studio-APPp/` — пользовательское приложение, PWA + Capacitor wrapper, закрытая поверхность для допущенных пользователей и целевая YooKassa payment surface.
- `shared/` — общие типы, UI, сервисы, хуки и утилиты.
- `supabase/` — migrations и Edge Functions.
- `RuStore` — внешний канал публикации Android-приложения и публичная точка подтверждения существования app для внешних проверок; не является обязательным платежным каноном для текущей модели.

---

## 2. Runtime topology

```text
WEB (GitHub Pages / ksebe-studio.ru)
  └── storefront only
      ├── Telegram Katya
      └── lead form

APP (Firebase Hosting / preview + Capacitor mobile shell)
  └── approved users only
      └── YooKassa payment flow

RuStore
  └── Android publication + proof-of-app-existence surface

APP / WEB runtime
        │
        └── Supabase Auth + Postgres + RLS + Storage + Edge Functions
                │
                ├── AI contour
                │   ├── live: ai-run, ai-embeddings
                │   └── repo: gemini-proxy
                │
                ├── Payments contour
                │   ├── legacy/shared live overlap: create-payment, payment-webhook
                │   └── app-target repo-only pair: create-yookassa-checkout, yookassa-webhook
                │
                └── Ops contour
                    ├── cancel-subscription
                    ├── cron-maintenance
                    ├── send-push
                    └── subscribe-newsletter
```

---

## 3. Repository topology

### Root level

- `package.json` defines npm workspaces and shared scripts for lint, typecheck, tests, builds, and migration integrity checks.
- `.github/workflows/` contains 5 workflows: `ci.yml`, `deploy-pages.yml`, `firebase-deploy.yml`, `capacitor-build.yml`, `cron.yml`.
- `supabase/migrations/` currently contains **42** migration files.
- `supabase/functions/` currently contains **9** function folders plus a local README.

### Important repo growth since early May 2026

- New payment-related migration: `20260507172615_yookassa_app_payments.sql`
- New trainers domain migrations:
  - `20260509185524_trainers_phase1.sql`
  - `20260510100000_trainers_domain.sql`
  - `20260510101000_seed_trainers.sql`
  - `20260510143000_publish_new_trainers_schedule.sql`

---

## 4. Commercial operating model

### WEB canon

- WEB is a storefront, not a direct checkout surface.
- User journey on WEB is intentional pre-qualification: Telegram with Katya or lead form.
- Any direct payment affordance on WEB is out of model unless explicitly re-approved.

### APP canon

- APP is the operational surface for approved users.
- YooKassa belongs to APP, not to the public WEB funnel.
- Payment backend changes must be reviewed as app-only unless a broader business change is explicitly approved.

### RuStore role

- RuStore is part of distribution and external verification.
- RuStore publication may be needed to show that the Android app exists as a real public product during partner/payment-provider onboarding.
- RuStore monetization is a separate capability and is not required for the current KateStudio business model.

---

## 5. Database domain surfaces

### Stable core surfaces

- `profiles`
- `bookings`
- `classes`
- `subscriptions`
- `contacts`
- `analytics_events`
- `admins`
- `app_settings`
- `videos`
- `reviews`
- `faq_items`
- `site_images`
- `retreats`

### New or newly confirmed active surfaces

- `trainers`
- `class_recurring_rules`
- `classes.trainer_id`
- AI-supporting tables: `prompt_requests`, `model_metadata`, `ai_jobs`, `api_logs`, `embeddings`
- Retention/gamification surfaces: `practice_events`, `user_preferences`, `app_events`, `user_progress`, `user_achievements`

---

## 6. Repo vs live truth

| Surface | Repo | Live | Meaning |
| --- | --- | --- | --- |
| Migrations | 42 files | 37 applied | repo truth is still ahead of recorded live history, but the live baseline advanced materially after the 2026-05-10 snapshot |
| Edge Functions | 9 folders | 9 active functions | counts match, inventories do not |
| Trainers domain | present in repo | present in live | rollout is underway and no longer just repo intent |
| `profiles` hardening | recorded in repo | confirmed applied in live | this is no longer a pending-only repo security patch |

This is the architectural center of gravity right now: the system is not “missing backend”, it is partially converged and partially forked.

---

## 7. Deployment surfaces

### CI

`ci.yml` runs:

1. migration integrity check
2. lint + format check
3. typecheck
4. tests
5. WEB build
6. APP build

### Web deploy

- `deploy-pages.yml`
- target: GitHub Pages
- custom domain support through `k-sebe-yoga-studioWEB/public/CNAME`

### App deploy

- `firebase-deploy.yml`
- target: Firebase Hosting project `artful-striker-476211-h4`

### Backend deploy

- Supabase functions are deployed independently from GitHub Pages/Firebase
- This is why repo/live function inventories can diverge even when frontend deploys are green

---

## 8. Active architectural risks

1. **Migration baseline split**: several operational docs were still speaking from older live checkpoints; the current live baseline is 37 applied migrations, not 14 or 30.
2. **Function naming split**: live AI contour and repo AI contour are not the same implementation shape.
3. **Type contract split**: `shared/types/database.types.ts` is not yet a generated authoritative mirror of the accepted live baseline.
4. **Payment cutover split**: business canon is now clear, but live APP payment infrastructure still lags behind the repo-side app-only YooKassa model.
5. **Security tail risk**: `profiles` hardening is already reflected live, but leaked-password protection is still disabled in Supabase Auth.

---

## 9. Architectural conclusion

KateStudio is not in greenfield mode and not in clean steady-state either. It is in convergence mode:

- WEB canon is now clear: storefront only;
- APP is the intended transactional surface;
- RuStore is distribution and proof, not the mandatory billing canon;
- governance and reproducibility remain the actual bottlenecks.