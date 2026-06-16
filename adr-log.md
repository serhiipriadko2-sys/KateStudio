# KateStudio — ADR Log

> Governance decisions that change behavior, workflow, memory policy, or operational canon.
> Last updated: 2026-06-16.

---

## ADR-2026-06-16-001 | Memory stack implementation

- **Context:** Full scientific sweep (2026-06-16) found that `AGENTS.md` mandates a memory stack (`project-memory.md`, `development-diary.md`, `open-loops.md`, `adr-log.md`, `evidence-index.md`) but only stubs existed. Operational docs (`CURRENT_TASKS.md`, `LAUNCH_CHECKLIST.md`, `INDEX.md`, `SECURITY_MODEL.md`) were drifting from committed code and live state.
- **Decision:** Implement the memory stack as the canonical operational continuity layer. After every significant pass, write at least one receipt in `development-diary.md` and update `open-loops.md` if risk persists. Operational docs must be re-synced when live/code state changes.
- **Alternatives:**
  1. Keep docs-only governance (rejected — docs drifted).
  2. Use automated skill registry (rejected — `skills/registry.json` shows 0 runs, skills are unenforced).
  3. Implement memory stack manually (accepted — lightweight, auditable, agent-readable).
- **Consequences:**
  - New files: `project-memory.md`, `open-loops.md`, `adr-log.md`; updated `development-diary.md`, `evidence-index.md`.
  - Operational docs must be updated in the same PR/memory pass that changes the underlying fact.
  - Adds small overhead per session in exchange for reduced drift.
- **Verification:**
  - Memory files exist and contain `[FACT]`/`[INTERP]`/`[HYP]` tags.
  - `CURRENT_TASKS.md` no longer lists closed blockers as open.
  - `git status` clean after sync.
- **Rollback trigger:** Memory files become stale again and are not updated for two consecutive significant passes.
- **∆DΩΛ:**
  - ∆ Memory stack implemented.
  - D AGENTS.md memory rules + audit findings.
  - Ω 0.9.
  - Λ Re-evaluate if memory files are not maintained.

---

## ADR-2026-06-16-002 | book_class_with_access design superseded

- **Context:** ADR-2026-05-27 accepted `book_class_with_access` as an authenticated `SECURITY DEFINER` RPC with an expiry window of 2026-06-10. Subsequent migration `20260530155036_security_reconcile_grants_search_path_book_class_ledger` and PRs #517–#518 changed the design: the RPC is now service-role-only (`book_class_with_access_internal`), and the public APP contract is exposed through the `book-class-with-access` Edge Function (version 7, `verify_jwt=true`).
- **Decision:** Retire ADR-2026-05-27 and record the new design as canonical. The accepted-risk wrapper is replaced by an Edge Function + internal service-role RPC boundary.
- **Alternatives:**
  1. Renew the accepted-risk ADR (rejected — code already moved to a safer architecture).
  2. Revert to authenticated RPC (rejected — would re-introduce the security advisor warning).
  3. Keep Edge Function + internal RPC (accepted — matches deployed code).
- **Consequences:**
  - `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md` is marked SUPERSEDED.
  - `CURRENT_TASKS.md`, `LAUNCH_CHECKLIST.md`, `docs/INDEX.md`, `docs/SECURITY_MODEL.md` must reflect the new design.
- **Verification:**
  - Live `book-class-with-access` function `verify_jwt=true`, version 7.
  - Live migration ledger includes `20260530155036`.
  - APP booking path calls the Edge Function, not the RPC directly.
- **Rollback trigger:** Edge Function booking fails regression or re-introduces security warning.
- **∆DΩΛ:**
  - ∆ Book-class boundary moved from accepted-risk RPC to Edge Function + internal RPC.
  - D `docs/RELEASE_EVIDENCE_2026_05_30.md` + live function source + migration ledger.
  - Ω 0.95.
  - Λ Revisit if booking regression or new security warning appears.
