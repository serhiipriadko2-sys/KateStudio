# Release Gate | KateStudio | 2026-05-27

> Evaluator: Codex / Iskra
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

Local receipts:

- `npm run check:migrations` -> PASS, `67 files, 0 known collision group(s), 1 legacy short timestamp file(s)`
- `npm run lint` -> PASS, 0 warnings after cleanup
- `npm run typecheck` -> PASS
- `npm run test:run` -> PASS, `72 files / 503 tests`
- `npm run build:web` -> PASS with chunk-size warnings
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

Result: `PASS`

---

## Section C — Governance

- [x] dual payment contour decision note exists.
- [x] contour ownership is explicit.
- [x] transition / retirement criteria are explicit.
- [x] legacy admin subscriptions surface decision exists.
- [x] controlled retirement execution path exists.

Result: `PASS`

Reason: governance is explicit. Live retirement of `create-payment`,
`payment-webhook`, and `cancel-subscription` is intentionally not executed in
this pass.

---

## Section D — Security

- [x] `book_class_with_access` decision note exists.
- [x] leaked password protection decision note exists.
- [x] live warnings have decision notes and a remediation packet.
- [ ] live warnings are remediated.

Live advisor receipt:

- `authenticated_security_definer_function_executable`
- `auth_leaked_password_protection`

Result: `PARTIAL`

Reason: governance is no longer missing, but the live warnings remain. Full PASS
requires live remediation and verification, or a later explicit exception.

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

Result: `PASS WITH WARNING`

Warning: `site_images` remains empty, but code falls back to local/static image
state; this is not a launch blocker.

---

## Overall Verdict

Overall verdict: `PARTIAL`

Release-candidate state: `READY`

Production PASS state: `NOT YET`

Top blocker:

- leaked password protection live Auth config write + auth smoke;
- branch/staging proof for `book_class_with_access` remediation;
- final decision on live legacy payment function retirement.

Rollback concern:

- live retirement of legacy payment functions must remain staged and reversible;
- any remediation of `book_class_with_access` must preserve APP booking with
  valid pass behavior.

One next step:

Continue the live remediation packet: enable leaked password protection through
Dashboard/API, prepare branch/staging proof for `book_class_with_access`, and
retire legacy payment functions only after the stale callers are gone.

---

## Closure

Result: KateStudio is code/CI release-candidate ready on current `main`, and
live remediation is in progress. Full production release PASS is withheld until
the remaining live security and payment retirement steps are verified.
