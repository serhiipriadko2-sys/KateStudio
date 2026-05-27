# Live Remediation Packet | KateStudio | 2026-05-27

> Mode: PRODUCTION-REMEDIATION
> Project: `qkaycdcbstjobacmuaro`
> Current repo HEAD at preparation time: `dbd8f2b24d2f90fafbc996c3483b020c836aedd7`
> Boundary: no hidden Supabase production mutation; every live change needs a receipt.

---

## Scope

This packet replaces accepted-risk release posture with a remediation track for:

1. leaked password protection;
2. `book_class_with_access` security-definer warning;
3. live-only migration `20260518205158_create_dataset_runs_and_artifacts`;
4. legacy payment contour retirement;
5. advisors / CI / runtime smoke after the above.

---

## Step 1 - Leaked Password Protection

Status: `BLOCKED ON LIVE CONFIG ACTION`

Facts:

- Supabase docs state leaked password protection is available on Pro Plan and
  above.
- The owner supplied billing evidence showing the organization is on Pro Plan.
- The Management API supports `PATCH /v1/projects/{ref}/config/auth` with
  `password_hibp_enabled`.

Current blocker:

- This Codex runtime does not have `SUPABASE_ACCESS_TOKEN` in the environment.
- Supabase MCP is configured, but this session still times out during MCP
  handshake.
- `supabase config push` exists, but pushing the minimal local `config.toml`
  would be unsafe because the repo config is not a full live Auth config.

Safe enablement options:

1. Owner enables leaked password protection in Dashboard:
   Authentication -> Sign In / Providers -> Email -> Password security.
2. Owner provides a scoped management-token path through environment variable,
   not chat text, and the agent patches only `password_hibp_enabled: true`.

Verification:

- Re-run `npx supabase db advisors --linked --type security --output json`.
- Confirm `auth_leaked_password_protection` disappears.
- Smoke password signup, sign-in, and reset/change-password flows.

Rollback:

- Disable the setting in Auth settings if user-facing password flow breaks in a
  way the current UI cannot explain.

---

## Step 2 - `book_class_with_access`

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
- MCP cost check failed in this Codex session because Supabase MCP handshake
  timed out.
- No branch was created in this pass.

Recommended remediation design:

- Move privileged booking/decrement orchestration behind an authenticated Edge
  Function or a private helper that is not directly executable from public RPC.
- Keep the APP client contract stable until branch proof passes.

---

## Step 3 - `20260518205158` Migration Reconciliation

Status: `REPO-SIDE FORWARD RECONCILIATION PREPARED`

Added artifact:

- `supabase/migrations/20260527174716_reconcile_dataset_runs_artifacts_forward.sql`

Purpose:

- make fresh/staging environments aware of `public.dataset_runs` and
  `public.dataset_artifacts`;
- avoid rewriting the historical live timestamp;
- keep these tables non-product-facing until ownership is defined.

Verification:

- `npm run check:migrations` -> PASS with `67 files, 0 known collision group(s),
  1 legacy short timestamp file(s)`.

---

## Step 4 - Legacy Payment References

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

---

## Step 5 - Final Verification Required

Before production PASS:

1. security advisors:
   - `auth_leaked_password_protection` gone, or dashboard/API blocker recorded;
   - `book_class_with_access` warning gone after staged remediation, or branch
     proof attached before live change.
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

Remediation has started, but full production PASS is not yet honest until:

- leaked password protection is actually enabled and verified;
- `book_class_with_access` has branch/staging proof and live remediation;
- legacy payment functions are retired in staged order or explicitly kept as an
  accepted transition window after stale repo callers are gone.
