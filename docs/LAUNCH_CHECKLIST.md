# Launch Checklist & Gap Analysis

> **Обновлено:** 16 июня 2026
> **Вердикт:** production launch readiness **PARTIAL / fresh exact-ref CI and merge pending**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | PARTIAL+ | current truth docs are refreshed on the security hardening branch; historical audit docs remain historical |
| Live Supabase security governance | PASS at WARN level | security advisors report 0 WARN after the latest review; INFO-only `rls_enabled_no_policy` entries remain |
| Schema reproducibility | PARTIAL | live has **42** applied migrations; broader older-history reconciliation remains hygiene work |
| Live Edge Function posture | PARTIAL+ | target AI/cron risks are hardened live, but branch CI and promotion are still pending |
| Fresh exact-ref CI proof | PENDING | required before release PASS |
| WEB payment posture | PASS at model level | WEB remains storefront/lead-form/Telegram, not checkout |
| APP payment posture | PASS at model level | APP YooKassa pair remains canonical |
| Runtime public smoke | NOT RE-CHECKED IN THIS CHANGE-SET | this change-set used GitHub/Supabase truth surfaces, not full browser E2E |

---

## 2. Confirmed on the 2026-06-16 hardening baseline

- live Supabase reports **42 applied migrations**.
- live Supabase reports **12 active Edge Functions**.
- live security advisors report **0 WARN** and INFO-only RLS-no-policy entries on empty/scaffold tables.
- `ai-run` is deployed as v8, requires JWT, and is a controlled retired stub.
- `ai-embeddings` is deployed as v8, requires JWT, and is a controlled retired stub.
- `cron-maintenance` is deployed as v6 and now fails closed when `CRON_SECRET` is absent or bearer auth is invalid.
- `gemini-proxy` remains the canonical supported AI contour.
- `create-yookassa-checkout` and `yookassa-webhook` remain the canonical APP payment pair.
- legacy payment endpoints remain retired in place.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | Fresh exact-ref release proof | the branch must pass CI, then the promoted/merged SHA must be used as the release receipt |

No live security-advisor WARN is currently blocking this gate. The remaining blocker is release proof, not the specific AI/cron vulnerability that triggered this patch.

---

## 4. Function checklist

- [x] keep WEB non-payment canon explicit
- [x] confirm APP YooKassa pair is live
- [x] keep legacy payment trio retired in place
- [x] retire `ai-run` in place with JWT boundary retained
- [x] retire `ai-embeddings` in place with JWT boundary retained
- [x] make `cron-maintenance` fail closed on missing/invalid `CRON_SECRET`
- [ ] obtain fresh exact-ref CI receipt for this branch or post-merge SHA
- [ ] promote/merge the branch intentionally after CI is green

Status: **target live security risks fixed; release PASS pending CI/promotion receipt**.

---

## 5. Testing / build checklist

Required for final PASS:

- [ ] migration integrity check
- [ ] lint + format check
- [ ] typecheck
- [ ] tests
- [ ] WEB build
- [ ] APP build
- [ ] attached CI run tied to the exact promoted SHA

Status: **pending for this branch**.

---

## 6. Launch PASS definition

Launch PASS requires all of the following:

1. exact-ref CI is green for migration check, lint, typecheck, tests, WEB build, and APP build;
2. live security advisors remain 0 WARN or any WARN is explicitly accepted with evidence;
3. retired AI functions remain stubs, not service-role write surfaces;
4. `cron-maintenance` remains fail-closed under custom bearer auth;
5. APP payment contour remains canonical and WEB remains non-payment by design;
6. final release receipt is attached to the exact promoted SHA.

Current status: **PARTIAL**. The live security change is deployed and verified at source/inventory level; final release PASS waits on CI and branch promotion.
