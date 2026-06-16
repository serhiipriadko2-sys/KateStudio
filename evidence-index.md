# Evidence Index

> Pointers to PRs, migrations, docs, checks, previews, and other receipts that confirm the current state.
> Last updated: 2026-06-16.

---

## 2026-06-16 — Governance/memory sync and full sweep

- **Sweep scope:** Agent, GitHub, Supabase live, docs, memory, runtime surface.
- **Key receipts:**
  - GitHub `main` HEAD at audit time: `5acf962` (`chore: stop tracking codex runtime files`).
  - Supabase live project ref: `qkaycdcbstjobacmuaro`.
  - Live Edge Functions: 12 active (source retrieved via MCP for `book-class-with-access`, `yookassa-webhook`, `cron-maintenance`, `create-yookassa-checkout`, `send-push`, `payment-webhook`, `create-payment`, `cancel-subscription`, `gemini-proxy`, `subscribe-newsletter`).
  - Live migration ledger tail: `20260530155036_security_reconcile_grants_search_path_book_class_ledger`.
  - Supabase advisors: security and performance lint output (INFO/WARN level).
- **Memory files created/updated:**
  - `project-memory.md`
  - `open-loops.md`
  - `adr-log.md`
  - `development-diary.md`
  - `evidence-index.md`
- **Operational docs updated:** `CURRENT_TASKS.md`, `docs/LAUNCH_CHECKLIST.md`, `docs/INDEX.md`, `docs/SECURITY_MODEL.md`, `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md`.

---

## 2026-05-30 — Release gate PASS

- **Document:** `docs/RELEASE_EVIDENCE_2026_05_30.md`
- **GitHub:**
  - PR #517: `fix(security): reconcile Supabase grants and trace class booking`
  - PR #518: `feat(edge): expose safe trace receipt on booking errors`
  - PR #519: `docs(release): record 2026-05-30 PASS evidence`
  - Same-ref CI: GitHub Actions run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb`
  - Same-ref deploys: Pages `26588248681`, Firebase `26588248787`
  - 9 successful checks.
- **Supabase:**
  - Live migration ledger includes `20260530155036_security_reconcile_grants_search_path_book_class_ledger`.
  - Security advisors show no WARN lints.
  - `book_class_with_access` and `book_class_with_access_internal` are service-role-only at RPC level.
  - `book-class-with-access` Edge Function version 7 live.

---

## 2026-05-31 — Codex skill installation

- Artifact: `/opt/codex/skills/codex-dynamic-workflows/SKILL.md`
- Source URL: `https://github.com/DannyMac180/skills/tree/main/codex-dynamic-workflows`
- Verification commands:
  - `python /opt/codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --url https://github.com/DannyMac180/skills/tree/main/codex-dynamic-workflows`
  - `find /opt/codex/skills/codex-dynamic-workflows -maxdepth 3 -type f -print | sort`
  - `sed -n '1,220p' /opt/codex/skills/codex-dynamic-workflows/SKILL.md`
- Result: Installed and locally verified; restart Codex to load it.
