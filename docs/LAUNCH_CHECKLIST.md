# Launch Checklist & Gap Analysis

**Status:** In Progress | **Updated:** 27 февраля 2026

## 1. Schema Gap (Tables used in code vs. Migrations)

The following tables are referenced in the codebase but are missing proper
`CREATE TABLE` statements in the `supabase/migrations/` folder. The current
migrations only `ALTER` some of them or assume they exist.

| Table                  | Status           | Code Usage References                                                                                    | Migration Status                                                |
| :--------------------- | :--------------- | :------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **`contacts`**         | 🔴 **Missing**   | `k-sebe-yoga-studioWEB/components/Contact.tsx`<br>`k-sebe-yoga-studio-APPp/components/Contact.tsx`       | No migration found.                                             |
| **`classes`**          | 🔴 **Missing**   | `k-sebe-yoga-studioWEB/components/Schedule.tsx`                                                          | No migration found.                                             |
| **`bookings`**         | 🟠 **Partial**   | `k-sebe-yoga-studioWEB/components/BookingModal.tsx`<br>`k-sebe-yoga-studio-APPp/services/dataService.ts` | `20251227160000...sql` attempts to `ALTER` it, but no `CREATE`. |
| **`profiles`**         | 🟠 **Partial**   | `k-sebe-yoga-studio-APPp/services/dataService.ts`                                                        | `20251227160000...sql` attempts to `ALTER` it, but no `CREATE`. |
| **`booking_requests`** | ⚪️ **Suggested** | Not yet used, but recommended for guest booking flow.                                                    | N/A                                                             |

**Action Item:** Create a consolidated migration (e.g.,
`20260101000000_schema_baseline.sql`) that safely creates these tables if they
don't exist.

## 2. Security Blockers (P0)

All P0 security blockers are **resolved** as of February 2026. See
[Security Report](./SECURITY_REPORT_2026_02_11.md) for details.

| Component                            | Issue                                      | Status                                                                              |
| :----------------------------------- | :----------------------------------------- | :---------------------------------------------------------------------------------- |
| **Edge Function: `payment-webhook`** | Webhook secret was optional                | ✅ **Resolved** — HMAC verification, 401 if secret missing                          |
| **Edge Function: `create-payment`**  | Anon fallback if serviceRoleKey missing    | ✅ **Resolved** — Fails hard without Service Role Key                               |
| **All Edge Functions**               | CORS `*` allowed any origin                | ✅ **Resolved** — Restricted to `ksebe-studio.ru`, `app.ksebe-studio.ru`, localhost |
| **RLS: `subscriptions`**             | Users could update own subscription status | ✅ **Resolved** — Update policy removed, Service Role only                          |
| **Gemini API key in client**         | `VITE_GEMINI_API_KEY` fallback in browser  | ✅ **Resolved** — All AI calls via Edge Function proxy                              |

**Security Score:** 85/100 (was 55)

## 3. Content & Assets (P1)

| Asset Type             | Issue                            | Location                                                                                                                                                          | Status                     |
| :--------------------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------- |
| **Unsplash in APP**    | Hardcoded Unsplash URLs          | `APP/components/Blog.tsx`<br>`APP/components/Reviews.tsx`<br>`APP/components/VideoLibrary.tsx`<br>`APP/components/Dashboard.tsx`<br>`APP/components/Retreats.tsx` | 🔄 In Progress             |
| **WEB Images**         | Were using Unsplash placeholders | `shared/constants/images.ts`                                                                                                                                      | ✅ Resolved — local assets |
| **Placeholder Videos** | 4 placeholder video URLs in APP  | `APP/components/VideoLibrary.tsx`                                                                                                                                 | ⏳ Pending                 |

## 4. Deployment & Infrastructure

| Item                     | Status | Notes                                                               |
| :----------------------- | :----- | :------------------------------------------------------------------ |
| `.env` files             | ⏳     | Create from `.env.example` for local dev; inject in CI              |
| GitHub Secrets           | ⏳     | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, Firebase credentials |
| Firebase deploy workflow | ⏳     | Needs env vars injected in `firebase-deploy.yml`                    |
| Web 404 handling         | ✅     | `public/404.html` handles client-side routing for `ksebe-studio.ru` |
| Capacitor mobile build   | ✅     | `npm run build:mobile` (Android), `npm run build:mobile:ios` (iOS)  |
| CI (lint/typecheck/test) | ✅     | All green: 0 errors, 208/208 tests pass                             |

## 5. Native / Mobile

| Item                     | Status | Notes                                                        |
| :----------------------- | :----- | :----------------------------------------------------------- |
| Capacitor scaffold       | ✅     | `native/`, `capacitor.config.ts`, all plugins wired up       |
| Platform CSS classes     | ✅     | `is-ios`, `is-android`, `is-native` set via `initNative()`   |
| Safe area insets         | ✅     | `.pt-safe`, `.pb-safe` etc. defined in `index.css`           |
| StatusBar / SplashScreen | ✅     | Brand green StatusBar, fade-out SplashScreen                 |
| Haptic feedback          | ✅     | App.tsx nav + BookingModal (submit, success, error)          |
| Android back button      | ✅     | Minimize app if no history (default Capacitor behaviour)     |
| Android Studio project   | ⏳     | `npm run cap:add:android` → generated locally, not committed |
| Xcode project            | ⏳     | `npm run cap:add:ios` → requires macOS + CocoaPods           |

## 6. Next Steps (Priority Order)

1. **[P0]** Create `.env` files and configure GitHub Secrets
2. **[P1]** Generate missing DB migrations (`contacts`, `classes`)
3. **[P1]** Add Zod input validation to Edge Functions
4. **[P1]** Complete YooKassa payment integration
5. **[P1]** Replace APP placeholder images and videos
6. **[P2]** Sentry logging and monitoring
7. **[P2]** Push notifications (Firebase Cloud Messaging)
8. **[P3]** Performance optimization (Lighthouse 90+)
