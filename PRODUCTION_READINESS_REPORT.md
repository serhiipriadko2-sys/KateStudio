# Production Readiness Report

## Status Overview
**Application:** K Sebe Yoga Studio Ecosystem
**Domain:** `ksebe-studio.ru` (Verified)
**Date:** 2026-01-11

## 1. Environment Configuration
**Critical Action Required:** The following environment variables must be set in the production environment (e.g., Vercel, Supabase Edge Functions).

### Frontend (.env / Vercel)
- `VITE_SUPABASE_URL`: (Required) URL of your Supabase project.
- `VITE_SUPABASE_ANON_KEY`: (Required) Anonymous public key for Supabase.

### Backend (Supabase Edge Functions)
- `PAYMENT_CHECKOUT_URL`: (Required) The URL endpoint of your payment provider (e.g., YooKassa checkout generation).
- `SUPABASE_URL`: (Auto-set in Supabase)
- `SUPABASE_SERVICE_ROLE_KEY`: (Auto-set in Supabase)

## 2. Asset Management
- **Images:** All critical images (Hero, About, Directions, Gallery) have been migrated from raw assets to the project structure.
- **Placeholders:** Unsplash placeholders have been replaced with local assets where possible.
- **Optimization:** Images are served from `public/images/`. Ensure your build process includes these files (Vite does this by default).

## 3. Payment Integration
- **Flow:**
  1. Client calls `subscriptionService.createPayment`.
  2. Edge Function `create-payment` constructs a payment URL.
  3. Client redirects user to this URL.
- **Provider:** The current implementation is provider-agnostic but requires `PAYMENT_CHECKOUT_URL`.
- **Next Step:** Implement or configure the actual payment gateway (YooKassa) and set the `PAYMENT_CHECKOUT_URL` to point to it (or to a middleware that handles the YooKassa API request).

## 4. Remaining Tasks for Production
1.  **Set Environment Variables:** Configure the variables listed above in your hosting platform.
2.  **Payment Gateway:** Finalize the contract with YooKassa and update the `create-payment` function if a direct API call is preferred over a redirect URL construction.
3.  **Content Review:** Review the blog articles and testimonials. Currently, testimonials use generic images (Unsplash) as no specific photos were provided in `raw_assets`.
4.  **Analytics:** Ensure Google Analytics or Yandex Metrica ID is configured if needed (currently not hardcoded).

## 5. Deployment
- **Web:** `npm run build:web` -> `dist/`
- **App:** `npm run build:app` -> `dist/`
- **Deploy Command:** `vercel deploy` (or similar)

## 6. Verification
- Run `npm run test:run` before every deploy.
- Check `SUPABASE_URL` connectivity.
