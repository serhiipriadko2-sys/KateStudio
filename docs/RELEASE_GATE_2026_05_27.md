# Release Gate | KateStudio | 2026-05-27

> Evaluator: Codex / Iskra / Iskra vΩ.7
> Release-source scope: local code/docs gate; final pushed SHA is verified via GitHub Actions after publication.
> Supabase project: `qkaycdcbstjobacmuaro`
> Mode: RELEASE
> Boundary: local code/docs changes + read-only live checks; no production mutation.

---

## Section A — Migration

- [x] `20260516182944` exact match confirmed.
- [x] `20260516202546` semantic mapping confirmed.
- [x] `20260516202845` semantic mapping confirmed.
- [ ] `20260518205158` exact match or semantic mapping confirmed.
- [x] unresolved delta explicitly documented.
- [x] schema intent note exists for `dataset_runs` / `dataset_artifacts`.
- [x] forward schema artifact proposal exists.
- [x] forward migration candidate exists:
  `20260527174716_reconcile_dataset_runs_artifacts_forward.sql`.

Result: `PARTIAL`

Reason: `20260518205158_create_dataset_runs_and_artifacts` is now bounded and
documented, and a forward migration candidate exists for fresh/staging
environments. It is still not exact-historical Git reproducible.

---

## Section B — CI / Local Gates

- [x] pre-publication green CI baseline exists for the prior `main` release path.
- [x] `npm run check:migrations` green locally.
- [x] `npm run lint` green locally.
- [x] `npm run typecheck` green locally.
- [x] `npm run test:run` green locally.
- [x] `npm run build:web` green locally.
- [x] `npm run build:app` green locally.

Local receipts (2026-05-27 pass #2, HEAD `9a1c31e`, 21:55 MSK):

- `npm run check:migrations` -> PASS, `67 files, 0 known collision group(s), 1 legacy short timestamp file(s)`
- `npm run lint` -> PASS, 0 warnings
- `npm run typecheck` -> PASS
- `npm run test:run` -> PASS, `72 files / 503 tests`
- `npm run build:web` -> PASS with chunk-size warnings only
- `npm run build:app` -> PASS with chunk-size and ineffective dynamic import warnings

GitHub receipts:

- pre-publication baseline SHA: `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`
- baseline successful check-runs on 2026-05-27:
  - `Lint & Format Check`
  - `TypeScript Check`
  - `Run Tests`
  - `Build WEB`
  - `Build APP`
  - `Supabase Preview`
  - `Build for Pages`
  - `Deploy`
  - `build-and-deploy`
- current HEAD `9a1c31e` (2026-05-27T18:53:02Z): docs-only gate pass #2 (RELEASE_GATE update, ADRs, INDEX update, CURRENT_TASKS update); no code impact on CI.
- commit: https://github.com/serhiipriadko2-sys/KateStudio/commit/9a1c31e64c3af3e20a4ab8204a18475e6c04c0f9

Result: `PASS`

---

## Section C — Governance

- [x] dual payment contour decision note exists.
- [x] contour ownership is explicit.
- [x] transition / retirement criteria are explicit.
- [x] legacy admin subscriptions surface decision exists.
- [x] controlled retirement execution path exists.
- [x] `book_class_with_access` ADR written: `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md`
- [x] leaked password protection ADR written: `docs/adr/ADR-2026-05-27-leaked-password-protection-pending.md`

Result: `PASS`

Reason: governance is explicit. Live retirement of `create-payment`,
`payment-webhook`, and `cancel-subscription` is intentionally not executed in
this pass. Both security items now have formal ADR records with expiry dates.

---

## Section D — Security

- [x] `book_class_with_access` decision note exists.
- [x] `book_class_with_access` ADR exists with expiry 2026-06-10.
- [x] leaked password protection decision note exists.
- [x] leaked password protection ADR exists with expiry 2026-06-03.
- [x] live warnings have decision notes and a remediation packet.
- [x] live function body verified — `auth.uid()` guard confirmed via `pg_get_functiondef`.
- [x] legacy payment caller inventory completed — 0 repo-side callers found.
- [ ] live warnings are remediated.

Live advisor receipt (confirmed 2026-05-27 via Supabase MCP):

- `authenticated_security_definer_function_executable` → `book_class_with_access` (auth_leaked_password_protection successfully resolved!)

Function analysis (via `pg_get_functiondef` on live DB):

- `book_class_with_access` contains explicit `auth.uid()` null-check guard.
- Performs `FOR UPDATE` locking on `classes` + `user_passes` in one transaction.
- `public` / `anon` execute revoked via migrations `20260516211000` + `20260516214500`.
- `authenticated` execute is intentional for APP booking path.
- Cross-user abuse requires bypassing the `auth.uid()` guard, not possible via normal client calls.

Repo-side callers of legacy payment functions (final inventory 2026-05-27):

- `create-payment`: 0 callers in TS/TSX ✅
- `payment-webhook`: 0 callers in TS/TSX ✅
- `cancel-subscription`: only self-referenced in its own Edge Function source ✅

Result: `PARTIAL`

Reason: Leaked password protection is enabled and verified. The remaining live warning (`book_class_with_access`) has an accepted ADR with an expiry date of 2026-06-10.

Remediation packet: `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md`.

---

## Section E — Runtime Smoke

- [x] `https://ksebe-studio.ru/` returned `200 OK` after VPN route change.
- [x] `https://artful-striker-476211-h4.web.app` returned `200 OK`.
- [x] Supabase REST endpoint returned `401` without credentials, which is
  expected for unauthenticated direct REST probing.
- [x] `app_settings` row count checked without printing values.
- [x] `site_images` row count checked.

Live data receipts:

- `app_settings`: 3 rows; keys observed: `opening_hours`, `studio_contacts`,
  `studio_profile`.
- `site_images`: 0 rows.
- policy check: public `app_settings` read policy exposes only
  `studio_contacts` for `anon` / `authenticated`.

Edge Functions inventory (confirmed 2026-05-27 via Supabase MCP, 11 functions):

- AI: `ai-run` (v7), `ai-embeddings` (v7), `gemini-proxy` (v5) — ACTIVE
- Payment (app-target): `create-yookassa-checkout` (v7), `yookassa-webhook` (v5) — ACTIVE
- Payment (legacy, retirement pending): `create-payment` (v5), `payment-webhook` (v5), `cancel-subscription` (v5) — ACTIVE
- Infra: `cron-maintenance` (v5), `send-push` (v5), `subscribe-newsletter` (v5) — ACTIVE

Result: `PASS WITH WARNING`

Warning: `site_images` remains empty, but code falls back to local/static image
state; this is not a launch blocker.

---

## Overall Verdict

Overall verdict: `PARTIAL`

Release-candidate state: `READY`

Production PASS state: `NOT YET`

Top blockers (in priority order):

1. **legacy payment retirement**: `create-payment`, `payment-webhook`,
   `cancel-subscription` have 0 repo-side callers but remain ACTIVE live.
   Staged retirement when owner confirms no pending manual calls.
   Execution path: `docs/LEGACY_PAYMENT_RETIREMENT_EXECUTION_PATH_2026_05_27.md`

2. **`book_class_with_access`** (accepted, expires 2026-06-10): known risk,
   function body verified safe for current threat model. Remediation path
   documented (Edge Function wrapper or SECURITY INVOKER + RLS audit).
   ADR: `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md`

Rollback concern:

- live retirement of legacy payment functions must remain staged and reversible;
- any remediation of `book_class_with_access` must preserve APP booking with
  valid pass behavior.

One next step:

Retire legacy payment functions in staged order.

---

## Closure

Result: KateStudio is code/CI release-candidate ready on current `main` (`9a1c31e`).
All 7 local gates pass as of 2026-05-27 21:55 MSK.
Leaked password protection has been successfully enabled and verified on live.
The remaining security warning (`book_class_with_access`) has an accepted ADR until 2026-06-10.
Full production release PASS is pending until legacy payment functions are retired or explicitly accepted as a transition window.
