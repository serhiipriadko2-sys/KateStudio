# KateStudio — Open Loops

> Unresolved risks, pending verification, rollback watchpoints, and drift that survives a single session.
> Last updated: 2026-06-16.

---

## HIGH-RISK DRIFT

### 1. `supabase/config.toml` targets rehearsal project, not live

- **Context:** `supabase/config.toml` declares `project_id = "katestudio-supabase-rehearsal"` while all tooling and MCP point to live ref `qkaycdcbstjobacmuaro`.
- **Risk:** Accidental `supabase db push` / `supabase functions deploy` against the wrong project.
- **Evidence:** `supabase/config.toml` line 1; `.mcp.json`, `.vscode/mcp.json`, AGENTS.md live ref.
- **Next:** Align `config.toml` `project_id` with live ref, or isolate rehearsal config behind explicit guard comments and never use it for live ops.
- **Status:** open

### 2. GitHub Actions workflows lack least-privilege `permissions`

- **Context:** `ci.yml`, `capacitor-build.yml`, `cron.yml`, `firebase-deploy.yml` do not declare top-level `permissions:`.
- **Risk:** `GITHUB_TOKEN` gets broad default scopes; increased blast radius if token is compromised.
- **Evidence:** `.github/workflows/*.yml`.
- **Next:** Add explicit `permissions:` blocks to each workflow (e.g., `contents: read` at top level, job-level overrides where needed).
- **Status:** open

### 3. `scripts/create-admin.ts` logs plaintext password

- **Context:** The script prints the generated admin password via `console.log('Password: ${password}')`.
- **Risk:** Secret leak in CI logs, terminal history, or process output.
- **Evidence:** `scripts/create-admin.ts`.
- **Next:** Remove the log line or emit a one-time URL/token instead.
- **Status:** open

---

## MEDIUM-RISK / FOLLOW-UP

### 4. Stale operational docs still describe old book-class posture

- **Context:** `CURRENT_TASKS.md`, `LAUNCH_CHECKLIST.md`, `docs/INDEX.md`, `docs/SECURITY_MODEL.md` still reference `book_class_with_access` as an authenticated `SECURITY DEFINER` RPC or accepted live warning.
- **Risk:** Future decisions made on stale canon.
- **Evidence:** `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md` superseded; `docs/RELEASE_EVIDENCE_2026_05_30.md` records service-role-only RPC + Edge Function v7.
- **Next:** Sync the four operational docs with the current design (this pass).
- **Status:** in_progress

### 5. RLS policy clutter and performance advisor warnings

- **Context:** Supabase advisors report multiple permissive policies and `auth_rls_initplan` warnings on `payment_orders`, `user_passes`, `graph_nodes`, `graph_edges`, `app_settings`, `articles`, `bookings`, `classes`, `faq_items`, `pricing_plans`, `profiles`, `retreats`.
- **Risk:** Query degradation at scale; harder incident response.
- **Evidence:** Supabase `get_advisors` output.
- **Next:** Schedule a dedicated RLS consolidation pass; not a release blocker.
- **Status:** open

### 6. Canonical AI contour unresolved

- **Context:** Live has both legacy `ai-run`/`ai-embeddings` and `gemini-proxy`.
- **Risk:** Confusion about which AI surface is canonical; duplicated cost/ops.
- **Evidence:** `list_edge_functions` shows all three active.
- **Next:** Decide and document canonical AI contour; retire or explicitly keep legacy pair.
- **Status:** open

### 7. No e2e testing path

- **Context:** Only unit/component tests and manual smoke checks exist.
- **Risk:** Release gate remains partially manual.
- **Evidence:** `docs/TESTING.md`, absence of Playwright/Cypress config.
- **Next:** Add lightweight e2e smoke for critical booking/payment flows when bandwidth allows.
- **Status:** open

---

## LOW-RISK / HYGIENE

### 8. Skill overlap across agent runtimes

- **Context:** `.agents/skills/`, `.claude/skills/`, `.codex/skills/`, and project `skills/*.yaml` cover overlapping domains.
- **Risk:** Divergent or conflicting guidance for Supabase, security, code review, git workflow.
- **Next:** Map skills and remove duplicates; assign canonical home per domain.
- **Status:** open

### 9. Stale release branch

- **Context:** Local branch `release/book-class-access-production-rollout-20260530` remains after merge.
- **Risk:** Minor clutter; no functional impact.
- **Next:** Delete the branch.
- **Status:** open
