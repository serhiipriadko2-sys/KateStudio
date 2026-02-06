# Launch Checklist & Gap Analysis

**Status:** Draft / Analysis Phase
**Date:** Jan 2026

## 1. Schema Gap (Tables used in code vs. Migrations)

The following tables are referenced in the codebase but are missing proper `CREATE TABLE` statements in the `supabase/migrations/` folder. The current migrations only `ALTER` some of them or assume they exist.

| Table | Status | Code Usage References | Migration Status |
| :--- | :--- | :--- | :--- |
| **`contacts`** | 🔴 **Missing** | `k-sebe-yoga-studioWEB/components/Contact.tsx`<br>`k-sebe-yoga-studio-APPp/components/Contact.tsx` | No migration found. |
| **`classes`** | 🔴 **Missing** | `k-sebe-yoga-studioWEB/components/Schedule.tsx` | No migration found. |
| **`bookings`** | 🟠 **Partial** | `k-sebe-yoga-studioWEB/components/BookingModal.tsx`<br>`k-sebe-yoga-studio-APPp/services/dataService.ts` | `20251227160000...sql` attempts to `ALTER` it, but no `CREATE`. |
| **`profiles`** | 🟠 **Partial** | `k-sebe-yoga-studio-APPp/services/dataService.ts` | `20251227160000...sql` attempts to `ALTER` it, but no `CREATE`. |
| **`booking_requests`** | ⚪️ **Suggested** | Not yet used, but recommended for guest booking flow. | N/A |

**Action Item:** Create a consolidated migration (e.g., `20260101000000_schema_baseline.sql`) that safely creates these tables if they don't exist.

## 2. Security Blockers (P0)

| Component | Issue | Remediation |
| :--- | :--- | :--- |
| **Edge Function: `payment-webhook`** | **Optional Secret:** The code checks `if (secret) { ... }`, meaning if `PAYMENT_WEBHOOK_SECRET` is unset, the endpoint accepts *any* request. | Enforce secret presence. Return 500/401 if missing. |
| **Edge Function: `create-payment`** | **Anon Fallback:** `getSupabaseClient` falls back to `anonKey` if `serviceRoleKey` is missing. | Remove fallback. Fail hard if service role is missing for backend ops. |
| **All Edge Functions** | **CORS `*`:** Allows any origin. | Restrict to `https://ksebe-studio.ru`, `app.ksebe-studio.ru` (and localhost for dev). |
| **RLS: `subscriptions`** | **Unsafe Update:** Previous analysis suggests users can update their own subscription status. | Verify and remove `update` policy for authenticated users. Only Service Role should update status. |

## 3. Content & Assets (P1)

| Asset Type | Issue | Location/Count |
| :--- | :--- | :--- |
| **Unsplash Placeholders** | Hardcoded Unsplash URLs found in UI components. | `k-sebe-yoga-studio-APPp/App.tsx`<br>`k-sebe-yoga-studio-APPp/components/Blog.tsx`<br>`k-sebe-yoga-studio-APPp/components/Reviews.tsx`<br>`k-sebe-yoga-studio-APPp/components/VideoLibrary.tsx`<br>`k-sebe-yoga-studio-APPp/components/Dashboard.tsx`<br>`k-sebe-yoga-studio-APPp/components/Retreats.tsx` |

## 4. Deployment & Infrastructure

*   **Firebase Deploy:** Workflow likely needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` injected.
*   **Web 404:** Ensure `public/404.html` handles client-side routing correctly for `ksebe-studio.ru`.

## 5. Next Steps (Immediate)

1.  **Fix Schema:** Generate missing migrations.
2.  **Lock down Functions:** Update `payment-webhook` and `create-payment`.
3.  **Local "KB":** Create `shared/constants/kb.ts` or similar for the non-AI assistant.
