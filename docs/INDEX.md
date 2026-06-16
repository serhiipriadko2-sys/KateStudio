# Центральный индекс документации | KateStudio

> **Обновлено:** 16 июня 2026 | **Версия:** 9.6.0
> Рабочий канон: current security hardening branch + live Supabase metadata. Historical late-May release receipts remain useful, but they do not prove this June change-set.

---

## Current Hardening Snapshot

| Domain | Verified value |
| --- | --- |
| Active hardening branch | `codex/security-retire-live-ai-cron-20260616` |
| Live Supabase project | `qkaycdcbstjobacmuaro` |
| Live applied migrations | `42` |
| Live Edge Functions | `12` |
| Live security advisors | `0 WARN / 9 INFO` |
| Legacy AI functions | `ai-run` v8 and `ai-embeddings` v8 retired in place, JWT retained |
| Canonical AI function | `gemini-proxy` |
| Cron maintenance | `cron-maintenance` v6, custom bearer auth, fail-closed on missing/invalid `CRON_SECRET` |
| APP payment pair | `create-yookassa-checkout` + `yookassa-webhook` |
| Legacy payment trio | present as retired-in-place stubs |
| Fresh exact-ref CI for this branch | **PENDING** |
| Current release verdict | **PARTIAL** until CI/promotion receipt is attached |

---

## Читать первым

- `CURRENT_TASKS.md` — current operational status for the June hardening branch
- `docs/LAUNCH_CHECKLIST.md` — go/no-go checklist and PASS definition
- `docs/EDGE_FUNCTIONS.md` — current repo/live Edge Function truth
- `docs/RELEASE_EVIDENCE_2026_06_16.md` — receipt packet for this hardening change-set
- `docs/ARCHITECTURE.md` — current runtime topology and repo/live split
- `docs/SECURITY_MODEL.md` — broader security model; verify against current live advisors before using as present-tense release truth

---

## Working Documentation

| Документ | Роль |
| --- | --- |
| `CURRENT_TASKS.md` | short operational canon |
| `docs/LAUNCH_CHECKLIST.md` | release readiness and blockers |
| `docs/EDGE_FUNCTIONS.md` | Edge Function inventory, drift, and operational rules |
| `docs/RELEASE_EVIDENCE_2026_06_16.md` | current hardening receipt packet |
| `docs/ARCHITECTURE.md` | monorepo/runtime contour |
| `docs/TESTING.md` | stable testing architecture + evidence discipline |
| `docs/SECURITY_MODEL.md` | security model, to be read with current live evidence |
| `docs/adr/` | durable decisions; filenames may be historical, read content and date before using as current truth |

---

## Historical, Not Present-Tense

These documents remain useful as audit history, but must not be used alone as present-tense truth:

- `docs/SUPABASE_AUDIT_LIVE_2026_05_02.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md`
- `docs/RELEASE_GATE_2026_05_27.md`
- `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md`
- `PRODUCTION_READINESS_AUDIT.md`

Reason: the current live baseline is already `42` applied migrations, `12` functions, and `0` security WARN. Older `41 / 11 / 1 warning` statements are historical unless explicitly restated in a June 2026 receipt.

---

## Quick Facts

| Domain | Current truth |
| --- | --- |
| Live applied migrations | `42` |
| Live functions | `12` |
| Live-only AI source drift | closed on the hardening branch; not closed on `main` until merge |
| Repo branch AI posture | retired stubs for `ai-run` and `ai-embeddings`, supported AI remains `gemini-proxy` |
| APP payment canon | `create-yookassa-checkout` + `yookassa-webhook` |
| Legacy payment contour | retired in place, not an active business contour |
| Security advisor WARN count | `0` |
| Final release PASS | pending fresh exact-ref CI and promotion receipt |

---

## Working Rule

For launch-sensitive or security-sensitive statements, use this order:

1. exact GitHub branch/SHA and PR status;
2. GitHub Actions receipt tied to that exact SHA;
3. live Supabase metadata/advisors/functions;
4. current derived operational documents;
5. historical audit files only as context.

If a document claims a greener state than the attached exact-ref receipt proves, treat that as docs drift rather than truth.
