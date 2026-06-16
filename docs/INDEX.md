# Центральный индекс документации | KateStudio

> **Обновлено:** 16 июня 2026 | **Версия:** 9.6.0
> Рабочий канон: reconciled repo evidence base + explicit GitHub Actions receipt + live Supabase metadata + operational memory stack.
> Этот индекс отражает строгий reconciliation packet и не должен смешивать старые narrative baselines с current truth.

---

## Strict Reconciliation Snapshot

| Domain | Verified value |
| --- | --- |
| Latest reconciled repo HEAD before index self-sync | `cd0e0d871603329bf6173c7275230851b8cb76fb` |
| Same-ref release-path receipt for that HEAD | **VERIFIED**: CI run `26588248604` on `push` to `main` |
| Latest verified full green release-path receipt | GitHub Actions run `26588248604` for SHA `cd0e0d871603329bf6173c7275230851b8cb76fb` |
| Same-ref CI jobs | `Lint & Format Check`, `TypeScript Check`, `Run Tests`, `Build WEB`, `Build APP` all `success` |
| Same-ref CI artifacts | `web-build`, `app-build` |
| Companion deploy receipts on same push | Pages run `26588248681`, Firebase run `26588248787` |
| Live applied migrations | `41` |
| Live functions | `12` |
| Live security advisors | **NO WARN BLOCKERS**; remaining output is INFO/WARN hygiene (permissive policies, initplan, unused indexes) |
| Remaining live security warning | none |
| APP-target payment pair in live | present |
| Legacy payment trio in live | present as retired-in-place controlled stubs |
| Booking contour | `book-class-with-access` Edge Function v7 → `book_class_with_access_internal` service-role-only RPC |
| Memory stack | active (`project-memory.md`, `open-loops.md`, `adr-log.md`, `development-diary.md`, `evidence-index.md`) |

### Self-Sync Caveat

This file is committed onto `main`. Any commit that rewrites `docs/INDEX.md` advances `main` and therefore cannot also remain a perfect self-description of the post-write HEAD SHA. To avoid false precision, treat `cd0e0d871603329bf6173c7275230851b8cb76fb` as the latest reconciled repo HEAD that was fully inspected before this index self-sync write.

### Meaning

1. Exact same-ref release proof now exists for reconciled HEAD `cd0e0d871603329bf6173c7275230851b8cb76fb`: CI run `26588248604`, triggered via `push` to `main`, with all five release-path jobs green and both build artifacts attached.
2. Companion deploy runs also exist on the same push: GitHub Pages `26588248681` and Firebase `26588248787`, both `success`.
3. Do **not** describe live Supabase as still carrying the older `profiles` public-policy, leaked-password, or `book_class_with_access` blockers unless a fresher live source reopens them.
4. The canonical booking boundary is the `book-class-with-access` Edge Function; the underlying RPC is service-role-only.
5. Treat any newer commit created solely to sync this index as documentation drift control, not as evidence that the reconciled head itself changed.

---

## Читать первым

- `CURRENT_TASKS.md` — краткий operational status на текущем canon
- `docs/LAUNCH_CHECKLIST.md` — текущий go / no-go checklist
- `docs/RELEASE_EVIDENCE_2026_05_30.md` — release gate PASS receipt
- `project-memory.md` — verified operational facts
- `open-loops.md` — unresolved risks and drift
- `adr-log.md` — governance decisions
- `docs/EDGE_FUNCTIONS.md` — repo/live function inventory и drift map
- `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md` — remediation status after legacy payment retirement in place
- `docs/SECURITY_MODEL.md` — current security model
- `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md` — **SUPERSEDED** historical ADR
- `docs/TESTING.md` — stable testing architecture + evidence discipline

---

## Рабочая документация

| Документ | Роль |
| --- | --- |
| `CURRENT_TASKS.md` | короткий operational канон |
| `project-memory.md` | verified reusable facts и governance decisions |
| `open-loops.md` | unresolved risks и drift |
| `adr-log.md` | governance decisions |
| `development-diary.md` | continuity after meaningful work |
| `evidence-index.md` | указатели на receipts |
| `docs/ARCHITECTURE.md` | monorepo structure, runtime contour, repo/live split |
| `docs/EDGE_FUNCTIONS.md` | repo/live function inventory и drift map |
| `docs/LAUNCH_CHECKLIST.md` | release readiness и blockers |
| `docs/RELEASE_EVIDENCE_2026_05_30.md` | release gate PASS receipt |
| `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md` | live remediation packet after late-May security/payment narrowing |
| `docs/SECURITY_MODEL.md` | current security model and confirmed live deltas |
| `docs/TESTING.md` | testing architecture |

---

## HIGH-RISK DRIFT (active)

| Issue | Source | Status |
| --- | --- | --- |
| `supabase/config.toml` `project_id` does not match live ref | `supabase/config.toml` line 1 vs `.mcp.json` / live metadata | open |
| Missing least-privilege `permissions:` in workflows | `.github/workflows/ci.yml`, `capacitor-build.yml`, `cron.yml`, `firebase-deploy.yml` | open |
| Plaintext password logging | `scripts/create-admin.ts` | open |

See `open-loops.md` for details and next steps.

---

## Historical, Not Present-Tense

These documents remain useful, but must not be used as standalone present-tense truth without fresher repo/live evidence:

- `docs/SUPABASE_AUDIT_LIVE_2026_05_02.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` when quoted without its later drift corrections
- `PRODUCTION_READINESS_AUDIT.md`
- `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md` — superseded by the Edge Function + internal RPC design

Reason: the current verified live baseline is at `41` applied migrations, `12` functions, and no WARN-level security advisor blockers.

---

## Filename Traps

The following filenames can mislead if read literally instead of by content:

- `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md`
  - current status is **SUPERSEDED**; the design has moved to an Edge Function + service-role RPC
- `docs/adr/ADR-2026-05-27-leaked-password-protection-pending.md`
  - current content says the remediation is **resolved**
- `docs/RELEASE_GATE_2026_05_27.md`
  - same-ref gap is superseded by CI run `26588248604` on `cd0e0d871603329bf6173c7275230851b8cb76fb`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md`
  - current content is a historical bridge with later correction notes, not a raw present-tense snapshot

---

## Quick Facts

| Domain | Current truth |
| --- | --- |
| Reconciled repo HEAD before index self-sync | `cd0e0d871603329bf6173c7275230851b8cb76fb` |
| Same-ref receipt status for that HEAD | verified by CI run `26588248604` |
| Same-ref deploy follow-through | Pages `26588248681`, Firebase `26588248787` |
| Live applied migrations | `41` |
| Live functions | `12` |
| Live-only functions | `ai-run`, `ai-embeddings` |
| Repo functions | `9` folders, all 12 functions deployed live |
| APP payment canon | `create-yookassa-checkout` + `yookassa-webhook` |
| Legacy payment contour | retired in place, not an active business contour |
| Booking contour | `book-class-with-access` Edge Function → `book_class_with_access_internal` RPC |
| Live security warning count | `0` WARN blockers |
| Latest verified full green receipt | run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb` |

---

## Working Rule

For any launch-sensitive or security-sensitive statement, use this order:

1. latest reconciled repo HEAD,
2. explicit GitHub Actions receipt tied to that exact SHA,
3. live Supabase metadata/advisors/functions,
4. operational memory stack (`project-memory.md`, `open-loops.md`, `adr-log.md`),
5. only then the derived operational documents.

If a document claims a greener state than the attached same-ref receipt proves, treat that as docs drift rather than truth.
