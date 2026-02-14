# Security Findings Report (2026-02-11)

## Summary

The critical P0 security blockers identified in `CURRENT_TASKS.md` (Payment
Webhook Secret, RLS Policies, CORS Policies, API Key Fallback) have been largely
resolved in the actual codebase.

## Details

### 1. Payment Webhook Secret (Resolved)

- **Status:** **Secure**.
- **File:** `supabase/functions/payment-webhook/index.ts`
- **Verification:** The code checks for `PAYMENT_WEBHOOK_SECRET` presence and
  returns a 500 error if missing. There is no fallback to a hardcoded string. It
  also verifies the HMAC signature correctly.

### 2. Service Role Key Usage (Resolved)

- **Status:** **Secure**.
- **File:** `supabase/functions/create-payment/index.ts`
- **Verification:** The `getSupabaseClient` function strictly requires
  `SUPABASE_SERVICE_ROLE_KEY`. If missing, it throws an error. It explicitly
  creates the client with `persistSession: false` and `autoRefreshToken: false`.

### 3. RLS Policies (Resolved)

- **Status:** **Secure**.
- **Migration:** `supabase/migrations/20260211000000_secure_subscriptions.sql`
- **Verification:** The insecure `subscriptions_update_own` and
  `subscriptions_insert_own` policies have been dropped. Users can no longer
  modify their subscription status directly; only the Service Role (via Edge
  Functions) can do so.

### 4. CORS Policies (Resolved)

- **Status:** **Secure**.
- **Files:** `supabase/functions/payment-webhook/index.ts`,
  `supabase/functions/create-payment/index.ts`
- **Verification:** Both functions implement a strict `allowedOrigins` check
  against `ksebe-studio.ru`, `app.ksebe-studio.ru` (and localhost for dev). They
  do not use wildcard `*`.

### 5. API Key Fallback (Partially Resolved / Risk)

- **Status:** **Secure for Prod / Warning for Dev**.
- **File:** `k-sebe-yoga-studio-APPp/vite.config.ts`
- **Observation:** In development mode (`isDev === true`), `VITE_GEMINI_API_KEY`
  (or `GEMINI_API_KEY`) is injected into `process.env`.
- **Recommendation:** Since AI features are explicitly disabled/commented out
  for the MVP, this entire block should be removed or commented out to prevent
  accidental leakage if someone runs a dev build and deploys it improperly, or
  if the key is committed to the repo.

## Action Items

1. Remove the Gemini API key injection block from
   `k-sebe-yoga-studio-APPp/vite.config.ts` to fully mitigate the risk, aligning
   with the "AI disabled" strategy.
2. Update `CURRENT_TASKS.md` to reflect the resolved status of these items.
