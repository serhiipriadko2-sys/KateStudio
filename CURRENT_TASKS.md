# Текущие задачи

> **Обновлено:** 2 мая 2026 | **Версия:** 4.2.0
> Источник истины: код + `package.json` + миграции + live Supabase metadata audit.
> Текущий режим: audit-first completion. Production mutation и AI scope changes запрещены без отдельного решения.

> **2026-05-05 branch-remediation update:** Supabase MCP re-auth/access works, but creating dev branch `p0-live-rls-governance-catchup` is blocked by Supabase plan eligibility: `PaymentRequiredException`, `Branching is supported only on the Pro plan or above`. Production remains unchanged.

---

## Верифицированные метрики (2 мая 2026)

| Метрика | Значение | Как проверено |
| --- | --- | --- |
| Tests passing | **489** | `npm run test:run` |
| Test files | **64** | `npm run test:run` |
| TypeScript errors | **0** | `npm run typecheck` |
| Lint | **PASS** | `npm run lint` |
| Web build | **PASS** | `npm run build:web` |
| App build | **PASS** | `npm run build:app` |
| Repo Edge Functions | **7** | `supabase/functions/` |
| Live Edge Functions | **2** | Supabase MCP `_list_edge_functions` |
| Repo migrations | **37** | `supabase/migrations/` |
| Live applied migrations | **12** | Supabase MCP `_list_migrations` |
| Public tables live | **27** | metadata-only SQL |

Сборки проходят, но обе Vite-сборки предупреждают о крупном чанке `assets/index-DlAt0FZ_.js` около `357.68 kB`.

---

## 🔴 P0 — Блокеры запуска

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 1 | **`profiles` RLS** — убрать public `ALL true/true` policy | ⛔ | Repo catch-up migration prepared; live policy still active; Supabase branch creation blocked by plan |
| 2 | **Migration drift** — reconcile live schema vs repo | ⛔ | 12 applied migrations live vs 37 SQL files repo; branch-first apply blocked until Pro/staging path |
| 3 | **Edge Functions drift** — решить live/repo split | ⛔ | Live: `ai-run`, `ai-embeddings`; repo 7 functions not deployed |
| 4 | **AI contour frozen** | 🔒 | Не менять `gemini-proxy`, `ai-run`, `ai-embeddings`, prompts/model routing/env contracts |
| 5 | **YooKassa live path** | 🔄 | Требует non-AI function deployment + secrets validation |

> GitHub Secrets и production secret values не проверялись в этом audit-first pass. Секреты не читать и не печатать.

---

## 🟠 P1 — Launch blockers after P0

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 6 | `database.types.ts` align/regenerate from reconciled schema | 🔄 | Current TS contract patched for known live/app drift; final regeneration still after branch apply |
| 7 | RLS policy consolidation | ⏳ | `profiles` 8 policies, `bookings` 9, `app_settings` 4 |
| 8 | `dialogue` decision | ⏳ | RLS enabled, 0 policies |
| 9 | Function hardening | ⏳ | mutable `search_path` advisors |
| 10 | SECURITY DEFINER execute review | ⏳ | `rls_auto_enable`, `get_admin_analytics` exposed by advisors |
| 11 | Storage hardening | ⏳ | `images` no MIME/size limits, broad listing; `interf` undocumented |
| 12 | Non-AI Edge Function deployment plan | ⏳ | payments, webhook, push, cron, newsletter, cancel-subscription |

---

## 🟡 P2 — Cleanup / Performance

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 13 | Unindexed FK cleanup | ⏳ | advisors: `ai_jobs`, `api_logs`, `bookings`, `prompt_requests` |
| 14 | RLS initplan optimization | ⏳ | wrap `auth.uid()`/auth functions as `(select auth.uid())` where appropriate |
| 15 | Multiple permissive policies cleanup | ⏳ | advisors across `reviews`, `site_images`, `subscriptions`, `user_push_tokens`, `videos` |
| 16 | Bundle split / chunk warning | ⏳ | Vite chunk warning over 250 kB |
| 17 | Test coverage increase | ⏳ | target remains 70%+ |

---

## 🔵 P3 — Product Backlog

| # | Задача | Статус |
| --- | --- | --- |
| 18 | Verify/replace real VideoLibrary URLs through approved content workflow | ⏳ |
| 19 | `PersonalProgram` 7-day programs | ⏳ |
| 20 | Activate Retreats section in WEB (`App.tsx`) | ⏳ |
| 21 | Activate AI Subscription in WEB after AI decision | ⏳ |
| 22 | i18n support | ⏳ |
| 23 | Storybook for components | ⏳ |
| 24 | Lighthouse 90+ | ⏳ |
| 25 | Analytics integration (Mixpanel/GA) | ⏳ |

---

## Тесты

| Метрика | Текущее | Цель |
| --- | --- | --- |
| Tests passing | **489** | 600+ |
| Test files | **64** | 80+ |
| Coverage | ~35%+ | 70% |

Динамика: 208 (янв) → 368 (фев) → 473 (март) → **489 (май)**.

---

## Production Readiness

Числовой score временно снят с канона. Пока live Supabase имеет P0 drift, честный статус:

| Домен | Статус |
| --- | --- |
| Local code health | PASS |
| Security governance | FAIL |
| Schema reproducibility | FAIL |
| Edge Functions launch path | FAIL |
| AI boundary | FROZEN |
| Overall launch readiness | **FAIL** |

Branch remediation evidence, 2026-05-05:

- MCP project access: PASS for `qkaycdcbstjobacmuaro` / `kate`.
- Branch cost: `0.01344` hourly, confirmed through MCP.
- Branch create: FAIL, `PaymentRequiredException`; Supabase branching requires Pro plan or above.
- Catch-up migration apply: NOT RUN because no branch was created.
- Production merge/hotfix: NOT RUN; production unchanged by design.

---

## Ключевые команды

```bash
npm run check:migrations
npm run typecheck
npm run lint
npm run test:run       # 489 tests / 64 files
npm run build:web
npm run build:app
```

Источник команд: `package.json` (не старые доки).

---

## Текущий audit artifact

- [docs/SUPABASE_AUDIT_LIVE_2026_05_02.md](./docs/SUPABASE_AUDIT_LIVE_2026_05_02.md)
- [docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md)
- [supabase/migrations/20260502095933_p0_live_rls_governance_catchup.sql](./supabase/migrations/20260502095933_p0_live_rls_governance_catchup.sql)

---

> Обновляй таблицы по мере выполнения: ✅ / 🔄 / ⏳ / ⛔ / 🔒
