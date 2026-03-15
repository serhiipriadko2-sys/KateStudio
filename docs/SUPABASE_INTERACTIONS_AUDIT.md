# Supabase Interactions Audit (Static SoT)

> Updated: March 15, 2026  
> Scope: static repository audit of client/server Supabase interactions  
> Method: code + migrations only (no live DB introspection)

## Verdict

- `verdict`: `partial`
- `confidence`: 94%
- `summary`:
  - Main interaction map is largely correct.
  - Three important risks need explicit follow-up:
    1. `send-push` endpoint auth enforcement is not explicit in function code.
    2. `get_admin_analytics` RPC is executable by any `authenticated` role.
    3. Documentation drift (`push_tokens` vs `user_push_tokens`) remains.

## A) Client Initialization

- `shared/services/supabase.ts` is the single exported client entrypoint for WEB/APP:
  - env source: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - exported singleton: `supabase`
  - helper: `uploadFile()` with bucket auto-create fallback via `createBucket()`
- Evidence:
  - `shared/services/supabase.ts:12`
  - `shared/services/supabase.ts:13`
  - `shared/services/supabase.ts:29`
  - `shared/services/supabase.ts:35`
  - `shared/services/supabase.ts:52`

## B) Auth Flows (WEB vs APP)

### WEB (studio/admin boundary)

- Calls found:
  - `signInWithPassword`, `signUp`, `signOut`, `getSession`, `onAuthStateChange`
  - `signInWithOtp` (Magic Link) is in `AdminPanel`, not in `WEB AuthContext`
  - `updateUser` for password reset
  - `rpc('is_admin')` called from `WEB AuthContext`
- Evidence:
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:114`
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:128`
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:151`
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:179`
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:191`
  - `k-sebe-yoga-studioWEB/components/AdminPanel.tsx:81`
  - `k-sebe-yoga-studioWEB/components/ResetPasswordModal.tsx:45`
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:59`
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:78`

### APP (end-user boundary)

- Calls found:
  - `signUp` by email or phone
  - `verifyOtp` (SMS)
  - `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`
- Evidence:
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:103`
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:115`
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:176`
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:147`
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:207`
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:59`
  - `k-sebe-yoga-studio-APPp/context/AuthContext.tsx:65`

## C) RPC Calls

- RPCs used by client code:
  - `is_admin`
  - `process_practice_completion`
  - `get_admin_analytics`
- Evidence:
  - `k-sebe-yoga-studioWEB/context/AuthContext.tsx:59`
  - `shared/hooks/useIsAdmin.ts:48`
  - `shared/hooks/useGamification.ts:95`
  - `k-sebe-yoga-studio-APPp/services/gamificationService.ts:109`
  - `k-sebe-yoga-studioWEB/components/admin/tabs/AnalyticsTab.tsx:51`
  - `k-sebe-yoga-studioWEB/components/admin/tabs/DashboardTab.tsx:65`

### RPC Security Note (confirmed risk)

- `get_admin_analytics` currently grants execute to any `authenticated` role.
- Evidence:
  - `supabase/migrations/20260315000002_analytics_rpc.sql:81`
  - `supabase/migrations/20260315000002_analytics_rpc.sql:82`

## D) Edge Function Invocations (Client/Automation)

- Found direct `/functions/v1/...` calls via `fetch`:
  - `create-payment` (WEB + APP)
  - `cancel-subscription` (APP)
  - `cron-maintenance` (GitHub Action `cron.yml`)
- No `supabase.functions.invoke(...)` usage in client code.
- `gemini-proxy` is not wired in current chat UX (KB fallback path used).
- Evidence:
  - `k-sebe-yoga-studioWEB/services/subscriptionService.ts:7`
  - `k-sebe-yoga-studioWEB/services/subscriptionService.ts:38`
  - `k-sebe-yoga-studio-APPp/services/subscriptionService.ts:31`
  - `k-sebe-yoga-studio-APPp/services/subscriptionService.ts:63`
  - `.github/workflows/cron.yml:44`
  - `k-sebe-yoga-studioWEB/components/ChatWidget/useChatSession.ts:32`
  - `k-sebe-yoga-studioWEB/services/assistantService.ts:4`
  - `k-sebe-yoga-studio-APPp/services/geminiService.ts:33`

## E) Storage Operations

- Storage bucket path uses `images` bucket:
  - `shared/services/imageStorage.ts` reads/writes `site_images` mapping table
  - uploads go through `uploadFile()` from shared supabase service
- Migration confirms storage object policies use `public.is_admin()`
- Evidence:
  - `shared/services/imageStorage.ts:3`
  - `shared/services/imageStorage.ts:9`
  - `shared/services/imageStorage.ts:21`
  - `shared/services/imageStorage.ts:41`
  - `supabase/migrations/20260308000002_secure_storage.sql:19`
  - `supabase/migrations/20260308000002_secure_storage.sql:23`
  - `supabase/migrations/20260308000002_secure_storage.sql:27`

## F) Table Interaction Matrix (from code)

- `profiles`: WEB auth context + APP data service (`select/upsert/update`)
- `bookings`: WEB admin/user + APP data service (`select/insert/update/delete`)
- `subscriptions`: WEB/APP services + WEB admin tab + Edge Functions
- `contacts`: WEB/APP contact forms (`insert`), WEB admin tab (`select/update/delete`)
- `classes`: WEB schedule/admin + APP data service (`select/CRUD`)
- `analytics_events`: `shared/services/analytics.ts` (`insert`) + cron cleanup
- `user_achievements`: APP gamification (`select/insert`)
- `user_progress`: shared hook / APP service (`select/insert`) + RPC update path
- `user_push_tokens`: shared push hook (`upsert/delete`) + `send-push` function reads
- `app_settings`: WEB admin settings tab (`select/upsert`)
- `site_images`: shared image mapping (`select/upsert/delete`)
- `articles`: WEB blog/admin (`select/CRUD`)
- `reviews`: WEB reviews/admin (`select/CRUD`)
- `pricing_plans`: WEB pricing/admin (`select/CRUD`)
- `retreats`: WEB retreats/admin (`select/CRUD`)
- `faq_items`: WEB FAQ/admin (`select/CRUD`)
- `videos`: APP video service + WEB admin video tab (`select/CRUD`)
- `practice_events`: APP retention + gamification (`upsert/select`)
- `app_events`: APP retention (`insert`)
- `user_preferences`: APP retention onboarding (`upsert/select`)
- `admins`: used indirectly via `is_admin()` and RLS policies
- Evidence sample:
  - `k-sebe-yoga-studioWEB/components/admin/tabs/UsersTab.tsx:100`
  - `k-sebe-yoga-studioWEB/components/Contact.tsx:19`
  - `k-sebe-yoga-studio-APPp/components/Contact.tsx:66`
  - `k-sebe-yoga-studio-APPp/services/dataService.ts:150`
  - `k-sebe-yoga-studio-APPp/services/retentionService.ts:70`
  - `shared/hooks/usePushNotifications.ts:75`

## G) RLS / Migration Inventory Facts

- SQL migrations in repo: `35`
- Excluding checklist file: `34`
- Duplicate timestamps found:
  - `20260216000000` (2 files)
  - `20260308000000` (4 files)
- `contacts` anonymous insert policy is explicitly open (`with check (true)`).
- Evidence:
  - `supabase/migrations/20260101000000_schema_baseline.sql:16`
  - `supabase/migrations/20260101000000_schema_baseline.sql:17`

## H) Confirmed Drift

1. Docs still use `push_tokens`, code/schema uses `user_push_tokens`.
- Evidence:
  - `supabase/migrations/20260309000000_push_tokens.sql:4`
  - `docs/EDGE_FUNCTIONS.md:216`
  - `docs/ARCHITECTURE.md:158`
  - `docs/LAUNCH_CHECKLIST.md:15`

2. `subscribe-newsletter` exists server-side but no client invocation found.
- Evidence:
  - `supabase/functions/subscribe-newsletter/index.ts:1`
  - no `/functions/v1/subscribe-newsletter` usage in WEB/APP code

3. `send-push` function comment implies auth header contract, but explicit runtime check is absent in function code.
- Evidence:
  - `supabase/functions/send-push/index.ts:20`
  - `supabase/functions/send-push/index.ts:149`

## I) Fix Plan (Top 3)

### FP-1: Harden `send-push` inbound auth

- Problem:
  - No explicit request authentication check inside function handler.
- Minimal safe option:
  - Add required secret check (e.g. `PUSH_INTERNAL_SECRET`) against `Authorization: Bearer ...` or dedicated header.
  - Keep `SUPABASE_SERVICE_ROLE_KEY` for DB access only.
- Verify:
  - call without secret -> `401`
  - call with wrong secret -> `401`
  - call with correct secret -> normal behavior

### FP-2: Gate `get_admin_analytics` in RPC body

- Problem:
  - Function executable by all `authenticated`.
- Minimal safe option:
  - Replace SQL body with PL/pgSQL and hard-check `public.is_admin()`:
    - if false -> raise `42501` (forbidden)
- Verify:
  - non-admin authenticated token gets error
  - admin token gets valid aggregate payload

### FP-3: Remove docs drift for push tokens and interaction map

- Problem:
  - mixed naming (`push_tokens` vs `user_push_tokens`) and stale descriptions.
- Minimal safe option:
  - Update docs:
    - `docs/EDGE_FUNCTIONS.md`
    - `docs/ARCHITECTURE.md`
    - `docs/LAUNCH_CHECKLIST.md`
  - Align edge invocation section with actual client wiring.
- Verify:
  - `rg -n "push_tokens"` in docs returns only intentional historical mentions
  - `rg -n "user_push_tokens"` matches active architecture/security docs

## J) Status Matrix

| Domain | Status |
| --- | --- |
| Client init surface | `verified` |
| Auth boundaries WEB vs APP | `verified` |
| Table interaction coverage | `verified` |
| Edge invocation map | `verified` |
| RLS baseline presence | `verified` |
| Migration ordering integrity | `partial` |
| RPC security model | `partial` |
| `send-push` endpoint auth certainty | `unknown` |
| AI integration wiring (`gemini-proxy`) | `verified` (currently not wired) |
| Newsletter client integration | `partial` (server ready, client missing) |
| Docs consistency | `partial` |

---

If needed, this file can be used as the canonical input for a follow-up remediation PR:
- `fix(send-push-auth): enforce inbound secret`
- `fix(rpc-security): hard gate get_admin_analytics by is_admin()`
- `docs(sync): align push token naming and edge invocation docs`
