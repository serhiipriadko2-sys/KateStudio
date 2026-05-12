# K Sebe Yoga Studio Ecosystem

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue.svg)
![Monorepo](https://img.shields.io/badge/repo-npm_workspaces-informational.svg)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ecf8e.svg)

**"К себе" (To Yourself)** is a comprehensive digital ecosystem for the K Sebe
Yoga Studio (Dubna, Russia).

## 🗺 System at a glance

```text
┌─────────────┐     ┌─────────────┐
│  Studio     │     │  App User   │
│  Admin      │     │  (client)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────────────┐
│     WEB     │     │         APP         │
│ ksebe-      │     │ app.ksebe-studio.ru │
│ studio.ru   │     │ PWA + Capacitor     │
│ GitHub Pages│     │ Firebase Hosting    │
└──────┬──────┘     └──────┬──────────────┘
       │                   │
       └─────────┬─────────┘
                 │  Supabase JS SDK (anon key only)
                 ▼
       ┌─────────────────┐
       │    Supabase     │
       │  Auth · DB · RLS│
       └────────┬────────┘
                │
                ▼
       ┌─────────────────────────────────┐
       │         Edge Functions          │
       │  repo/live split is explicit    │
       │  payments, AI, push, ops        │
       └────────┬────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
 ┌──────────┐     ┌──────────────┐
 │ YooKassa │     │  Gemini API  │
 │ Payments │     │  (AI proxy)  │
 └──────────┘     └──────────────┘
```

**Containers in short:**

- **WEB** — marketing site + admin panel. Served via GitHub Pages. Admin auth boundary is separate from end-user flow.
- **APP** — mobile-first PWA with optional Capacitor native wrapper (Android/iOS). Served via Firebase Hosting.
- **Supabase** — auth, database, RLS policies. Both WEB and APP talk to it using the public anon key. Sensitive data is protected by row-level security.
- **Edge Functions** — all sensitive operations: AI calls, payments, push notifications, maintenance. Never expose secret keys to the browser.
- **Payment providers / AI** — external systems reached only through Edge Functions, never directly from the client.

> Full container narrative: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 📚 Documentation

| Document | Purpose |
| --- | --- |
| [AGENTS.md](./AGENTS.md) | **MUST READ** — AI agent guidelines |
| [ISKRA_CODER.md](./ISKRA_CODER.md) | Canonical engineering protocol (Искра-Кодер) |
| [CLAUDE.md](./CLAUDE.md) | Instructions for Claude Code / Copilot / Cursor |
| [CURRENT_TASKS.md](./CURRENT_TASKS.md) | Active sprint tasks and priorities |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [docs/INDEX.md](./docs/INDEX.md) | Central documentation index |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [docs/EDGE_FUNCTIONS.md](./docs/EDGE_FUNCTIONS.md) | Edge Functions reference (repo/live split) |
| [docs/SUPABASE_AUDIT_LIVE_2026_05_12.md](./docs/SUPABASE_AUDIT_LIVE_2026_05_12.md) | Canonical live Supabase snapshot |
| [docs/TESTING.md](./docs/TESTING.md) | Testing architecture and patterns |
| [docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md) | Pre-launch gap analysis |

## 📂 Repository Structure

This is a **Monorepo** managed with npm workspaces:

- `shared/` (`@ksebe/shared`): Reusable UI, hooks, and logic.
- `k-sebe-yoga-studioWEB/`: Marketing site & Admin Panel.
- `k-sebe-yoga-studio-APPp/`: Mobile PWA + Capacitor native wrapper
  (Android/iOS).
- `supabase/`: Backend (Edge Functions, Database migrations).

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22
- npm >= 10
- Supabase CLI (for Edge Functions)

### Installation

```bash
npm install
cp .env.example .env  # fill in your Supabase credentials
```

### Development

```bash
npm run dev:web    # Landing page / WEB
npm run dev:app    # Mobile PWA / APP
```

### Testing & Quality

```bash
npm run test:run       # Run the Vitest suite
npm run typecheck      # TypeScript strict check
npm run lint           # ESLint
npm run format:check   # Prettier check
npm run build:web      # Build WEB
npm run build:app      # Build APP
```

For current release-path truth, use [CURRENT_TASKS.md](./CURRENT_TASKS.md),
[docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md), and
[docs/SUPABASE_AUDIT_LIVE_2026_05_12.md](./docs/SUPABASE_AUDIT_LIVE_2026_05_12.md)
instead of relying on hardcoded snapshot numbers in the README.

## 📱 Mobile Build (Capacitor)

The APP workspace includes a full Capacitor wrapper for native Android/iOS
builds.

```bash
cd k-sebe-yoga-studio-APPp

# First time setup
npm run cap:add:android        # Generate Android project (local only)
npm run cap:add:ios            # Generate iOS project (macOS + CocoaPods)

# Daily workflow
npm run build:mobile           # Build + sync Android (auto-adds if missing)
npm run build:mobile:ios       # Build + sync iOS
npm run cap:open:android       # Open Android Studio
npm run cap:open:ios           # Open Xcode
```

> Native projects (`android/`, `ios/`) are generated locally and not committed.

## 🔐 Security

**Who sees what:**

- **App user (client)** — sees only their own data. Supabase RLS enforces `auth.uid() = user_id` on every sensitive table. There is no way to read another user's bookings, profile, or subscription via the public API.
- **Studio admin** — works through a separate admin auth boundary in WEB. Admin rights are stored in the `admins` table and checked server-side; they are not derived from the same RLS path as regular users.
- **Edge Functions** — hold all secrets (API keys, service role key, webhook secrets). The browser never receives them. Sensitive operations — AI, payments, push notifications — are only reachable through these functions.
- **Client code** — receives only two public values: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both are safe to expose. No other secrets appear in the browser bundle.

**Mechanisms that back this up:** Supabase RLS · HMAC webhook verification · CORS domain allowlist · Zod input validation on Edge Functions · JWT auth check on all non-public endpoints.

**Never commit `.env` files or expose API keys in client-side code.**

> Full security model: [docs/SECURITY_MODEL.md](./docs/SECURITY_MODEL.md)

## 🚢 Delivery

| Stage | Where |
| --- | --- |
| Local checks | `npm run lint` · `typecheck` · `test:run` · `build:web` · `build:app` |
| CI gate | GitHub Actions — migration check → lint/format → typecheck → test → build |
| WEB deploy | Push to `main` → `deploy-pages.yml` → GitHub Pages (`ksebe-studio.ru`) |
| APP deploy | Push to `main` → `firebase-deploy.yml` → Firebase Hosting (`app.ksebe-studio.ru`) |
| Backend | Supabase Edge Functions deployed via Supabase CLI (`supabase functions deploy`) |
| Mobile | `npm run build:mobile` → Capacitor sync → Android Studio / Xcode (local only) |

Deploy workflows are triggered by pushes to `main`. CI gate runs separately, and branch protection should require CI checks before merge.

## 📄 License

MIT © K Sebe Yoga Studio