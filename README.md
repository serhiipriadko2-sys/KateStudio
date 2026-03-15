# K Sebe Yoga Studio Ecosystem

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue.svg)
![Tests](https://img.shields.io/badge/tests-473%20passing-brightgreen.svg)
![Production Readiness](https://img.shields.io/badge/production--readiness-82%2F100-yellow.svg)

**"К себе" (To Yourself)** is a comprehensive digital ecosystem for the K Sebe
Yoga Studio (Dubna, Russia).

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
| [docs/EDGE_FUNCTIONS.md](./docs/EDGE_FUNCTIONS.md) | Edge Functions reference (7 functions) |
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
npm run test:run       # Run all tests (Vitest) — 473 passing / 60 suites
npm run typecheck      # TypeScript strict check (0 errors)
npm run lint           # ESLint (0 errors)
npm run format:check   # Prettier check
npm run build:web      # Build WEB
npm run build:app      # Build APP
```

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

- **AI**: Powered by Gemini via Supabase Edge Functions (`gemini-proxy`). All AI
  calls go through the proxy — never expose `GEMINI_API_KEY` client-side.
- **Auth**: Supabase Auth with OTP + RLS policies.
- **Payments**: HMAC-verified webhook + create-payment Edge Functions.
- **CORS**: Restricted to `ksebe-studio.ru`, `app.ksebe-studio.ru`, localhost.

**Never commit `.env` files or expose API keys in client-side code.**

## 📄 License

MIT © K Sebe Yoga Studio
