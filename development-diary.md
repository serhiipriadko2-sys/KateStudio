# Development Diary

## 2026-06-17 — Codex Desktop remote-control host prepared for mobile pairing

- **Context:** User reported "Произошла ошибка" in ChatGPT mobile Codex on the "Ожидание компьютера" screen while trying to pair a phone with the Windows desktop.
- **Finding:**
  - Codex CLI 0.140.0 is installed globally via npm, but `codex remote-control` daemon lifecycle is **not supported on Windows** (`codex app-server daemon lifecycle is only supported on Unix platforms`).
  - OpenAI Codex Desktop App **is** installed as an MSIX package (`OpenAI.Codex_26.602.9276.0_x64__2p2nqsd0c76g0`) under `C:\Program Files\WindowsApps`, but it was **not running**.
  - A stale `remote_control_enrollments` row existed in `~/.codex/state_5.sqlite` with `client_type = CODEX_DESKTOP_APP`, `server_name = DESKTOP-ITUAMNF`.
- **Actions:**
  - Started Codex Desktop App via `explorer.exe shell:AppsFolder\OpenAI.Codex_2p2nqsd0c76g0!App`.
  - Verified with the ChatGPT backend API that the host is now reported as **online**:
    - `environments count: 1`
    - `display_name: DESKTOP-ITUAMNF, online: True, os: Windows, arch: x86_64, client_type: CODEX_DESKTOP_APP, originator: Codex Desktop`.
- **Evidence:**
  - Live backend query to `https://chatgpt.com/backend-api/codex/remote/control/environments?limit=100` returned the online Windows host.
  - Process list shows multiple `C:\Program Files\WindowsApps\OpenAI.Codex_26.602.9276.0_x64__2p2nqsd0c76g0\app\Codex.exe` processes running.
- **Risk:**
  - The Desktop App must stay running and the computer must remain awake for mobile remote control to persist.
  - Both phone and desktop must use the **same ChatGPT account and workspace** (`Liber ignis` team workspace is default on desktop); mismatch causes the generic mobile error.
  - ChatGPT mobile app must be on a version that supports Codex mobile/remote control (Windows support shipped ~2026-05-29).
- **Next:**
  1. In Codex Desktop App open **Settings → Connections → Set up Codex mobile** (or sidebar "Set up Codex mobile") and scan the QR code from the phone.
  2. In ChatGPT mobile ensure the selected workspace matches the desktop (`Liber ignis`).
  3. If the error persists, regenerate a fresh QR code and update ChatGPT mobile to the latest version.
- **Status:** verified (desktop host online; pending mobile-side confirmation)

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
