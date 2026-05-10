# Supabase Live Audit | KateStudio | qkaycdcbstjobacmuaro

> **Дата:** 10 мая 2026
> **Метод:** GitHub repo inspection + Supabase MCP metadata, schema inventory, migrations, function inventory, security/performance advisors
> **Граница:** без чтения пользовательских строк, без production mutation
> **Вердикт:** **FAIL for launch-ready**

---

## 0. Executive verdict

[FACT] Live Supabase moved forward since the 2026-05-02 audit:

- live applied migrations: **14** instead of **12**
- live functions: **9** instead of **2**
- live now includes trainer rollout artifacts

[FACT] Repo also moved forward:

- repo migrations: **42** instead of **37**
- repo functions: **9** instead of **7**

[INTERP] This did not close governance. It changed the shape of the problem. The system is no longer "backend mostly missing in production". It is now "backend partially converged but operational truth split across repo and live".

---

## 1. Live snapshot

| Domain | Current fact |
| --- | --- |
| Project | `kate` |
| Project ref | `qkaycdcbstjobacmuaro` |
| Region | `eu-central-1` |
| Status | `ACTIVE_HEALTHY` |
| Postgres | `17.6.1.054` |
| Public/live tables | 27 |
| Live applied migrations | 14 |
| Live functions | 9 |

### Live applied migrations

1. `20260216191805 analytics_events`
2. `20260216193332 gamification_schema`
3. `20260221151544 videos_table`
4. `20260226185013 create_app_settings`
5. `20260312193045 reviews_table`
6. `20260312193101 pricing_plans_table`
7. `20260312193110 faq_items_table`
8. `20260312193115 site_images_table`
9. `20260312193118 user_push_tokens_table`
10. `20260315114042 retreats_table`
11. `20260315114218 admin_subscriptions_rls`
12. `20260315114222 analytics_rpc`
13. `20260509191356 trainers_phase1`
14. `20260510111807 publish_new_trainers_schedule`

### Live function inventory

- `ai-run`
- `ai-embeddings`
- `create-payment`
- `payment-webhook`
- `cancel-subscription`
- `cron-maintenance`
- `send-push`
- `subscribe-newsletter`
- `gemini-proxy`

---

## 2. Repo snapshot relevant to Supabase

| Domain | Current fact |
| --- | --- |
| Repo migrations | 42 |
| Repo functions | 9 |
| Notable new migration groups | YooKassa payments, trainers domain, trainer schedule publishing |

### Repo-only functions

- `create-yookassa-checkout`
- `yookassa-webhook`

### Live-only functions

- `ai-run`
- `ai-embeddings`

---

## 3. P0 findings

### P0.1 `profiles` remains publicly writable/readable

[FACT] Security advisors still flag `public.profiles` policy `Allow public read/write profiles` for `ALL` with effectively unrestricted access.

[FACT] Live `profiles` still contains legacy `is_admin`.

[INTERP] This remains the clearest launch blocker because it touches identity surface, profile integrity, and admin-boundary drift at once.

### P0.2 migration history is still not reproducible from one canon

[FACT] Live applied migrations = 14, repo migrations = 42.

[INTERP] The gap is smaller than before only in the sense that live progressed. It is still not governed by a clean shared baseline.

### P0.3 function inventory is numerically aligned but semantically split

[FACT] Both repo and live now show 9 functions.

[FACT] The inventories are not the same.

[INTERP] This is more dangerous than a simple missing deploy because surface area looks healthy from a distance.

---

## 4. P1 findings

### Security advisors still open

[FACT] Current security advisors flag:

- `dialogue` RLS enabled with no policy
- mutable `search_path` on multiple functions
- permissive RLS policies for `ai_jobs`, `analytics_events`, `api_logs`, `contacts`, `profiles`
- public bucket listing for `images`
- broad GraphQL exposure
- executable SECURITY DEFINER functions
- leaked password protection disabled

### Performance advisors still open

[FACT] Performance advisors still flag:

- unindexed foreign keys
- RLS auth initplan inefficiencies
- multiple permissive policies across several tables

---

## 5. Domain changes since previous audit

### Trainers domain is now part of live truth

[FACT] Live schema now includes `trainers` with 2 rows and `classes.trainer_id`.

[INTERP] Documentation that still presents classes/instructors as text-only legacy structure is behind the system.

### Payment contour became more layered

[FACT] Repo now contains both `create-payment` / `payment-webhook` and YooKassa-named variants.

[INTERP] Payment docs must explicitly distinguish active canonical paths from historical or transitional ones.

---

## 6. Safe next action

1. reconcile repo/live migration baseline in a non-production target,
2. resolve `profiles` policy and admin contract,
3. declare canonical function inventory,
4. regenerate DB types only after that.

---

## 7. Bottom line

[FACT] The project advanced materially after 2026-05-02.

[INTERP] But progress landed on top of unresolved governance debt. The main task now is not adding more capability. It is restoring one shared truth across code, database, functions, and docs.
