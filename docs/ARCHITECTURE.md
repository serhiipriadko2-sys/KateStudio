# Архитектура экосистемы KateStudio

> **Обновлено:** 10 мая 2026 | **Версия:** 3.0.0
> Этот документ описывает не идеальную схему, а текущую реальную систему с отмеченными разломами между repo и live.

---

## 1. Контур системы

KateStudio — monorepo с двумя клиентскими поверхностями, общей библиотекой и Supabase backend:

- `k-sebe-yoga-studioWEB/` — маркетинговый сайт + admin surfaces.
- `k-sebe-yoga-studio-APPp/` — пользовательское приложение, PWA + Capacitor wrapper.
- `shared/` — общие типы, UI, сервисы, хуки и утилиты.
- `supabase/` — migrations и Edge Functions.

---

## 2. Runtime topology

```text
WEB (GitHub Pages / ksebe-studio.ru)
APP (Firebase Hosting / preview + Capacitor mobile shell)
        │
        └── Supabase Auth + Postgres + RLS + Storage + Edge Functions
                │
                ├── AI contour
                │   ├── live: ai-run, ai-embeddings
                │   └── repo: gemini-proxy
                │
                ├── Payments contour
                │   ├── repo/live overlap: create-payment, payment-webhook
                │   └── repo-only legacy/new pair: create-yookassa-checkout, yookassa-webhook
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

## 4. Database domain surfaces

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
- `classes.trainer_id`
- AI-supporting tables: `prompt_requests`, `model_metadata`, `ai_jobs`, `api_logs`, `embeddings`
- Retention/gamification surfaces: `practice_events`, `user_preferences`, `app_events`, `user_progress`, `user_achievements`

---

## 5. Repo vs live truth

| Surface | Repo | Live | Meaning |
| --- | --- | --- | --- |
| Migrations | 42 files | 14 applied | repo truth is ahead of recorded live history |
| Edge Functions | 9 folders | 9 active functions | counts match, inventories do not |
| Trainers domain | present in repo | present in live | rollout is underway, but docs lag |
| `profiles` hardening patch | prepared in repo | not confirmed applied | main security blocker persists |

This is the architectural center of gravity right now: the system is not “missing backend”, it is partially converged and partially forked.

---

## 6. Deployment surfaces

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

## 7. Active architectural risks

1. **Security truth split**: repo has catch-up hardening patch, live still exposes `profiles` broadly.
2. **Function naming split**: live AI contour and repo AI contour are not the same implementation shape.
3. **Migration history split**: live has meaningful schema that is not fully represented by applied migration history.
4. **Type contract split**: `shared/types/database.types.ts` is not yet a generated authoritative mirror of live.

---

## 8. Architectural conclusion

KateStudio is not in greenfield mode and not in clean steady-state either. It is in convergence mode:

- frontend/workflow scaffolding is mature;
- backend capability set is richer than old docs imply;
- governance and reproducibility are the actual bottlenecks.
