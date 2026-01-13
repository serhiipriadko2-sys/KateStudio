# K Sebe Yoga Studio Ecosystem

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Tests](https://img.shields.io/badge/tests-139%20passed-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue.svg)

**"К себе" (To Yourself)** is a comprehensive digital ecosystem for the K Sebe Yoga Studio (Dubna, Russia), featuring a web platform and a mobile PWA.

## 🚀 Project Status: Production Ready (Pending Content)

The project has undergone a complete audit (Jan 2026). It is technically stable and buildable.
See **[PRODUCTION_READINESS_AUDIT_2026.md](./PRODUCTION_READINESS_AUDIT_2026.md)** for the exhaustive list of remaining tasks (images, payments) required for launch.

## 📂 Repository Structure

This is a **Monorepo** managed with npm workspaces:

-   `shared/` (@ksebe/shared): UI components, hooks, services, and utilities shared between apps.
-   `k-sebe-yoga-studioWEB/`: Marketing landing page and main web portal.
-   `k-sebe-yoga-studio-APPp/`: Mobile-first PWA for students (booking, videos, AI coach).
-   `supabase/`: Backend logic (Edge Functions, database schema).

## 🛠 Tech Stack

-   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
-   **Backend**: Supabase (Auth, DB, Edge Functions)
-   **Testing**: Vitest
-   **AI**: Google Gemini Integration

## 🏁 Getting Started

### Prerequisites

-   Node.js >= 18
-   npm >= 9

### Installation

```bash
npm install
```

### Development

```bash
# Run Web Workspace
npm run dev:web

# Run App Workspace
npm run dev:app
```

### Building

```bash
npm run build:all
```

## 🧪 Testing

```bash
npm run test:run      # Run all tests
npm run test:coverage # Check code coverage
npm run typecheck     # Verify TypeScript types
npm run lint          # Check code style
```

## 💳 Payment Setup

The system uses a provider-agnostic approach.
1.  Configure `PAYMENT_CHECKOUT_URL` in your environment.
2.  Webhooks are handled at `supabase/functions/payment-webhook`.

## 📸 Assets

Default "lorem ipsum" images from Unsplash are currently used in some components.
Refer to the Audit Report for the specific list of files requiring updates.

## 📄 License

MIT © K Sebe Yoga Studio
