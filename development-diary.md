# Development Diary

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
- **Status:** in_progress

---

## 2026-05-31 — Installed Codex dynamic workflows skill

- Context: Installed the requested AI agent skill from `https://github.com/DannyMac180/skills/tree/main/codex-dynamic-workflows` using the Codex `skill-installer` helper.
- Finding: Skill installed to `/opt/codex/skills/codex-dynamic-workflows` and contains `SKILL.md`, workflow references, and helper scripts.
- Evidence: Installer output reported `Installed codex-dynamic-workflows to /opt/codex/skills/codex-dynamic-workflows`; local verification listed the installed files and read the skill metadata.
- Risk: Codex must be restarted before the newly installed skill is picked up by future sessions.
- Next: Restart Codex, then invoke the skill when a task needs dynamic workflow orchestration.
- Status: verified
