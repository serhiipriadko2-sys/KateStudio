# Supabase Integration Audit Report

**Date:** 2026-02-15 **Scope:** k-sebe-yoga-studioWEB (Site) <-> Supabase

## 1. Executive Summary

The integration between the website and Supabase is generally healthy regarding
configuration and read operations. However, a **critical blocker** exists in the
Admin Panel: Write operations (Create/Update/Delete classes & contacts) will
fail in production due to restrictive Row Level Security (RLS) policies.

## 2. Component Analysis

### A. Client Configuration

- **Status:** ✅ Secure
- **Details:**
  - `k-sebe-yoga-studioWEB/services/supabaseConfig.ts` enforces strict
    environment variable checks (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - `AdminPanel` and other components gracefully handle missing configuration by
    disabling features rather than crashing.
  - **Note:** The `shared` workspace uses a "Safe Initialization" pattern with
    placeholders. While this prevents build crashes, it requires consumers to
    verify configuration before making requests.

### B. Edge Functions (Payments)

- **Status:** ✅ Secure
- **Details:**
  - **`create-payment`**:
    - Correctly verifies User Authentication.
    - Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for subscription updates.
    - Implements strict CORS (allowed: `ksebe-studio.ru`,
      `app.ksebe-studio.ru`).
  - **`payment-webhook`**:
    - Verifies HMAC signature using `PAYMENT_WEBHOOK_SECRET`.
    - Updates subscription status securely.

### C. Database Interactions (Reads)

- **Status:** ✅ Functional
- **Details:**
  - Public read access is enabled for `classes` and `contacts` tables via RLS
    policies in `20260101000000_schema_baseline.sql`.
  - The website can successfully fetch schedules and contact info.

### D. Database Interactions (Writes - Admin Panel)

- **Status:** ❌ **Critical Failure**
- **Details:**
  - **Code:** `AdminPanel.tsx` attempts to direct client-side writes
    (INSERT/UPDATE/DELETE) to `classes` and `contacts`.
  - **Policy:** Current RLS policies (`Enable write access for service role`)
    restrict ALL write operations to the `service_role`.
  - **Impact:** Admin users, even if authenticated, cannot manage classes or
    contacts. All attempts will return **401 Unauthorized**.

## 3. Recommendations

### Immediate Fix (Critical)

**Issue:** Admin Panel Write Access **Solution:**

1.  **Option A (RLS - Recommended for speed):** Update RLS policies to allow
    write access for specific authenticated users (e.g., via a whitelist or
    `is_admin` flag in `public.profiles`).
2.  **Option B (Edge Functions - Recommended for security):** Move admin logic
    to Edge Functions (`admin-create-class`, etc.) that verify permissions and
    use the Service Role.

### Maintenance

- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in
  the production environment (GitHub Secrets / Vercel / Netlify).
