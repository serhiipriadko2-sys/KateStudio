# Launch Checklist & Gap Analysis

> **Обновлено:** 12 мая 2026
> **Вердикт:** production launch readiness **FAIL**

---

## 1. Current release truth

| Area | Status | Why |
| --- | --- | --- |
| Repo documentation truth | IMPROVED | the 2026-05-12 security delta is now recorded and the live baseline is closer to repo truth |
| Local code health | RED ON RELEASE PATH | merged PR `#492` has fresh CI evidence: `CI #1190` failed in `Run Tests`; lint and typecheck passed, builds were skipped |
| Supabase security governance | STRONG PARTIAL PASS | GraphQL discoverability and `vector`-in-`public` warnings are now closed; only leaked-password protection remains |
| Auth UX readiness for leaked-password enforcement | IMPROVED | WEB/APP/reset flows now distinguish weak and compromised password responses instead of collapsing them into generic auth failures |
| Schema reproducibility | PARTIAL | the latest live delta is committed, but older repo/live history still needs one explicit reconciliation pass |
| Function deployment clarity | FAIL | live and repo still differ around AI/payment naming contours |
| Runtime public smoke | MIXED | recent live logs now show `200` for `studio_contacts`, but still show `401` on generic `app_settings`, `406` on `image_map`, repeated `406` on `site_images`, and repeated `404` on `payment_orders` / `user_passes` |

---

## 2. What was closed in this pass

- live Supabase now reports **30 applied migrations**.
- live Supabase still reports **9 active Edge Functions**.
- one additional live hardening migration from 2026-05-12 was executed and recorded in the repo canon:
  - `20260512062001_missing_security_deltas`
- `pg_graphql` was removed from live because the project evidence currently points to REST usage, not GraphQL usage.
- `vector` was moved from `public` to `extensions`.
- security advisors now report only one remaining warning: leaked password protection disabled.
- repo-side runtime probes for `app_settings` / `site_images` were narrowed in merged PR `#492`.
- repo-side auth UX was hardened so weak and compromised password paths now have explicit user guidance before the live Supabase Auth toggle.

---

## 3. Hard blockers still open

| Priority | Blocker | Current fact |
| --- | --- | --- |
| P0 | function canon split | live still keeps `ai-run` / `ai-embeddings`, while repo-side naming drift has not been intentionally normalized |
| P0 | failing CI on the current release path | fresh `CI #1190` for merged PR `#492` failed in `Run Tests`; builds did not run |
| P0 | leaked password protection disabled in live Auth | Supabase security advisor still warns; repo-side UX hardening is already in place, but the live toggle is still off |
| P1 | runtime public smoke still not clean | recent live API logs still show remaining `401` / `406` / `404` probes even after the repo-side narrowing in PR `#492` |

---

## 4. Data / migration checklist

- [x] record the 2026-05-11 live hardening migrations in `main`
- [x] record the 2026-05-12 `missing_security_deltas` live migration in `main`
- [x] remove GraphQL discoverability by disabling unused `pg_graphql`
- [x] move `vector` extension out of `public`
- [ ] perform a full repo/live migration inventory reconciliation across older history
- [ ] regenerate DB types only after the broader baseline is intentionally accepted

Status: **partially complete**.

---

## 5. Function checklist

- [ ] decide canonical AI contour: `ai-run` / `ai-embeddings` vs repo-side alternatives
- [ ] decide canonical payment function naming and remove stale repo/live drift
- [ ] verify client callers against active function names
- [ ] confirm which payment/public endpoints are intentionally exposed in production

Status: **not complete**.

---

## 6. Testing / build checklist

Current verified release-path evidence from merged PR `#492`:

- `npm run check:migrations` → PASS via `Lint & Format Check`
- `npm run lint` → PASS via `Lint & Format Check`
- `npm run typecheck` → PASS via `TypeScript Check`
- `npm run test:run` → FAIL in `CI #1190`
- `npm run build:web` → SKIPPED because tests failed
- `npm run build:app` → SKIPPED because tests failed

Concrete failing test:

- `shared/__tests__/imageStorage.test.ts`
- case: `returns saved image url when present`
- assertion: expected `https://example.com/image.jpg`, received `null`

Status: **blocking until green**.

---

## 7. Smoke / runtime checklist

Recent live API evidence supports these passes:

- [x] auth health endpoint responds `200`
- [x] REST admin readiness responds `200`
- [x] public `classes` reads respond `200`
- [x] public `faq_items` reads respond `200`
- [x] public `reviews` reads respond `200`
- [x] public `trainers` reads respond `200`
- [x] public `app_settings?key=studio_contacts` reads respond `200`
- [x] public analytics writes respond `201`
- [ ] generic public `app_settings` reads stop returning `401`
- [ ] `app_settings?key=image_map` stops returning `406`
- [ ] `site_images` lookups stop returning repeated `406`
- [ ] stale browser probes to `payment_orders` / `user_passes` stop returning repeated `404`

Status: **mixed, needs one more pass**.

---

## 8. Launch PASS definition

Launch PASS requires all of the following:

1. AI/payment function naming drift is intentionally resolved or explicitly accepted.
2. CI is freshly green on the current release path, including tests and both builds.
3. leaked password protection is enabled.
4. weak signup, compromised reset, and sign-in with an old weak password are manually verified against the updated UX copy.
5. remaining public smoke anomalies around generic `app_settings`, `image_map`, `site_images`, `payment_orders`, and `user_passes` are either fixed or explicitly accepted with evidence.
6. remaining repo/live migration baseline drift is either reconciled or explicitly documented as accepted history.

Until then, any "launch-ready" claim would still be decorative, not true.
