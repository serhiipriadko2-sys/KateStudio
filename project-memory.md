# KateStudio — Project Memory

> `[FACT]` Operating facts and verified governance decisions for KateStudio.
> Source of truth order: GitHub repo → Supabase live metadata → this file.
> Last updated: 2026-06-16.

---

## 1. Project identity

- `[FACT]` GitHub repo: `https://github.com/serhiipriadko2-sys/KateStudio.git`
- `[FACT]` Live Supabase project ref: `qkaycdcbstjobacmuaro`
- `[FACT]` Live Supabase URL: `https://qkaycdcbstjobacmuaro.supabase.co`
- `[FACT]` WEB deploy target: `https://ksebe-studio.ru` (GitHub Pages)
- `[FACT]` APP deploy target: `https://artful-striker-476211-h4.web.app` (Firebase Hosting)

---

## 2. Verified live state

- `[FACT]` Live applied migrations: 41 (ledger tail `20260530155036_security_reconcile_grants_search_path_book_class_ledger`).
- `[FACT]` Live Edge Functions: 12 active (`ai-run`, `ai-embeddings`, `book-class-with-access`, `cancel-subscription`, `create-payment`, `create-yookassa-checkout`, `cron-maintenance`, `gemini-proxy`, `payment-webhook`, `send-push`, `subscribe-newsletter`, `yookassa-webhook`).
- `[FACT]` All `public.*` tables have `rls_enabled = true`.
- `[FACT]` Supabase security advisors: no WARN lints after 2026-05-30 reconciliation; remaining notices are INFO-level (unused indexes, connection limits). RLS warnings (`auth_rls_initplan`, `multiple_permissive_policies`) resolved on 2026-07-15.

---

## 3. Business contours

### 3.1 Booking

- `[FACT]` Current canonical booking path: APP → `book-class-with-access` Edge Function (`verify_jwt=true`, version 7) → internal RPC `book_class_with_access_internal`.
- `[FACT]` `book_class_with_access` is **service-role-only** at the RPC level after migration `20260530155036`.
- `[FACT]` Previous accepted-risk ADR (`docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md`) is **SUPERSEDED** by this design.

### 3.2 Payment

- `[FACT]` Current canonical payment path: APP → `create-yookassa-checkout` Edge Function → YooKassa → `yookassa-webhook` Edge Function (`verify_jwt=false`).
- `[FACT]` Legacy payment trio (`create-payment`, `payment-webhook`, `cancel-subscription`) is **retired in place** and returns `410 legacy contour retired`.
- `[FACT]` Live tables `payment_orders` and `user_passes` are the canonical APP payment schema surface.

### 3.3 AI

- `[FACT]` Two AI contours coexist in live: legacy `ai-run` / `ai-embeddings` and `gemini-proxy`.
- `[INTERP]` `gemini-proxy` is the documented canonical APP AI surface; `ai-run` / `ai-embeddings` remain live but their canonical status is unresolved.

---

## 4. Release gate status

- `[FACT]` Release gate **PASS** recorded in `docs/RELEASE_EVIDENCE_2026_05_30.md`.
- `[FACT]` Same-ref CI receipt: GitHub Actions run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb` — 9 checks green.
- `[FACT]` Same-ref deploy receipts: Pages `26588248681`, Firebase `26588248787`.
- `[INTERP]` The "fresh same-ref release gate" open item in `CURRENT_TASKS.md` / `LAUNCH_CHECKLIST.md` is closed by this evidence.

---

## 5. HIGH-RISK DRIFT (fixes in progress)

- `[FACT]` `supabase/config.toml` declares `project_id = "katestudio-supabase-rehearsal"`, which does **not** match the live project ref `qkaycdcbstjobacmuaro`. Risk: accidental local CLI operations against the wrong project. **Fix applied:** added explicit comments distinguishing local project id from live ref and warning against accidental live ops.
- `[FACT]` `.github/workflows/ci.yml`, `capacitor-build.yml`, `cron.yml`, and `firebase-deploy.yml` previously did not declare least-privilege `permissions:` blocks. **Fix applied:** added `permissions:` blocks with minimal required scopes.
- `[FACT]` `scripts/create-admin.ts` logged the generated admin password to stdout (`console.log('Password: ${password}')`). **Fix applied:** removed the password log line and replaced the sample password in usage help with `<password>` placeholder.
- `[INTERP]` These fixes are staged; they will be closed after PR merge and CI green.

---

## 6. Agent / governance discipline

- `[FACT]` Memory stack files (`project-memory.md`, `development-diary.md`, `open-loops.md`, `adr-log.md`, `evidence-index.md`) are the canonical operational continuity layer.
- `[FACT]` `AGENTS.md` is duplicated by `CLAUDE.md`; `ISKRA_CODER.md` is a parallel canon.
- `[INTERP]` Skill overlap exists across `.agents/skills/`, `.claude/skills/`, `.codex/skills/`, and project `skills/*.yaml`.
- `[INTERP]` Established habit: after every significant pass, write one receipt in `development-diary.md` and update `open-loops.md` if risk persists.

---

## 7. Residual non-blocking follow-up

- `[INTERP]` Decide canonical AI contour (`ai-run`/`ai-embeddings` vs `gemini-proxy`).
- `[INTERP]` Add e2e smoke tests to reduce manual release-gate work.
- `[INTERP]` Review and merge open Dependabot branches (Capacitor, dompurify, firebase, etc.).
