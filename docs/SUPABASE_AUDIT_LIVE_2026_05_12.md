# Supabase Live Audit | KateStudio | qkaycdcbstjobacmuaro

> **Дата:** 12 мая 2026
> **Метод:** GitHub repo inspection + Supabase MCP metadata, schema inventory, migrations, function inventory, security/performance advisors
> **Граница:** без чтения пользовательских строк, без production mutation
> **Вердикт:** **FAIL for launch-ready**
> **Назначение:** canonical live snapshot после doc/live reconciliation pass от 2026-05-12

---

## 0. Executive verdict

[FACT] Live Supabase advanced materially beyond the 2026-05-10 snapshot:

- live applied migrations: **37** instead of **14**
- live functions: **9** and the inventory still does not match repo one-to-one
- `profiles` hardening is no longer a pending repo-side intention; it is already reflected in live migration history
- security advisors collapsed to **1 remaining warning**: leaked password protection disabled

[INTERP] The main documentation risk is no longer "we do not know the live state". The risk is that several repo docs still speak from older live baselines (`14` or `30`) and therefore understate how far the live schema/security baseline has already moved.

---

## 1. Live snapshot

| Domain | Current fact |
| --- | --- |
| Project | `kate` |
| Project ref | `qkaycdcbstjobacmuaro` |
| Region | `eu-central-1` |
| Status | `ACTIVE_HEALTHY` |
| Postgres | `17.6.1.054` |
| Public/live tables checked | **29** |
| Live applied migrations | **37** |
| Live functions | **9** |
| Live security advisors | **1 warning** |
| Live performance advisors | **warnings remain** |

### Live applied migration tail

The current live history includes, among others, these late-stage production migrations:

- `20260509191356 trainers_phase1`
- `20260510111807 publish_new_trainers_schedule`
- `20260510115625 recurring_schedule_rules_and_trainer_gallery`
- `20260510194927 profiles_public_policy_hotfix`
- `20260510195042 profiles_drop_legacy_is_admin`
- `20260510195652 profiles_contract_alignment_user_id_primary`
- `20260510202749 live_catchup_recurring_schedule_contract`
- `20260511121758 production_security_governance_followup`
- `20260511121934 public_insert_policy_constraints_followup`
- `20260511124838 grant_surface_reset_and_graphql_reduction`
- `20260511130028 launch_hardening_and_policy_dedup_followup`
- `20260511130129 rls_initplan_followup_for_hot_tables`
- `20260511130207 final_rls_policy_cleanup_before_launch`
- `20260511173647 reviews_public_read_grants`
- `20260511183542 public_surface_hardening_for_settings_pricing_and_videos`
- `20260511183639 public_surface_hardening_followup_without_security_definer_views`
- `20260511190000 public_surface_hardening`
- `20260512062001 missing_security_deltas`

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

### Live schema signals relevant to current docs

- `trainers` exists with **2** rows
- `class_recurring_rules` exists with **3** rows
- `site_images` exists with **0** rows
- `app_settings` exists with **3** rows
- `payment_orders` is **absent** from the checked live public schema
- `user_passes` is **absent** from the checked live public schema

---

## 2. Repo snapshot relevant to Supabase

| Domain | Current fact |
| --- | --- |
| Repo migrations | **42** files (repo-documented count) |
| Repo functions | **9** |
| Repo-only payment pair | `create-yookassa-checkout`, `yookassa-webhook` |
| Live-only AI pair | `ai-run`, `ai-embeddings` |

[INTERP] Repo/live function drift remains semantic, not merely numeric.

---

## 3. Confirmed doc/live drift closed by this snapshot

### 3.1 Older live baselines are now stale as current-state claims

[FACT] Several repo docs were still presenting current-state live counts from older checkpoints:

- `14` applied migrations
- `30` applied migrations

[FACT] Live on 2026-05-12 reports **37** applied migrations.

[CONCLUSION] Any repo document that still presents `14` or `30` as the current live migration baseline is outdated and must be treated as historical only.

### 3.2 `profiles` hardening status changed from pending to applied

[FACT] Live migration history now includes:

- `profiles_public_policy_hotfix`
- `profiles_drop_legacy_is_admin`
- `profiles_contract_alignment_user_id_primary`

[CONCLUSION] Documentation that still says `profiles` hardening is merely prepared in repo or not confirmed in live is outdated.

---

## 4. What remains genuinely open

### 4.1 Security tail risk

[FACT] The only current live security advisor warning is leaked password protection disabled.

[INTERP] This is now the clearest live security gap because broader `profiles`/GraphQL/`vector` issues are no longer the active headline.

### 4.2 Payment contour drift still exists

[FACT] Live still exposes `create-payment` / `payment-webhook`.

[FACT] Repo still carries `create-yookassa-checkout` / `yookassa-webhook` as the app-target pair.

[FACT] The checked live public schema still does not expose `payment_orders` / `user_passes`.

[CONCLUSION] Payment docs should continue to describe APP-only YooKassa as target canon, not as completed live truth.

### 4.3 Performance/governance cleanup still exists

[FACT] Performance advisors still warn on unused indexes and multiple permissive policy fan-out across several tables.

[INTERP] These are real cleanup items, but they are no longer evidence that the older security snapshot is still current.

---

## 5. Safe documentation rule after this audit

1. Use this file as the canonical live snapshot for 2026-05-12.
2. Treat `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md` as historical, not current-state truth.
3. Update `CURRENT_TASKS.md`, `docs/INDEX.md`, `docs/ARCHITECTURE.md`, and `docs/LAUNCH_CHECKLIST.md` so they no longer present `14` or `30` as the current live baseline.
4. Keep payment cutover language explicit: target canon in repo is not equal to deployed live truth.

---

## 6. Bottom line

[FACT] Live state is now substantially tighter and farther along than several repo docs still imply.

[INTERP] The highest-value doc-sync work is not writing more analysis. It is eliminating mixed live baselines so every operational doc starts from the same verified present tense.