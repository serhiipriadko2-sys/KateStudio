# Launch Checklist & Gap Analysis

> **Обновлено:** 10 мая 2026
> **Вердикт:** production launch readiness **FAIL**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | FAIL | multiple operational docs lag behind live state |
| Local code health | LAST KNOWN PASS | latest pass is repo-stated, not re-run in this audit |
| Supabase security governance | FAIL | `profiles` open policy remains |
| Schema reproducibility | FAIL | repo/live migration histories are not reconciled |
| Function deployment clarity | FAIL | counts match, inventories differ |
| Trainers rollout documentation | PARTIAL | live and repo have trainers, docs do not fully reflect it |

---

## 2. Hard blockers

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | `profiles` public write/read policy | still active live |
| P0 | migration truth split | 42 repo migrations vs 14 live applied |
| P0 | function canon split | repo-only and live-only functions coexist |
| P0 | admin contract ambiguity | live still keeps `profiles.is_admin`; repo remediation path is prepared but not validated here |

---

## 3. Security checklist

- `dialogue` has RLS enabled with no policy resolution in live.
- live advisors still flag mutable `search_path` functions.
- `images` bucket still needs explicit listing/constraint review as an operational surface.
- leaked password protection remains disabled.
- GraphQL schema exposure remains broad for many public tables.

Status: **not ready for launch sign-off**.

---

## 4. Data / migration checklist

- [ ] establish a reproducible non-production reconciliation target
- [ ] compare 42 repo migrations against 14 live-applied records
- [ ] verify whether 2026-05-09 and 2026-05-10 trainer rollout migrations are fully represented in repo + live
- [ ] regenerate DB types only after baseline reconciliation

Status: **not complete**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs `gemini-proxy` responsibilities
- [ ] decide fate of repo-only `create-yookassa-checkout` and `yookassa-webhook`
- [ ] verify client callers against active function names
- [ ] confirm payment/public endpoints that are intended to stay live

Status: **not complete**.

---

## 6. Testing / build checklist

These items remain last-known-good from repo documentation, not freshly executed in this audit:

- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build:web`
- `npm run build:app`

Status: **historically green, not re-run here**.

---

## 7. Launch PASS definition

Launch PASS requires all of the following:

1. `profiles` public `ALL true/true` policy removed and verified.
2. repo/live migration baseline reconciled.
3. function inventory drift intentionally resolved or explicitly accepted.
4. operational docs updated inside the repo canon, not only in external notes.
5. local verification rerun after the reconciliation path.

Until then, any "launch-ready" claim would be decorative, not true.
