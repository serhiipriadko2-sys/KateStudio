# KateStudio — Open Loops

> Unresolved risks, pending verification, rollback watchpoints, and drift that survives a single session.
> Last updated: 2026-06-16.

---

## HIGH-RISK DRIFT

### 1. `supabase/config.toml` targets rehearsal project, not live

- **Context:** `supabase/config.toml` declared `project_id = "katestudio-supabase-rehearsal"` while all tooling and MCP point to live ref `qkaycdcbstjobacmuaro`.
- **Risk:** Accidental `supabase db push` / `supabase functions deploy` against the wrong project.
- **Evidence:** `supabase/config.toml`; `.mcp.json`, `.vscode/mcp.json`, AGENTS.md live ref.
- **Fix:** Added explicit comments clarifying local-vs-live project id and warning against accidental live ops.
- **Next:** Resolved (verified in main on 2026-07-15).
- **Status:** resolved

### 2. GitHub Actions workflows lack least-privilege `permissions`

- **Context:** `ci.yml`, `capacitor-build.yml`, `cron.yml`, `firebase-deploy.yml` did not declare top-level `permissions:`.
- **Risk:** `GITHUB_TOKEN` gets broad default scopes; increased blast radius if token is compromised.
- **Evidence:** `.github/workflows/*.yml`.
- **Fix:** Added `permissions:` blocks:
  - `ci.yml`: `contents: read`, `actions: write`
  - `capacitor-build.yml`: `contents: read`, `actions: write` (write implies read for artifact download/upload)
  - `cron.yml`: `contents: read`
  - `firebase-deploy.yml`: `contents: read`, `checks: write`
- **Next:** Resolved (verified in main on 2026-07-15).
- **Status:** resolved

### 3. `scripts/create-admin.ts` logs plaintext password

- **Context:** The script printed the admin password via `console.log('Password: ${password}')` and usage example showed a sample password.
- **Risk:** Secret leak in CI logs, terminal history, or process output.
- **Evidence:** `scripts/create-admin.ts`.
- **Fix:** Removed password log line; replaced sample password in usage help with `<password>` placeholder.
- **Next:** Resolved (verified in main on 2026-07-15).
- **Status:** resolved

---

## MEDIUM-RISK / FOLLOW-UP

### 4. Stale operational docs still describe old book-class posture

- **Context:** `CURRENT_TASKS.md`, `LAUNCH_CHECKLIST.md`, `docs/INDEX.md`, `docs/SECURITY_MODEL.md` still reference `book_class_with_access` as an authenticated `SECURITY DEFINER` RPC or accepted live warning.
- **Risk:** Future decisions made on stale canon.
- **Evidence:** `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md` superseded; `docs/RELEASE_EVIDENCE_2026_05_30.md` records service-role-only RPC + Edge Function v7.
- **Next:** Resolved (docs updated on 2026-07-15).
- **Status:** resolved

### 5. RLS policy clutter and performance advisor warnings

- **Context:** Supabase advisors report multiple permissive policies and `auth_rls_initplan` warnings on `payment_orders`, `user_passes`, `graph_nodes`, `graph_edges`, `app_settings`, `articles`, `bookings`, `classes`, `faq_items`, `pricing_plans`, `profiles`, `retreats`.
- **Risk:** Query degradation at scale; harder incident response.
- **Evidence:** Supabase `get_advisors` output.
- **Next:** Resolved (миграция 20260715185000_optimize_rls_performance.sql применена 2026-07-15).
- **Status:** resolved

### 6. Canonical AI contour unresolved

- **Context:** Live has both legacy `ai-run`/`ai-embeddings` and `gemini-proxy`.
- **Risk:** Confusion about which AI surface is canonical; duplicated cost/ops.
- **Evidence:** `list_edge_functions` shows all three active.
- **Next:** AI-контур временно заморожен по решению 2026-07-15. Оставляем обе ветки без изменений до разморозки.
- **Status:** frozen

### 7. No e2e testing path

- **Context:** Only unit/component tests and manual smoke checks exist.
- **Risk:** Release gate remains partially manual.
- **Evidence:** `docs/TESTING.md`, absence of Playwright/Cypress config.
- **Next:** Resolved (Basic e2e smoke tests configured with Playwright and added to CI/CD on 2026-07-15).
- **Status:** resolved

---

## LOW-RISK / HYGIENE

### 8. Skill overlap across agent runtimes

- **Context:** `.agents/skills/`, `.claude/skills/`, `.codex/skills/`, and project `skills/*.yaml` cover overlapping domains.
- **Risk:** Divergent or conflicting guidance for Supabase, security, code review, git workflow.
- **Next:** Resolved (дубликаты из `.claude/skills` удалены).
- **Status:** resolved

### 9. Stale release branch

- **Context:** Local branch `release/book-class-access-production-rollout-20260530` remains after merge.
- **Risk:** Minor clutter; no functional impact.
- **Next:** Resolved (ветка удалена локально и удаленно 2026-07-15).
- **Status:** resolved
