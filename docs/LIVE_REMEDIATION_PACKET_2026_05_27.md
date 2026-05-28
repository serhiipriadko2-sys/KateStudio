# Live Remediation Packet | KateStudio | 2026-05-27

> Mode: PRODUCTION-REMEDIATION
> Project: `qkaycdcbstjobacmuaro`
> Current repo HEAD at preparation time: `dbd8f2b24d2f90fafbc996c3483b020c836aedd7`
> Boundary: no hidden Supabase production mutation; every live change needs a receipt.

---

## Scope

This packet tracks the remaining live remediation path for:

1. `book_class_with_access` security-definer warning;
2. legacy payment contour retirement;
3. advisors / CI / runtime smoke after the above.

`20260518205158_create_dataset_runs_and_artifacts` is no longer an open item in
this packet. Its status in the current canon is **accepted forward reconciliation**.

Reference planning artifacts:

- `docs/BOOK_CLASS_WITH_ACCESS_BRANCH_PROOF_PLAN_2026_05_28.md`
- `docs/LEGACY_PAYMENT_RETIREMENT_PLAN_2026_05_28.md`

---

## Step 1 - `book_class_with_access`

Status: `BRANCH/STAGING PROOF REQUIRED`

Current evidence:

- Live security advisors still flag
  `authenticated_security_definer_function_executable`.
- APP calls `public.book_class_with_access` from
  `k-sebe-yoga-studio-APPp/services/dataService.ts`.
- Directly revoking `authenticated` execute would break APP booking.
- Directly changing the function to `SECURITY INVOKER` is not a safe blind fix:
  the RPC decrements `public.user_passes`, while authenticated users currently
  have a read-oriented pass surface.

Required proof before live DB change:

1. Create a Supabase branch or staging project.
2. Apply a candidate implementation there.
3. Verify booking cases:
   - valid active pass -> booking created and visit decremented;
   - no pass -> expected failure;
   - expired pass -> expected failure;
   - no visits left -> expected failure;
   - duplicate booking -> expected failure;
   - class full -> expected failure.
4. Re-run security advisors on the branch/staging target.

Current blocker:

- Branch creation cost must be checked and accepted first.
- MCP cost check failed in the earlier Codex pass because Supabase MCP handshake timed out.
- No branch was created in that pass.

Recommended remediation design:

- Move privileged booking/decrement orchestration behind an authenticated Edge Function or a private helper that is not directly executable from public RPC.
- Keep the APP client contract stable until branch proof passes.

Execution note:

- Use `docs/BOOK_CLASS_WITH_ACCESS_BRANCH_PROOF_PLAN_2026_05_28.md` as the canonical proof matrix before any live remediation pass.

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

Verification basis:

- live migration ledger contains `20260518205158_create_dataset_runs_and_artifacts`;
- live schema contains `dataset_runs` and `dataset_artifacts` with the expected
  core table shape, PK/FK relation, and RLS enabled;
- the forward reconciliation artifact covers that core shape additively.

Residual note:

- exact historical origin, comments, policy text, and index-level parity remain
  long-term hygiene work, not current release gating.

---

## Step 3 - Legacy Payment References

Status: `STALE WEB CLIENT REFERENCES REMOVED; LIVE FUNCTIONS NOT RETIRED`

Removed stale files:

- `k-sebe-yoga-studioWEB/services/subscriptionService.ts`
- `k-sebe-yoga-studioWEB/components/SubscriptionProfile.tsx`

Reason:

- The deleted WEB service was the remaining repo-side client path to
  `create-payment`.
- `SubscriptionProfile` was not mounted by the active WEB app.

Live retirement still pending:

- `create-payment`
- `payment-webhook`
- `cancel-subscription`

Required before deleting live functions:

- one final function inventory;
- one final repo search;
- recent function-log check if available;
- APP YooKassa checkout smoke after each staged removal.

Execution note:

- Use `docs/LEGACY_PAYMENT_RETIREMENT_PLAN_2026_05_28.md` as the canonical staged retirement sequence.

---

## Step 4 - Final Verification Required

Before production PASS:

1. security advisors:
   - `book_class_with_access` warning gone after staged remediation, or branch proof / accepted-risk evidence attached before live change.
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

- `book_class_with_access` has branch/staging proof and live remediation, or a consciously accepted release-time exception;
- legacy payment functions are retired in staged order or explicitly kept as an accepted transition window after stale repo callers are gone.
