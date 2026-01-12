# Production Transition Roadmap

This document outlines the remaining tasks required to bring the K Sebe Yoga
Studio ecosystem to full production readiness.

## 🔴 Critical Path (Must Do)

### 1. Payment System Integration

- **Current Status**: `supabase/functions/create-payment` exists but is a
  **Mock**. It generates a URL based on the `PAYMENT_CHECKOUT_URL` environment
  variable but does not interface with a provider API directly.
- **Task**: Implement real payment processing.
  - **Option A (Custom Checkout)**: Integrate Stripe/YooKassa Node.js SDK inside
    the Edge Function to create a checkout session and return the `session.url`.
  - **Option B (Payment Link)**: Ensure `PAYMENT_CHECKOUT_URL` points to a valid
    external payment gateway (e.g., Tilda/CloudPayments) capable of handling
    `subscription_id` and `plan` query parameters.
- **Verification**: Perform a real transaction in a sandbox environment.

### 2. Test Coverage

- **Current Status**: ~23% Coverage.
- **Goal**: 80%+ (Long term: 100%).
- **Action Items**:
  - Write unit tests for `k-sebe-yoga-studioWEB/components` (Landing page
    sections).
  - Write integration tests for the `BookingModal` flow.
  - Add E2E tests (Playwright) for the User Onboarding flow in the App.

### 3. Asset Optimization

- **Current Status**: `raw_assets/` contains unoptimized images.
- **Task**:
  - Audit `raw_assets/` and move necessary files to `public/images/` in the
    respective projects.
  - Convert heavy JPEGs/PNGs to WebP.
  - Ensure all `Image` components use correct paths.

## 🟡 Feature Completion

### 1. Subscription & AI Features

- **Status**: `SubscriptionProfile` and `Retreats` components are commented out
  in `k-sebe-yoga-studioWEB/App.tsx`.
- **Task**: Uncomment and wire up these components once the backend subscription
  logic is verified.
- **AI Coach**: Verify `gemini-proxy` Edge Function connects correctly to the AI
  provider.

### 2. PWA Configuration

- **Task**: Verify `manifest.json` and service worker registration in
  `k-sebe-yoga-studio-APPp`.
- **Goal**: Ensure "Add to Home Screen" prompt works reliably on iOS and
  Android.

## 🟢 Housekeeping & Infrastructure

### 1. CI/CD Pipeline

- **Task**: Setup GitHub Actions to:
  - Run `npm run lint` and `npm run test` on PRs.
  - Deploy `dist/` folders to hosting (Vercel/Netlify/Firebase) on merge to
    main.

### 2. Monitoring

- **Task**: Integrate Sentry for frontend error tracking.

## 📝 Known Issues

- `Logo` test required a fix (Completed).
- Linting warnings (260+) related to import sorting (Low priority, but should be
  fixed for clean code).
