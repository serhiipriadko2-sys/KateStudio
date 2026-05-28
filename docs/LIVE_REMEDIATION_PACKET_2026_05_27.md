# Live Remediation Packet | KateStudio | 2026-05-27

> Mode: PRODUCTION-REMEDIATION
> Project: `qkaycdcbstjobacmuaro`
> Boundary: live mutations were executed with receipts; current packet reflects the post-retirement canon.

---

## Scope

This packet now tracks only:

1. post-retirement verification;
2. advisors / CI / runtime smoke after the above.

`book_class_with_access` is no longer an open remediation item in this packet.
The current canon accepts it as a narrow `SECURITY DEFINER` wrapper with
preserved APP contract and branch-proof evidence.

`20260518205158_create_dataset_runs_and_artifacts` is no longer an open item in
this packet. Its status in the current canon is **accepted forward reconciliation**.

Legacy payment trio is no longer an open retirement item in this packet. It is
now retired in place in live and synced in repo canon.

Reference planning artifacts:

- `docs/BOOK_CLASS_WITH_ACCESS_BRANCH_PROOF_PLAN_2026_05_28.md`
- `docs/LEGACY_PAYMENT_RETIREMENT_PLAN_2026_05_28.md`

---

## Step 1 - `book_class_with_access`

Status: `ACCEPTED NARROW SECURITY DEFINER WRAPPER`

Accepted evidence:

- Live security advisors still flag
  `authenticated_security_definer_function_executable`.
- APP calls `public.book_class_with_access` from
  `k-sebe-yoga-studio-APPp/services/dataService.ts`.
- Directly revoking `authenticated` execute would break APP booking.
- Directly changing the function to `SECURITY INVOKER` is not a safe narrow fix:
  the RPC decrements `public.user_passes`, while authenticated users currently
  do not have a matching direct update-oriented pass surface.
- Branch proof accepted a narrow wrapper posture without changing APP contract.
- Branch scenario matrix confirmed:
  - valid active pass -> booking created and visit decremented;
  - duplicate booking -> expected failure;
  - no visits left -> expected failure;
  - no pass -> expected failure.
- Branch proof also confirmed canonical class data persistence from
  `public.classes`, rather than trusting tampered client-supplied metadata.

Accepted interpretation:

- The function remains a consciously narrow server-side wrapper for self-service
  booking.
- The advisor warning remains policy-level, not behavior-level, under the
  current accepted release canon.

---

## Step 2 - `20260518205158` Migration Reconciliation

Status: `ACCEPTED FORWARD RECONCILIATION`

Accepted artifact:

- `supabase/migrations/20260527174716_reconcile_dataset_runs_artifacts_forward.sql`

Accepted meaning:

- fresh/staging environments have a Git-tracked additive path for
  `public.dataset_runs` and `public.dataset_artifacts`;
- the project does **not** pretend to know the exact historical SQL text of the
  original live-applied `20260518205158` migration;
- this delta is no longer treated as an open release blocker by itself.

---

## Step 3 - Legacy Payment References

Status: `RETIRED IN PLACE`

Current live/resulting canon:

- `cancel-subscription` -> controlled retirement stub
- `create-payment` -> controlled retirement stub
- `payment-webhook` -> controlled retirement stub
- app-target pair remains active:
  - `create-yookassa-checkout`
  - `yookassa-webhook`

Meaning:

- new legacy payments are no longer created;
- legacy completion path no longer mutates subscription/payment state;
- hidden remaining callers, if any, now surface as controlled retirement responses instead of silent state changes.

---

## Step 4 - Final Verification Required

Before production PASS:

1. security advisors:
   - `book_class_with_access` warning is either consciously accepted with branch-proof evidence or superseded by a later narrower design with equivalent evidence.
2. migration integrity:
   - `npm run check:migrations`;
3. repo health:
   - `npm run lint`;
   - `npm run typecheck`;
   - `npm run test:run`;
   - `npm run build:web`;
   - `npm run build:app`;
4. GitHub Actions on pushed `main`;
5. runtime smoke:
   - `https://ksebe-studio.ru/`;
   - `https://artful-striker-476211-h4.web.app/`.

---

## Current Verdict

Full production PASS is not yet honest until:

- a fresh same-ref release gate is attached to the post-retirement canon;
- final runtime and CI verification are attached to the accepted late-May baseline.
