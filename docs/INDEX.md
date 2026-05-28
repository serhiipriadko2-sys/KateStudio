# Центральный индекс документации | KateStudio

> **Обновлено:** 28 мая 2026 | **Версия:** 9.5.3
> Рабочий канон: reconciled repo evidence base + explicit GitHub Actions receipt + live Supabase metadata.
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
| Live functions | `11` |
| Live security advisors | `1 warning` |
| Remaining live warning | `book_class_with_access` as authenticated `SECURITY DEFINER` RPC |
| APP-target payment pair in live | present |
| Legacy payment trio in live | present as retired-in-place controlled stubs |

### Self-Sync Caveat

This file is committed onto `main`. Any commit that rewrites `docs/INDEX.md` advances `main` and therefore cannot also remain a perfect self-description of the post-write HEAD SHA. To avoid false precision, treat `cd0e0d871603329bf6173c7275230851b8cb76fb` as the latest reconciled repo HEAD that was fully inspected before this index self-sync write.

### Meaning

1. Exact same-ref release proof now exists for reconciled HEAD `cd0e0d871603329bf6173c7275230851b8cb76fb`: CI run `26588248604`, triggered via `push` to `main`, with all five release-path jobs green and both build artifacts attached.
2. Companion deploy runs also exist on the same push: GitHub Pages `26588248681` and Firebase `26588248787`, both `success`.
3. Do **not** describe live Supabase as still carrying the older `profiles` public-policy or leaked-password blockers unless a fresher live source reopens them.
4. The remaining top-level residue is the accepted live warning on `book_class_with_access`, not a missing same-ref release proof.
5. Treat any newer commit created solely to sync this index as documentation drift control, not as evidence that the reconciled head itself changed.

---

## Читать первым

- `CURRENT_TASKS.md` — краткий operational status на текущем late-May canon
- `docs/LAUNCH_CHECKLIST.md` — текущий go / no-go checklist
- `docs/RELEASE_GATE_2026_05_27.md` — historical release-gate packet; its same-ref gap note is now superseded by CI run `26588248604` for reconciled HEAD `cd0e0d871603329bf6173c7275230851b8cb76fb`
- `docs/EDGE_FUNCTIONS.md` — repo/live function inventory и drift map
- `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md` — remediation status after legacy payment retirement in place
- `docs/SECURITY_DECISION_BOOK_CLASS_WITH_ACCESS_2026_05_27.md` — accepted-risk packet for the remaining live warning
- `docs/SECURITY_DECISION_LEAKED_PASSWORD_PROTECTION_2026_05_27.md` — resolved live remediation note; filename is current, content says remediation completed
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` — historical bridge audit only; not a standalone present-tense snapshot

---

## Рабочая документация

| Документ | Роль |
| --- | --- |
| `CURRENT_TASKS.md` | короткий operational канон |
| `docs/ARCHITECTURE.md` | monorepo structure, runtime contour, repo/live split |
| `docs/EDGE_FUNCTIONS.md` | repo/live function inventory и drift map |
| `docs/LAUNCH_CHECKLIST.md` | release readiness и blockers |
| `docs/RELEASE_GATE_2026_05_27.md` | historical release-gate receipt set; same-ref CI gap is now closed by later evidence |
| `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md` | live remediation packet after late-May security/payment narrowing |
| `docs/SECURITY_MODEL.md` | current security model and confirmed live deltas |
| `docs/SECURITY_DECISION_BOOK_CLASS_WITH_ACCESS_2026_05_27.md` | accepted warning packet for `book_class_with_access` |
| `docs/SECURITY_DECISION_LEAKED_PASSWORD_PROTECTION_2026_05_27.md` | leaked-password remediation note; resolved state is in the content |
| `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md` | formal ADR for the remaining accepted live warning |
| `docs/adr/ADR-2026-05-27-leaked-password-protection-pending.md` | historical filename only; current content records the remediation as resolved |
| `docs/MIGRATION_FORWARD_SCHEMA_ARTIFACT_PROPOSAL_20260518205158.md` | forward reconciliation artifact proposal for `dataset_runs` / `dataset_artifacts` |
| `docs/CHATGPT_AGENT_RUNTIME.md` | builder-runtime governance for the ChatGPT KateStudio agent |
| `docs/TESTING.md` | stable testing architecture + evidence discipline |

---

## Historical, Not Present-Tense

These documents remain useful, but must not be used as standalone present-tense truth without fresher repo/live evidence:

- `docs/SUPABASE_AUDIT_LIVE_2026_05_02.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` when quoted without its later drift corrections
- `PRODUCTION_READINESS_AUDIT.md`

Reason: the current verified live baseline is already at `41` applied migrations, `11` functions, and `1` remaining security advisor warning.

---

## Filename Traps

The following filenames can mislead if read literally instead of by content:

- `docs/adr/ADR-2026-05-27-leaked-password-protection-pending.md`
  - current content says the remediation is **resolved**
- `docs/RELEASE_GATE_2026_05_27.md`
  - current content still says a fresh same-ref verification pass is required, but that statement is superseded by CI run `26588248604` on `cd0e0d871603329bf6173c7275230851b8cb76fb`
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
| Live functions | `11` |
| Live-only functions | `ai-run`, `ai-embeddings` |
| Repo functions | `9` |
| APP payment canon | `create-yookassa-checkout` + `yookassa-webhook` |
| Legacy payment contour | retired in place, not an active business contour |
| Live security warning count | `1` |
| Current exact warning | `book_class_with_access` |
| Latest verified full green receipt | run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb` |

---

## Working Rule

For any launch-sensitive or security-sensitive statement, use this order:

1. latest reconciled repo HEAD,
2. explicit GitHub Actions receipt tied to that exact SHA,
3. live Supabase metadata/advisors/functions,
4. only then the derived operational documents.

If a document claims a greener state than the attached same-ref receipt proves, treat that as docs drift rather than truth.
