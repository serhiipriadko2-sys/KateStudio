# Архитектура экосистемы KateStudio

> **Обновлено:** 16 июня 2026 | **Версия:** 3.3.0
> Этот документ описывает текущую рабочую архитектуру на security hardening branch `codex/security-retire-live-ai-cron-20260616` и live Supabase baseline после June hardening deploy.

---

## 1. Контур системы

KateStudio — monorepo с двумя клиентскими поверхностями, общей библиотекой и Supabase backend:

- `k-sebe-yoga-studioWEB/` — маркетинговый сайт, витрина и входной фильтр через Telegram Кати и lead form; не является каноничной payment surface.
- `k-sebe-yoga-studio-APPp/` — пользовательское приложение, PWA + Capacitor wrapper, закрытая поверхность для допущенных пользователей и целевая YooKassa payment surface.
- `shared/` — общие типы, UI, сервисы, хуки и утилиты.
- `supabase/` — migrations и Edge Functions.
- `RuStore` — внешний канал публикации Android-приложения и proof-of-app-existence surface; не является обязательным платежным каноном для текущей модели.

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
                │   ├── canonical supported path: gemini-proxy
                │   └── retired compatibility stubs: ai-run, ai-embeddings
                │
                ├── Payments contour
                │   ├── canonical APP path: create-yookassa-checkout, yookassa-webhook
                │   └── retired legacy stubs: create-payment, payment-webhook, cancel-subscription
                │
                └── Ops contour
                    ├── book-class-with-access
                    ├── cron-maintenance (custom bearer auth, fail-closed)
                    ├── send-push
                    └── subscribe-newsletter
```

---

## 3. Repository topology

### Root level

- `package.json` defines npm workspaces and shared scripts for lint, typecheck, tests, builds, and migration integrity checks.
- `.github/workflows/` contains CI/deploy/cron workflows including the scheduled `cron-maintenance` call with bearer auth.
- `supabase/migrations/` currently contains **42** migration files in the repo baseline.
- On this hardening branch, `supabase/functions/` tracks the current live function names including retired stubs for `ai-run` and `ai-embeddings`.

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

### Newer or specialized surfaces

- `trainers`
- `class_recurring_rules`
- `classes.trainer_id`
- AI-supporting tables: `prompt_requests`, `model_metadata`, `ai_jobs`, `api_logs`, `embeddings`
- Retention/gamification surfaces: `practice_events`, `user_preferences`, `app_events`, `user_progress`, `user_achievements`
- Dataset surfaces from forward reconciliation: `dataset_runs`, `dataset_artifacts`

---

## 6. Repo vs live truth

| Surface | Repo branch | Live | Meaning |
| --- | --- | --- | --- |
| Migrations | 42 files | 42 applied | current live count matches the accepted repo count, while older history hygiene remains separate |
| Edge Functions | branch tracks current live names | 12 active functions | branch/live function-name drift is closed by the June hardening branch |
| AI contour | `gemini-proxy` supported; `ai-run`/`ai-embeddings` retired stubs | same behavior deployed live | old service-role AI write surface is no longer accepted live behavior |
| Cron maintenance | fail-closed source | v6 deployed live | privileged maintenance no longer runs when `CRON_SECRET` is missing |
| Payment contour | APP-target pair canonical; legacy trio stubs | same contour deployed live | payment ownership is not the current blocker |
| Security advisors | docs expect 0 WARN | 0 WARN / INFO-only findings | release PASS now depends on exact-ref CI/promotion, not advisor WARN closure |

This is the architectural center of gravity now: the system is converging, but final release truth still depends on exact-ref CI and branch promotion.

---

## 7. Deployment surfaces

### CI

`ci.yml` runs the release path checks: migration integrity, lint/format, typecheck, tests, WEB build, and APP build.

### Web deploy

- `deploy-pages.yml`
- target: GitHub Pages
- custom domain support through `k-sebe-yoga-studioWEB/public/CNAME`

### App deploy

- `firebase-deploy.yml`
- target: Firebase Hosting project `artful-striker-476211-h4`

### Backend deploy

- Supabase functions are deployed independently from GitHub Pages/Firebase.
- This is why live function posture can be hardened before a repo PR is merged.
- Such live-first hardening must be followed by branch/PR reconciliation and an exact-ref release receipt.

---

## 8. Active architectural risks

1. **Release proof gap**: live security posture is improved, but this branch still needs exact-ref CI and promotion/merge before PASS.
2. **Retired endpoint residue**: `ai-run` and `ai-embeddings` remain addressable as compatibility stubs; deletion can be considered later only after confirming no clients rely on them.
3. **Type contract split**: `shared/types/database.types.ts` should be regenerated after the accepted baseline is intentionally promoted.
4. **Historical docs residue**: older audit files still contain late-May counts and should be treated as historical unless superseded by current receipt docs.
5. **INFO-only RLS residue**: security advisors are 0 WARN, but INFO-only empty/scaffold tables should remain visible as housekeeping.

---

## 9. Architectural conclusion

KateStudio is not greenfield and not fully steady-state. It is in controlled convergence:

- WEB canon is clear: storefront only;
- APP is the intended transactional surface;
- supported AI runs through `gemini-proxy`;
- legacy AI and payment endpoints are retired in place rather than silently deleted;
- the bottleneck has shifted from live security drift to exact release proof and branch promotion.
