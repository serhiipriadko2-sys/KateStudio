# Текущие задачи

> **Обновлено:** 16 июня 2026 | **Версия:** 5.7.0
> Источник истины: GitHub branch `codex/security-retire-live-ai-cron-20260616` + live Supabase metadata/advisors after the 2026-06-16 security hardening deploy.
> Текущий режим: `release-candidate / security hardening PR pending CI`.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **42** | Supabase `list_migrations` reaches `20260530155036_security_reconcile_grants_search_path_book_class_ledger` |
| Live Edge Functions | **12** | Supabase `list_edge_functions` after deploy |
| Live security advisors | **0 WARN / 9 INFO** | Supabase security advisors; INFO entries are `rls_enabled_no_policy` on empty/scaffold tables |
| Legacy AI contour | **retired in place** | `ai-run` v8 and `ai-embeddings` v8 return controlled retirement responses and still require JWT |
| Canonical AI contour | **`gemini-proxy`** | only supported AI operation path in this branch |
| Cron maintenance auth boundary | **hardened** | `cron-maintenance` v6 fails closed if `CRON_SECRET` is missing or invalid |
| Live APP payment path | **canonical** | `create-yookassa-checkout` + `yookassa-webhook` remain active |
| Live legacy payment trio | **retired in place** | `create-payment`, `payment-webhook`, `cancel-subscription` remain controlled stubs |
| Fresh CI/release receipt for this branch | **PENDING** | PR/CI receipt must be attached before release PASS |

---

## Что изменено в минимальном change-set

| # | Задача | Статус | Что подтверждено |
| --- | --- | --- | --- |
| 1 | Disable/harden `ai-run` | DONE | live v8 is a JWT-protected retired stub |
| 2 | Disable/harden `ai-embeddings` | DONE | live v8 is a JWT-protected retired stub |
| 3 | Make `cron-maintenance` fail closed | DONE | live v6 returns `server_misconfigured` if `CRON_SECRET` is absent and `unauthorized` on invalid bearer |
| 4 | Track legacy AI stubs in repo | DONE ON BRANCH | branch adds `supabase/functions/ai-run/index.ts` and `supabase/functions/ai-embeddings/index.ts` |
| 5 | Refresh release truth docs | IN PROGRESS | current docs no longer use the stale `41 / 11 / 1 warning` snapshot |
| 6 | Attach fresh CI/release receipt | PENDING | required before full release PASS |

---

## Открытый release/security blocker

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | Fresh exact-ref release proof | live is hardened, but the repo branch still needs green CI and promotion/merge before it can be called a release PASS |

---

## Background follow-up, non-gating in this change-set

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 1 | Decide whether to delete retired AI endpoints later | LATER | current safer move is retire-in-place, not deletion |
| 2 | Review INFO-only RLS tables | LATER | advisors are INFO, not WARN; keep as housekeeping unless data appears in those tables |
| 3 | Regenerate DB types after accepted baseline | LATER | useful hygiene, not part of this minimal security patch |
| 4 | Runtime/browser E2E smoke | LATER | needs normal browser/app flow and test identities, outside this connector-only change-set |

---

## Ближайший рабочий шаг

1. Open the PR for `codex/security-retire-live-ai-cron-20260616`, wait for CI, and use the exact branch/PR SHA as the release receipt.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Live Supabase security advisors | PASS at WARN level; INFO remains |
| Live Edge Function auth posture | PARTIAL+; target risks are fixed, but final release proof pending |
| Repo/live function drift | PARTIAL; fixed on branch/live, not yet merged to `main` |
| Docs truth | PARTIAL; current release docs refreshed, historical docs remain historical |
| Overall launch readiness | **PARTIAL** until fresh exact-ref CI/release receipt is green and attached |
