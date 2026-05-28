# Центральный индекс документации | KateStudio

> **Обновлено:** 28 мая 2026 | **Версия:** 9.5.1
> Рабочий канон: current GitHub `main` HEAD + explicit GitHub Actions receipt + live Supabase metadata.
> Этот индекс отражает строгий reconciliation packet и не должен смешивать старые narrative baselines с current truth.

---

## Strict Reconciliation Snapshot

| Domain | Verified value |
| --- | --- |
| Current `main` HEAD | `f9135994f32e367536a404f17576efc5518e2251` |
| Current HEAD same-ref release-path receipt | **UNVERIFIED in this packet** |
| Latest verified full green release-path receipt | GitHub Actions run `26508804416` for SHA `5a2393539bc664e40fd4f966bc0d7af6aa85dd86` |
| Live applied migrations | `41` |
| Live functions | `11` |
| Live security advisors | `1 warning` |
| Remaining live warning | `book_class_with_access` as authenticated `SECURITY DEFINER` RPC |
| APP-target payment pair in live | present |
| Legacy payment trio in live | present as retired-in-place controlled stubs |

### Meaning

1. Do **not** infer a green release receipt for `f9135994f32e367536a404f17576efc5518e2251` from the older verified run on `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`.
2. Do **not** describe live Supabase as still carrying the older `profiles` public-policy or leaked-password blockers unless a fresher live source reopens them.
3. Treat the remaining top-level residue as **release-governance proof**, not as a reopened payment/RLS P0.

---

## Читать первым

- `CURRENT_TASKS.md` — краткий operational status на текущем late-May canon
- `docs/LAUNCH_CHECKLIST.md` — текущий go / no-go checklist
- `docs/RELEASE_GATE_2026_05_27.md` — latest release-gate receipt, but **not** same-ref proof for current HEAD `f9135994f32e367536a404f17576efc5518e2251`
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
| `docs/RELEASE_GATE_2026_05_27.md` | latest explicit release-gate receipt |
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
  - current content says a fresh same-ref verification pass is still required for full production `PASS`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md`
  - current content is a historical bridge with later correction notes, not a raw present-tense snapshot

---

## Quick Facts

| Domain | Current truth |
| --- | --- |
| Live applied migrations | `41` |
| Live functions | `11` |
| Live-only functions | `ai-run`, `ai-embeddings` |
| Repo functions | `9` |
| APP payment canon | `create-yookassa-checkout` + `yookassa-webhook` |
| Legacy payment contour | retired in place, not an active business contour |
| Live security warning count | `1` |
| Current exact warning | `book_class_with_access` |
| Latest verified full green receipt | run `26508804416` on SHA `5a2393539bc664e40fd4f966bc0d7af6aa85dd86` |
| Current HEAD receipt status | still requires explicit same-ref attachment |

---

## Working Rule

For any launch-sensitive or security-sensitive statement, use this order:

1. current GitHub `main` HEAD,
2. explicit GitHub Actions receipt tied to that exact SHA,
3. live Supabase metadata/advisors/functions,
4. only then the derived operational documents.

If a document claims a greener state than the attached same-ref receipt proves, treat that as docs drift rather than truth.
