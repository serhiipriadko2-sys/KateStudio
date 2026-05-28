# Release Gate | KateStudio | 2026-05-28

> Evaluator: Codex / Iskra / Iskra vΩ.7
> Release-source scope: repo canon + live Supabase + current documented release path.
> Supabase project: `qkaycdcbstjobacmuaro`
> Mode: RELEASE
> Boundary: this document reflects post-retirement truth; a fresh same-ref verification pass is still required for final PASS.

---

## Section A — Migration

- [x] `20260516182944` exact match confirmed.
- [x] `20260516202546` semantic mapping confirmed.
- [x] `20260516202845` semantic mapping confirmed.
- [x] `20260518205158` accepted forward reconciliation confirmed.
- [x] unresolved delta explicitly documented.
- [x] schema intent note exists for `dataset_runs` / `dataset_artifacts`.
- [x] forward schema artifact exists:
  `20260527174716_reconcile_dataset_runs_artifacts_forward.sql`.

Result: `PARTIAL`

Reason: `20260518205158_create_dataset_runs_and_artifacts` is accepted through
forward reconciliation, not exact historical Git reproduction.

---

## Section B — CI / Local Gates

- [x] pre-publication green CI baseline exists for the prior `main` release path.
- [x] `npm run check:migrations` green locally in the accepted canon.
- [x] `npm run lint` green locally in the accepted canon.
- [x] `npm run typecheck` green locally in the accepted canon.
- [x] `npm run test:run` green locally in the accepted canon.
- [x] `npm run build:web` green locally in the accepted canon.
- [x] `npm run build:app` green locally in the accepted canon.
- [ ] fresh same-ref verification exists after the final retirement-in-place sync.

Result: `PARTIAL`

Reason: baseline green evidence exists, but the current post-retirement canon
still needs one fresh same-ref verification pass.

---

## Section C — Governance

- [x] legacy payment contour ownership is explicit.
- [x] `book_class_with_access` accepted-wrapper decision is explicit.
- [x] retirement-in-place posture for legacy trio is explicit.
- [x] repo/live function canon is aligned with that posture.

Result: `PASS`

---

## Section D — Security

- [x] `book_class_with_access` decision note exists.
- [x] live warning has accepted branch-proof evidence.
- [x] legacy payment trio no longer mutates live state as an active business contour.
- [x] app-target payment pair remains live and distinct.
- [ ] live warnings are fully remediated.

Live advisor truth:

- remaining warning: `book_class_with_access` as authenticated `SECURITY DEFINER` RPC

Result: `PARTIAL`

Reason: the remaining warning is accepted, not eliminated.

---

## Section E — Runtime Smoke

- [x] `https://ksebe-studio.ru/` returns `200 OK` in the current canon.
- [x] `https://artful-striker-476211-h4.web.app` returns `200 OK` in the current canon.
- [x] app-target payment contour is live.
- [x] legacy trio is retired in place.

Result: `PASS`

---

## Overall Verdict

Overall verdict: `PARTIAL`

Release-candidate state: `READY`

Production PASS state: `NOT YET`

Top remaining blocker:

1. **fresh same-ref release proof** after the final retirement-in-place sync.

Residual accepted item:

1. **`book_class_with_access`** remains an accepted narrow `SECURITY DEFINER`
   wrapper with branch-proof evidence.

One next step:

Re-run the full release gate on current `main` and current live state, including
fresh CI/local proof references after the legacy payment retirement sync.
