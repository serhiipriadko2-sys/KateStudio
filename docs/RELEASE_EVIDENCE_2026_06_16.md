# Release Evidence | 2026-06-16 Security Hardening

> Scope: minimal approved change-set to retire legacy AI functions, make cron maintenance fail closed, refresh release truth docs, and obtain a fresh release receipt.
> Current verdict: **PARTIAL** until exact-ref CI is green and the branch is promoted/merged.

---

## 1. Change-set

| Surface | Change | Receipt |
| --- | --- | --- |
| `ai-run` | replaced live legacy service-role behavior with JWT-protected retired stub | Supabase deploy version 8, SHA `c2e615ea38952c7d1cf033836a7c13d881046e1ec5952b252e42ba54afad696d` |
| `ai-embeddings` | replaced live legacy service-role behavior with JWT-protected retired stub | Supabase deploy version 8, SHA `dcc73384d20d7486237c1337231754be6577c7e9fd7ff1f0a88095732ae4184f` |
| `cron-maintenance` | changed custom-auth endpoint from fail-open to fail-closed on missing/invalid `CRON_SECRET` | Supabase deploy version 6, SHA `522eba95cb5517b17f1ba9e2502877c12599d647d8b00374e4055ab94b9abe70` |
| release truth docs | refreshed current tasks, launch checklist, edge-function reference, index, and architecture | branch `codex/security-retire-live-ai-cron-20260616` |

---

## 2. Live Supabase baseline

| Signal | Value |
| --- | --- |
| Project | `qkaycdcbstjobacmuaro` |
| Applied migrations | `42` |
| Active Edge Functions | `12` |
| Security advisors | `0 WARN / 9 INFO` |
| INFO residue | `rls_enabled_no_policy` on empty/scaffold tables |

---

## 3. Security interpretation

[FACT] `ai-run` and `ai-embeddings` are no longer live service-role write surfaces accepting user-controlled AI payloads.

[FACT] `cron-maintenance` no longer runs privileged maintenance tasks if `CRON_SECRET` is missing.

[INTERP] The original P0 risk that caused the FAIL gate is remediated at live-source level.

[INTERP] Release status is still not PASS because repo promotion and exact-ref CI receipt are not yet attached.

[HYP] A later deletion of retired AI endpoints may be safe, but only after checking runtime/client invocation telemetry and any external callers.

---

## 4. Residue

- PR/CI receipt is still required for final release PASS.
- Full browser/app E2E was not part of this connector-driven security patch.
- Historical docs may still mention older late-May counts; use current index/checklist/edge-functions docs first.

---

## 5. PASS condition

The next release gate can move from PARTIAL to PASS only when the exact PR or promoted `main` SHA has green CI for the release path and the live Supabase state still shows:

- `ai-run` v8 retired stub;
- `ai-embeddings` v8 retired stub;
- `cron-maintenance` v6 fail-closed source;
- 0 security-advisor WARN.
