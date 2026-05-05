# Launch Checklist & Gap Analysis

> **Обновлено:** 2 мая 2026
> **Верифицировано:** local checks + Supabase metadata-only audit.
> **Текущий verdict:** local PASS, production launch readiness **FAIL** до снятия P0 Supabase drift.

---

## 1. Verification Snapshot

| Проверка | Статус | Evidence |
| --- | --- | --- |
| `npm run check:migrations` | PASS | 37 migration files, known collision groups documented by checker |
| `npm run typecheck` | PASS | 0 TypeScript errors |
| `npm run lint` | PASS | command completed successfully |
| `npm run test:run` | PASS | 489 tests / 64 files |
| `npm run build:web` | PASS | Vite build succeeds, large chunk warning remains |
| `npm run build:app` | PASS | Vite build succeeds, same large chunk warning |
| Supabase metadata audit | PASS as audit | no user-row reads, no production mutation |
| Launch readiness | FAIL | P0 live Supabase blockers remain |

Primary evidence file: [SUPABASE_AUDIT_LIVE_2026_05_02.md](./SUPABASE_AUDIT_LIVE_2026_05_02.md).

---

## 2. Database / Migrations

| Area | Status | Evidence / Note |
| --- | --- | --- |
| Repo migrations | PASS local integrity | 37 SQL files |
| Live applied migrations | FAIL governance | 12 applied migrations |
| Repo migrations | PASS local integrity | 37 SQL files after P0 catch-up migration |
| Schema reproducibility | FAIL until branch apply | repo/live baseline mismatch; catch-up migration prepared |
| `contacts` | Live exists, migration governance drift | earlier "missing CREATE" should be read as baseline mismatch, not absence in live |
| `classes` | Live exists, migration governance drift | local type does not match live columns |
| `profiles` | FAIL live / patch ready | public `ALL` policy still active in live; catch-up migration removes it |
| `dialogue` | FAIL | RLS enabled, 0 policies |
| `database.types.ts` | FAIL contract | hand-crafted types drift from live schema |

Required action: create branch/local reproduction target, baseline live schema, prove reset/replay outside production, then regenerate types.

Prepared repo patch:

- `supabase/migrations/20260502095933_p0_live_rls_governance_catchup.sql`
- `k-sebe-yoga-studioWEB/components/admin/tabs/UsersTab.tsx`
- `shared/types/database.types.ts`
- `shared/types/index.ts`

---

## 3. Security (P0/P1)

| Component | Problem | Status |
| --- | --- | --- |
| `profiles` RLS | `Allow public read/write profiles`, `ALL`, public, `true/true` | P0 FAIL |
| `profiles.is_admin` | legacy admin flag still present live | P0/P1 until open policy is removed |
| `dialogue` | RLS enabled, no policies | P1 FAIL |
| Function `search_path` | `is_admin`, timestamp triggers, `get_admin_analytics` mutable | P1 FAIL |
| SECURITY DEFINER execute | `rls_auto_enable`, `get_admin_analytics` advisor warnings | P1 FAIL |
| Permissive inserts | `analytics_events`, `contacts`, `ai_jobs`, `api_logs` | P1 review |
| Storage `images` | public listing policy, no MIME/size limits | P1 FAIL |
| GraphQL exposure | many public tables visible to anon/authenticated roles | P1 review |
| Leaked password protection | disabled | P1 FAIL |

Security score is no longer tracked as a numeric value here. The truthful status is simpler: production launch remains blocked while P0 policies and drift exist.

---

## 4. Edge Functions

| Function | Repo | Live | Status |
| --- | --- | --- | --- |
| `ai-run` | no | yes, v3 ACTIVE | AI frozen, inventory only |
| `ai-embeddings` | no | yes, v3 ACTIVE | AI frozen, inventory only |
| `gemini-proxy` | yes | no | frozen AI scope, do not deploy/change without decision |
| `create-payment` | yes | no | launch blocker for YooKassa |
| `payment-webhook` | yes | no | launch blocker for payments |
| `cancel-subscription` | yes | no | not live |
| `cron-maintenance` | yes | no | not live |
| `send-push` | yes | no | not live |
| `subscribe-newsletter` | yes | no | not live |

Required action: decide non-AI deployment path separately from AI architecture. AI functions and model routing remain frozen until explicit approval.

---

## 5. Content / Assets

| Asset | Problem | Status |
| --- | --- | --- |
| WEB images | local asset migration previously completed | not re-audited in this pass |
| APP images | prior grep found Unsplash placeholders removed | not re-audited in this pass |
| VideoLibrary URLs | content quality requires validation through safe workflow | open |
| PWA icons / og-image | previously completed | not re-audited in this pass |

No live `videos` rows were read in this audit. Treat video readiness as an open content task until verified through an approved content review path.

---

## 6. Deploy / Infrastructure

| Element | Status | Note |
| --- | --- | --- |
| Local env files | manual | create from `.env.example`; never commit secrets |
| GitHub Secrets | partial/unknown in this audit | not re-read here |
| Firebase deploy workflow | repo-present | not run in this audit |
| Web/App builds | PASS | both build successfully |
| Capacitor native path | repo-present | no native release artifact produced here |
| Supabase production | FAIL launch readiness | branch-first remediation required |

---

## 7. Native / Mobile

| Element | Status | Note |
| --- | --- | --- |
| App build | PASS | `npm run build:app` |
| Android/iOS signed release | open | depends on signing secrets and release workflow verification |
| Native runtime QA | not run | outside audit-first scope |

---

## 8. Current Open Blockers

| Priority | Blocker | Required action |
| --- | --- | --- |
| P0 | `profiles` public `ALL true/true` policy | remove on branch/remediation path, verify anon/auth/admin behavior |
| P0 | Migration drift: 12 live applied vs 37 repo SQL | baseline/reconcile schema in branch or local reproduction target |
| P0 | Edge Functions drift | decide/deploy non-AI functions; handle AI separately |
| P1 | `database.types.ts` live schema drift | regenerate after schema baseline, then fix app type mismatches |
| P1 | Mutable function `search_path` / exposed SECURITY DEFINER | pin/revoke after branch verification |
| P1 | Storage bucket hardening | MIME allowlist, size limit, listing review, `interf` decision |
| P1 | YooKassa not live | deploy payment functions after secrets and branch/staging validation |
| P2 | Performance advisors | unindexed FKs, RLS initplan, multiple permissive policies |
| P3 | Product/content backlog | videos, coverage, Lighthouse, mobile release QA |

---

## 9. Next Steps

1. Unblock Supabase branch execution: current org requires Pro plan or another approved staging target.
2. Generate/commit a live schema baseline in a controlled branch.
3. Fix `profiles` open policy and verify access contexts.
4. Consolidate RLS policies and pin function `search_path`.
5. Harden storage buckets.
6. Decide non-AI Edge Function deployment path.
7. Regenerate DB types from reconciled schema.
8. Re-run advisors and local verification.

---

## 10. Definition Of Launch PASS

Launch PASS requires:

- local checks still pass: migrations, typecheck, lint, tests, web build, app build;
- P0 Supabase advisors/drift cleared or explicitly accepted by owner;
- production schema reproducible from repo baseline/migrations;
- Edge Function live status intentionally matches launch architecture;
- AI scope remains frozen unless separately approved;
- no secrets exposed and no user data read for verification beyond approved operational checks.

---

## 11. Branch Remediation Status - 2026-05-05

Attempted branch-first execution through Supabase MCP:

| Step | Status | Evidence |
| --- | --- | --- |
| MCP project access | PASS | `qkaycdcbstjobacmuaro`, org `lwydigvmulkaunbosesd`, `ACTIVE_HEALTHY` |
| Branch cost check | PASS | `branch`, `0.01344` hourly |
| Cost confirmation | PASS | MCP returned confirmation id |
| Create branch | FAIL blocked | `PaymentRequiredException`: branching requires Pro plan or above |
| Apply catch-up migration | NOT RUN | no branch was created |
| Production mutation | NOT RUN | production intentionally unchanged |

Current launch verdict remains **FAIL**. The prepared P0 migration can only be validated after either Supabase branching is enabled or an explicitly approved staging project is provided.
