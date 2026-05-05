# Supabase Live Audit | KateStudio | qkaycdcbstjobacmuaro

> **Дата:** 2 мая 2026  
> **Проект:** `kate` · `eu-central-1` · PostgreSQL `17.6.1.054` · `ACTIVE_HEALTHY`  
> **Метод:** Supabase MCP metadata/advisors + metadata-only SQL + локальные repo checks  
> **Граница:** без чтения пользовательских строк, без production mutation, без изменения AI-контура  
> **Вердикт:** **FAIL для launch-ready** до снятия P0 Supabase drift

---

## 0) Executive Verdict

[FACT] Локальный репозиторий проходит текущий verification path:

| Проверка | Статус | Evidence |
| --- | --- | --- |
| `npm run check:migrations` | PASS | `37 files`, `2 known collision group(s)`, `1 legacy short timestamp file(s)` |
| `npm run typecheck` | PASS | 0 TypeScript errors |
| `npm run lint` | PASS | command completed successfully |
| `npm run test:run` | PASS | `64 passed (64)`, `489 passed (489)` |
| `npm run build:web` | PASS | build completed, large chunk warning |
| `npm run build:app` | PASS | build completed, same large chunk warning |

[FACT] Live Supabase всё ещё не является launch-ready:

- 12 applied migrations in live vs 37 SQL migration files in repo.
- Live Edge Functions: only `ai-run` and `ai-embeddings`.
- Repo Edge Functions: 7 functions, none are deployed in live function inventory.
- `profiles` still has open `ALL` policy with `USING true` and `WITH CHECK true`.
- Security advisors still flag `dialogue` RLS/no policies, mutable `search_path`, permissive RLS policies, public bucket listing, GraphQL exposure, executable SECURITY DEFINER functions, and leaked password protection disabled.

[INTERP] Главный разлом не в TypeScript и не в сборке. Главный разлом - production Supabase governance: схема, политики, functions и типы не стоят на одном каноне.

---

## 1) Evidence Scope

Этот аудит использовал только безопасные источники:

- Supabase project metadata: `_get_project`.
- Supabase migration/function inventory: `_list_migrations`, `_list_edge_functions`.
- Supabase advisors: `_get_advisors` for `security` and `performance`.
- Metadata-only SQL against `pg_class`, `pg_policy`, `pg_policies`, `information_schema.columns`, `storage.buckets`, `pg_proc`, `pg_type`, `pg_enum`.
- Repo filesystem facts: `supabase/migrations`, `supabase/functions`, `shared/types/database.types.ts`, `package.json` scripts.

Не выполнялось:

- чтение пользовательских строк или content rows;
- изменение live DB;
- deploy/merge/branch mutation;
- чтение или изменение live `ai-run` / `ai-embeddings` code;
- изменение repo AI files: `gemini-proxy`, model routing, prompts, AI env contracts.

Supabase docs used as current operating guidance:

- `https://supabase.com/docs/guides/api/securing-your-api`
- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `https://supabase.com/docs/guides/storage/security/access-control`
- `https://supabase.com/docs/guides/database/secure-data`

---

## 2) Live Snapshot

| Domain | Live fact |
| --- | --- |
| Project ID | `qkaycdcbstjobacmuaro` |
| Name | `kate` |
| Region | `eu-central-1` |
| Status | `ACTIVE_HEALTHY` |
| Database | PostgreSQL `17.6.1.054`, engine `17`, channel `ga` |
| Created | `2025-12-10T03:11:36.751735Z` |
| Public tables | 27 tables, all have RLS enabled |
| Applied migrations | 12 |
| Repo migrations | 37 SQL files |
| Live Edge Functions | 2: `ai-run`, `ai-embeddings` |
| Repo Edge Functions | 7: `gemini-proxy`, `create-payment`, `payment-webhook`, `cancel-subscription`, `cron-maintenance`, `send-push`, `subscribe-newsletter` |
| Storage buckets | `images` public, `interf` private |
| Installed notable extensions | `vector` in `public`, `pg_graphql` in `graphql`, `supabase_vault` in `vault` |

Applied live migrations:

| Version | Name |
| --- | --- |
| `20260216191805` | `analytics_events` |
| `20260216193332` | `gamification_schema` |
| `20260221151544` | `videos_table` |
| `20260226185013` | `create_app_settings` |
| `20260312193045` | `reviews_table` |
| `20260312193101` | `pricing_plans_table` |
| `20260312193110` | `faq_items_table` |
| `20260312193115` | `site_images_table` |
| `20260312193118` | `user_push_tokens_table` |
| `20260315114042` | `retreats_table` |
| `20260315114218` | `admin_subscriptions_rls` |
| `20260315114222` | `analytics_rpc` |

Live Edge Functions:

| Slug | Version | Status | JWT | SHA256 |
| --- | --- | --- | --- | --- |
| `ai-run` | 3 | `ACTIVE` | true | `76eb22ae4fffe576ff701433acc2d440bc164de32616c3c23ae1e46e5e757e4c` |
| `ai-embeddings` | 3 | `ACTIVE` | true | `4984b0e451b7453693d56c5c7e69b89177eddbed57ded60e8459a8be4f7823b3` |

---

## 3) P0 Security / Governance Blockers

### P0.1 - `profiles` remains open to public read/write

[FACT] Live policy:

| Table | Policy | Roles | Cmd | Qual | With check |
| --- | --- | --- | --- | --- | --- |
| `profiles` | `Allow public read/write profiles` | `{public}` | `ALL` | `true` | `true` |

[FACT] `profiles` still contains `is_admin boolean default false`.

[INTERP] Because permissive RLS policies are combined through OR, one `ALL true/true` public policy defeats the narrower own-row/admin policies. This is launch-blocking because it allows public read/write shape for profile data and can interact badly with any legacy code that still reads `profiles.is_admin`.

PASS condition:

- policy `Allow public read/write profiles` removed;
- remaining `profiles_*_own` and admin policies tested with anon/auth/admin contexts;
- `profiles.is_admin` either removed after admin backfill or proven unreachable by app logic.

### P0.2 - Migration history cannot reproduce live schema

[FACT] Live has 12 applied migrations; repo has 37 migration files.

[FACT] Live has 27 public tables, including manual/shadow objects that are not safely represented by applied migration history.

[INTERP] A production schema that cannot be reproduced from repo migrations is not governable. `contacts` and `classes` exist live, but the real blocker is not merely "missing CREATE table"; it is repo/live baseline mismatch.

PASS condition:

- branch/local baseline created from live schema;
- migrations reproduce schema from scratch in a non-production target;
- `shared/types/database.types.ts` regenerated from the reconciled schema.

### P0.3 - Edge Functions repo/live split

[FACT] Live deployed functions are only `ai-run` and `ai-embeddings`.

[FACT] Repo functions are `gemini-proxy`, `create-payment`, `payment-webhook`, `cancel-subscription`, `cron-maintenance`, `send-push`, `subscribe-newsletter`; none appear in live function inventory.

[INTERP] Payments, newsletter, push, cron, cancellation, and repo AI proxy cannot be assumed live. AI is explicitly frozen, so this audit does not choose between live AI functions and repo `gemini-proxy`.

PASS condition:

- non-AI function deployment plan approved and executed on branch/staging first;
- production secrets verified without exposing values;
- AI architecture decision handled separately before touching `ai-run`, `ai-embeddings`, or `gemini-proxy`.

### P0.4 - Security advisors still flag externally facing issues

[FACT] Security advisors flag:

- `rls_enabled_no_policy`: `public.dialogue`;
- `function_search_path_mutable`: `is_admin`, `set_updated_at`, `touch_push_token_updated_at`, `trigger_set_timestamp`, `get_admin_analytics`;
- `rls_policy_always_true`: `ai_jobs`, `analytics_events`, `api_logs`, `contacts`, `profiles`;
- `public_bucket_allows_listing`: public `images` bucket policy `Public Access`;
- GraphQL exposure for many public tables to `anon` and `authenticated`;
- public/authenticated executable SECURITY DEFINER functions: `rls_auto_enable`, `get_admin_analytics`;
- `auth_leaked_password_protection` disabled.

[INTERP] Not every advisor item is automatically a P0, but this set confirms that production security hardening has not converged.

PASS condition:

- security advisors re-run after remediation;
- unresolved advisors explicitly accepted with rationale.

---

## 4) P1 Launch Blockers

### P1.1 - RLS policy duplication and broad roles

[FACT] Policy counts:

| Table | RLS | Policy count |
| --- | --- | --- |
| `profiles` | enabled | 8 |
| `bookings` | enabled | 9 |
| `app_settings` | enabled | 4 |
| `dialogue` | enabled | 0 |

[FACT] Examples:

- `bookings` has old `Users can *` policies and newer `bookings_*_own` policies active together.
- `app_settings` has duplicate public read policies and duplicate admin write policies.
- `contacts` has public insert `WITH CHECK true`.

[INTERP] Duplicates are both security noise and performance cost. They also make review harder because actual access is the union of permissive policies.

### P1.2 - Function hardening incomplete

[FACT] Function configs:

| Function | Security | `search_path` config |
| --- | --- | --- |
| `get_admin_analytics(period_days integer)` | DEFINER | null |
| `is_admin()` | INVOKER | null |
| `set_updated_at()` | INVOKER | null |
| `touch_push_token_updated_at()` | INVOKER | null |
| `trigger_set_timestamp()` | INVOKER | null |
| `rls_auto_enable()` | DEFINER | `search_path=pg_catalog` |

[INTERP] `search_path` should be pinned before relying on these functions inside RLS/admin surfaces.

### P1.3 - Storage buckets are under-constrained

[FACT] Buckets:

| Bucket | Public | MIME allowlist | Size limit | Notes |
| --- | --- | --- | --- | --- |
| `images` | true | null | null | broad `storage.objects` SELECT policy `Public Access` |
| `interf` | false | null | null | not documented in repo |

[INTERP] `images` needs explicit MIME/size constraints and listing policy review. `interf` needs ownership/retention decision.

### P1.4 - Type contracts drift from live schema

[FACT] `shared/types/database.types.ts` says it is hand-crafted from migrations and should be replaced by generated live types after connecting.

[FACT] Current mismatches include:

| Table/type | Local type | Live schema |
| --- | --- | --- |
| `ContactStatus` | `new`, `in_progress`, `done`, `spam` | enum `contact_status`: `new`, `read`, `processed`, `spam` |
| `contacts` | includes `ip_address` | no `ip_address` column |
| `classes` | includes `duration`, `price`, `description`; no `updated_at` | no `duration`/`price`/`description`; has `updated_at`; core fields are non-null |
| `profiles` | has `avatar`, `updated_at`; no `is_admin`; `user_id` required | no `avatar`/`updated_at`; has `is_admin`; `user_id` nullable |
| `bookings` | has `name`, `class_type`, `class_date`, `class_time`, `is_purchase`, `price`; `user_id` required | no those extra fields; `user_id` nullable; has `class_uuid` |
| `user_preferences` | `answers`, `updated_at` | `onboarding`, `created_at`, `updated_at` |
| `app_events` | `event`, `metadata` | `name`, `props` |

[INTERP] Code can compile while DB contracts are wrong. This should be fixed only after schema baseline is reconciled, otherwise types will churn twice.

---

## 5) P2 Cleanup / Performance

[FACT] Performance advisors flag:

- unindexed FKs: `ai_jobs_prompt_request_id_fkey`, `api_logs_prompt_request_id_fkey`, `bookings_class_uuid_fkey`, `bookings_phone_fkey`, `prompt_requests_model_id_fkey`;
- RLS initplan issues where `auth.uid()`/auth functions should be wrapped as `(select auth.uid())`;
- multiple permissive policies across several tables including `reviews`, `site_images`, `subscriptions`, `user_push_tokens`, `videos`.

[FACT] Local builds pass but emit a Vite warning about a large JS chunk:

- `assets/index-DlAt0FZ_.js` around `357.68 kB`, over the configured `250 kB` warning limit.

[INTERP] These are not the first blade. Fix P0/P1 security and governance before performance cleanup.

---

## 6) P3 Product Backlog

These remain product/workflow items, not reasons to mutate production during this audit:

- replace or validate real video URLs in `videos` through a content-safe workflow;
- finish YooKassa live readiness after non-AI Edge Function deployment plan;
- confirm mobile signing secrets and release path;
- raise test coverage and add high-value integration tests around auth/bookings/payments;
- bundle splitting/Lighthouse optimization after launch blockers are resolved.

---

## 7) Safe Remediation Order

1. Create Supabase branch or local reproduction target. Do not hotfix production directly unless separately approved.
2. Baseline live schema into repo branch and prove migrations can reproduce the schema from scratch.
3. Fix `profiles` open policy first, then verify anon/auth/admin behavior.
4. Decide fate of `profiles.is_admin` after admin boundary backfill and app search.
5. Consolidate RLS policies for `profiles`, `bookings`, `app_settings`, and public insert surfaces.
6. Pin `search_path` for custom functions and revoke public/authenticated execute on exposed SECURITY DEFINER functions where not intended.
7. Harden storage buckets: MIME allowlist, size limits, listing policy, `interf` decision.
8. Resolve Edge Functions split: non-AI functions first; AI decision remains explicit and separate.
9. Regenerate DB types from reconciled schema and fix app contract mismatches.
10. Re-run advisors, local tests, web/app builds, and update this audit with PASS evidence.

---

## 8) PASS / FAIL Criteria

Current status: **FAIL for production launch readiness**.

PASS requires:

- no public `ALL true/true` policy on `profiles`;
- migration history or baseline can reproduce production schema in a non-production target;
- live/repo Edge Functions status is intentionally documented and deployed or deferred by decision;
- advisors re-run and P0/P1 findings are cleared or explicitly accepted;
- `database.types.ts` generated from the reconciled schema;
- local checks remain green: migrations, typecheck, lint, tests, web build, app build;
- no AI scope mutation unless separately authorized.

FAIL remains if:

- production DB is mutated without branch/approval;
- user rows are read as part of remediation;
- AI scope is changed implicitly;
- docs claim launch-ready while P0 Supabase drift remains.

---

## 9) Delta From 2026-03-15 Audit

| Area | 2026-03-15 doc | 2026-05-02 recheck |
| --- | --- | --- |
| Local tests | 473 / 60 | 489 / 64 |
| Repo migrations | 35 | 37 |
| Applied migrations | 12 | 12 |
| Live Edge Functions | 2 | 2 |
| `profiles` open policy | present | still present |
| `dialogue` no policies | present | still present |
| Storage bucket issues | present | still present |
| Type drift | known partially | confirmed against live columns |

---

**Итог:** локальная сборка стоит, но production Supabase не стоит на каноне. Следующий безопасный шаг - branch-first remediation backlog, начиная с `profiles` RLS и schema baseline.

---

## 10) Remediation Patch Prepared

> **Дата:** 2 мая 2026, после audit pass.

[FACT] В репозитории подготовлен catch-up migration:

- `supabase/migrations/20260502095933_p0_live_rls_governance_catchup.sql`

[FACT] Migration не применён к production в рамках этого аудита.

[INTERP] До применения на Supabase branch/staging live findings из этого документа остаются актуальными. Patch закрывает intended path для `profiles` RLS, app-contract columns, non-AI RLS consolidation, function `search_path`, storage hardening and selected non-AI performance indexes, но требует branch apply + advisors re-run.

---

## 11) Branch Remediation Attempt - 2026-05-05

[FACT] Supabase MCP access was re-verified for project `qkaycdcbstjobacmuaro`:

- project `kate`, organization `lwydigvmulkaunbosesd`, region `eu-central-1`;
- status `ACTIVE_HEALTHY`;
- database PostgreSQL `17.6.1.054`.

[FACT] Branch cost was fetched and confirmed through MCP:

- type: `branch`;
- recurrence: `hourly`;
- amount: `0.01344`.

[FACT] Creating branch `p0-live-rls-governance-catchup` failed before any migration was applied:

- Supabase error: `PaymentRequiredException`;
- message: `Branching is supported only on the Pro plan or above`.

[FACT] Production remained unchanged. The catch-up migration
`supabase/migrations/20260502095933_p0_live_rls_governance_catchup.sql`
was not applied to production and no production merge was attempted.

[FACT] Metadata-only production recheck after the branch blocker still shows:

- applied live migrations: 12;
- `profiles` policy `Allow public read/write profiles` remains `ALL` with `USING true` and `WITH CHECK true`;
- `profiles.is_admin` still exists;
- `dialogue` still has RLS enabled and no policies;
- mutable `search_path` advisors remain for `is_admin`, `set_updated_at`, `touch_push_token_updated_at`, `trigger_set_timestamp`, and `get_admin_analytics`;
- `get_admin_analytics(period_days integer)` remains `SECURITY DEFINER` with `proconfig = null`;
- `rls_auto_enable()` remains `SECURITY DEFINER`;
- bucket `images` remains public with no `file_size_limit` and no `allowed_mime_types`;
- broad storage policy `Public Access` remains on `storage.objects`.

[INTERP] The remediation patch is ready, but the required branch-first execution path is blocked by Supabase plan eligibility. Applying the migration directly to production would violate the current remediation plan.

Next safe paths:

1. Upgrade/enable Supabase branching for organization `lwydigvmulkaunbosesd`, then retry the same branch flow.
2. Provide a separate staging Supabase project explicitly approved for mutation, then apply and verify there.
3. Give explicit production-hotfix approval only after accepting the risk of bypassing branch evidence.
