# Development Diary

## 2026-07-15 — Deep Audit & Memory Drift Cleanup

- **Context:** User requested deep analysis and audit. Ran background validation (`typecheck`, `lint`, `check:migrations`). All passed cleanly.
- **Finding:** Codebase in `main` is clean. The three HIGH-RISK security fixes previously planned were already merged, but the memory stack (`open-loops.md`, `CURRENT_TASKS.md`) was out of sync (Memory Drift).
- **Evidence:** `npm run` logs (zero errors); visual check of `supabase/config.toml` on `main`. 
- **Risk:** Stale memory can cause redundant work or false alarms.
- **Next:** Proceed with feature work or remaining Medium-Risk items (e.g. AI-contour decision).
- **Status:** verified & resolved

---

## 2026-06-16 — Security fixes for three HIGH-RISK drift items

- **Context:** Follow-up to governance/memory sync. Three HIGH-RISK security items were identified in `open-loops.md`.
- **Changes:**
  - `supabase/config.toml`: added explicit comments clarifying that `project_id` is the local dev identifier and not the live ref `qkaycdcbstjobacmuaro`.
  - `.github/workflows/ci.yml`, `capacitor-build.yml`, `cron.yml`, `firebase-deploy.yml`: added least-privilege `permissions:` blocks.
  - `scripts/create-admin.ts`: removed plaintext password logging; updated usage example to use `<password>` placeholder.
- **Evidence:**
  - Prettier check passed for modified YAML/TS files.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run check:migrations` passed.
- **Risk:** Workflow permissions may need refinement if a specific action requires additional scopes; CI run on the PR will confirm.
- **Next:** Open PR with these changes, get CI green, merge, then close the items in `open-loops.md`.
- **Status:** in_progress

---

## 2026-06-16 — Governance and memory stack sync after full sweep

- **Context:** Ran full scientific sweep across agent, GitHub, Supabase, docs, memory, and runtime surface. Found operational canon drifting from committed code and live state.
- **Finding:**
  - `book_class_with_access` is now service-role-only internal RPC + `book-class-with-access` Edge Function v7, but stale ADR and operational docs still describe the old authenticated `SECURITY DEFINER` posture.
  - Memory stack mandated by `AGENTS.md` was mostly missing (`project-memory.md`, `open-loops.md`, `adr-log.md` did not exist).
  - Three HIGH-RISK security items identified: `supabase/config.toml` project_id mismatch, missing workflow `permissions`, and plaintext password logging in `scripts/create-admin.ts`.
- **Evidence:**
  - Live `list_edge_functions` + function source for `book-class-with-access`.
  - Live `list_migrations` tail `20260530155036_security_reconcile_grants_search_path_book_class_ledger`.
  - `docs/RELEASE_EVIDENCE_2026_05_30.md` (9-check CI PASS).
  - `.github/workflows/*.yml`, `supabase/config.toml`, `scripts/create-admin.ts`.
- **Risk:** If memory/docs are not maintained, drift will recur. Security items need a follow-up PR.
- **Next:**
  1. Submit PR fixing the three HIGH-RISK security items.
  2. Keep memory files updated after each significant pass.
- **Status:** done

---

## 2026-05-31 — Installed Codex dynamic workflows skill

- Context: Installed the requested AI agent skill from `https://github.com/DannyMac180/skills/tree/main/codex-dynamic-workflows` using the Codex `skill-installer` helper.
- Finding: Skill installed to `/opt/codex/skills/codex-dynamic-workflows` and contains `SKILL.md`, workflow references, and helper scripts.
- Evidence: Installer output reported `Installed codex-dynamic-workflows to /opt/codex/skills/codex-dynamic-workflows`; local verification listed the installed files and read the skill metadata.
- Risk: Codex must be restarted before the newly installed skill is picked up by future sessions.
- Next: Restart Codex, then invoke the skill when a task needs dynamic workflow orchestration.
- Status: verified

## 2026-06-24 — WEB trainers section temporarily hidden

- Context: User requested the WEB trainers/teachers section be made temporarily invisible.
- Finding: [FACT] `k-sebe-yoga-studioWEB/App.tsx` now uses `IS_TRAINERS_SECTION_VISIBLE = false` to hide the homepage trainers preview, remove the trainers item from the mobile menu, and redirect `/trainers` and `/trainers/:slug` to `/` while hidden.
- Evidence: `npm run typecheck` passed; `npm run build:web` passed with existing Vite chunk-size warning.
- Risk: [INTERP] Admin trainer management and shared trainer data remain unchanged; public routes are only code-gated in WEB, not deleted.
- Next: Flip `IS_TRAINERS_SECTION_VISIBLE` back to `true` when the public trainers section should return.
- Status: verified
