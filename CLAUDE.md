# CLAUDE.md - AI Agent Instructions

> **Last updated:** March 15, 2026 | **Version:** 3.2.0

This file provides context and instructions for AI assistants (Claude Code,
GitHub Copilot, Cursor, Codex, etc.) working with the KateStudio codebase.

## Project Overview

**K Sebe Yoga Studio** ("К себе" - "To Yourself") is an InsideFlow yoga
ecosystem created for Katya Gabran's yoga studio. The project consists of two
main applications sharing a common library.

### Architecture

```
KateStudio/
├── .github/                    # CI/CD workflows, templates, dependabot
│   ├── workflows/
│   │   ├── ci.yml              # Lint, typecheck, test, build
│   │   ├── deploy-pages.yml    # GitHub Pages deployment (WEB)
│   │   └── firebase-deploy.yml # Firebase deployment (APP)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── shared/                     # Shared library (@ksebe/shared)
│   ├── components/             # 10+ reusable React components
│   ├── hooks/                  # Custom React hooks (5+)
│   ├── services/               # Supabase client, image storage
│   ├── types/                  # 25+ TypeScript interfaces
│   ├── utils/                  # 28 utility functions
│   ├── constants/              # Brand, pricing, achievements, KB
│   └── styles/                 # Tailwind preset with brand tokens
├── k-sebe-yoga-studioWEB/      # Landing page / Marketing site
├── k-sebe-yoga-studio-APPp/    # Mobile-first PWA + Capacitor native wrapper
│   ├── native/                 # Capacitor plugin init (platform, plugins, index)
│   ├── hooks/useNative.ts      # React hook for haptics, network, platform
│   └── capacitor.config.ts     # Capacitor configuration
├── supabase/                   # Edge Functions + migrations
│   ├── functions/
│   │   ├── gemini-proxy/       # AI proxy with rate limiting
│   │   ├── create-payment/     # Payment initiation
│   │   └── payment-webhook/    # Payment confirmation
│   └── migrations/             # Database schema + RLS
├── skills/                     # Agent skill definitions (YAML)
├── scripts/                    # Build & automation scripts
├── docs/                       # Technical documentation (18 files)
└── raw_assets/                 # Original/unoptimized assets
```

### Tech Stack

- **Frontend**: React 19.2, TypeScript 5.7, Vite 6.2
- **Styling**: Tailwind CSS with custom preset
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI**: Google Gemini API via Edge Function proxy
- **Testing**: Vitest 2.1 + React Testing Library
- **Package Management**: npm workspaces (monorepo)
- **CI/CD**: GitHub Actions (Node.js 22)
- **Deployment**: GitHub Pages (WEB), Firebase Hosting (APP)

### Current Status (February 2026)

- **Tests**: 208 passing across 36 suites (~25% coverage)
- **TypeScript**: 100% compliance (strict mode, 0 errors across all workspaces)
- **Lint**: 0 errors, 0 warnings
- **Format**: 100% Prettier-clean
- **Build**: Both WEB and APP build successfully
- **Production Readiness**: 76/100 (security ✅, Capacitor ✅, payments pending)

## Agent Execution Rules

> These rules apply to all AI agents working on this codebase.

### Think 2-3 Steps Ahead

Before considering a task complete, the agent **must**:

1. **Predict downstream effects** — ask "what breaks or fails next because of this change?"
2. **Verify the full flow** — run `typecheck`, `lint`, and `test:run` after every change
3. **Test the user-facing scenario** — consider the actual runtime path, not just compile-time correctness (e.g. auth event timing, network errors, API rate limits)
4. **Commit only when all checks pass** — never commit with known errors or untested assumptions

**Example of correct behaviour:**
- Changing an auth flow → think: "will the session be ready when updateUser() is called?"
- Adding a new component → think: "are the imports correct? will TypeScript complain? do tests need updating?"
- Setting a DB value via SQL → think: "is the extension enabled? is the format compatible?"

---

## Key Conventions

### Code Style

1. **TypeScript**: Strict mode enabled, always use explicit types
2. **Components**: Functional components with hooks, no class components
3. **Imports**: Use path aliases (`@ksebe/shared`, `@web/*`, `@app/*`)
4. **Exports**: Prefer named exports over default exports
5. **Naming**:
   - Components: PascalCase (`VideoLibrary.tsx`)
   - Hooks: camelCase with `use` prefix (`useScrollLock.ts`)
   - Utils: camelCase (`formatDate.ts`)
   - Constants: SCREAMING_SNAKE_CASE (`BRAND_COLORS`)

### File Organization

- One component per file
- Co-locate tests with source files (`Component.tsx`, `Component.test.tsx`)
- Keep components under 300 lines, extract logic to hooks/utils
- Group related files in feature folders

### Styling Guidelines

- Use Tailwind utility classes
- Custom colors defined in `shared/styles/tailwind.preset.js`
- Brand colors: `brand-green` (#57a773), `brand-mint`, `brand-yellow`
- Animations: `animate-fade-in`, `animate-blob`, `animate-float`

## Important Files

| File                                         | Purpose                                       |
| -------------------------------------------- | --------------------------------------------- |
| `shared/types/index.ts`                      | All TypeScript interfaces                     |
| `shared/constants/index.ts`                  | Brand constants, API endpoints                |
| `shared/constants/images.ts`                 | Centralized asset management                  |
| `shared/utils/index.ts`                      | Utility functions (cn, formatDate, etc.)      |
| `shared/services/supabase.ts`                | Supabase client configuration                 |
| `.env.example`                               | Required environment variables                |
| `CURRENT_TASKS.md`                           | Active priorities and task tracking           |
| `CHANGELOG.md`                               | Version history (semver)                      |
| `docs/INDEX.md`                              | Central documentation index                   |
| `docs/CODEX_INSTRUCTIONS.md`                 | Development protocol for AI agents            |
| `docs/LAUNCH_CHECKLIST.md`                   | Pre-launch gap analysis                       |
| `skills/registry.json`                       | Agent skill registry                          |
| `k-sebe-yoga-studio-APPp/native/`            | Capacitor native wrapper (platform + plugins) |
| `k-sebe-yoga-studio-APPp/hooks/useNative.ts` | React hook for native features                |

## Common Tasks

### Adding a New Shared Component

1. Create component in `shared/components/YourComponent.tsx`
2. Export from `shared/components/index.ts`
3. Re-export from `shared/index.ts`
4. Import in WEB/APP: `import { YourComponent } from '@ksebe/shared'`

### Adding a New Type

1. Add interface to `shared/types/index.ts`
2. Types are auto-exported via `shared/index.ts`

### Working with Supabase

```typescript
import { supabase } from '@ksebe/shared';

// Authentication
const {
  data: { user },
} = await supabase.auth.getUser();

// Database query
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', user.id);
```

### Working with Native/Capacitor (APP only)

```typescript
// Platform detection — import from ./native (NOT from @capacitor/core directly)
import { isNative, isIOS, isAndroid, getPlatform } from './native';

// Haptic feedback — safe on web (no-op when not native)
import { hapticLight, hapticSuccess, hapticError } from './native';
void hapticLight(); // light tap — for nav, button presses
void hapticSuccess(); // success pulse — for completed actions
void hapticError(); // error buzz — for failures

// React hook — network status + haptics in one hook
import { useNative } from './hooks/useNative';
const { isOnline, isNative, haptic } = useNative();
haptic.light();

// Building for Android/iOS
// npm run build:mobile        — build + sync Android (auto-adds if missing)
// npm run build:mobile:ios    — build + sync iOS
// npm run cap:open:android    — open Android Studio
// npm run cap:open:ios        — open Xcode
```

**Rules:**

- Never import from `@capacitor/*` directly in components — always use
  `./native`
- All haptic calls must be `void hapticFn()` (returns Promise)
- Native projects (`android/`, `ios/`) are generated locally, not committed

### Working with Gemini AI (via Edge Function Proxy)

```typescript
// All Gemini calls MUST go through the Edge Function proxy
// NEVER use VITE_GEMINI_API_KEY in client code

// The proxy handles: rate limiting, auth, subscription-based quotas
// Location: supabase/functions/gemini-proxy/index.ts
```

## Domain Knowledge

### Inside Flow Yoga

Inside Flow is a modern yoga style created by Young Ho Kim that combines:

- Vinyasa flow movements synchronized with music
- Emotional expression through movement
- Breath-to-beat coordination
- Contemporary music integration
- 10,000+ certified teachers globally
- Elite Training Frankfurt (May-June 2026)

### Key Features

1. **AI Coach (Aria)**: Gemini-powered assistant for yoga guidance
2. **Video Library**: Curated Inside Flow classes
3. **Schedule**: Class booking with Supabase backend
4. **Breathwork**: Square breathing and pranayama exercises
5. **Blog**: Articles about yoga, wellness, mindfulness
6. **Gamification**: Streaks, achievements, progress tracking
7. **Admin Panel**: Schedule, bookings, contacts management

### User Personas

- **Primary**: Women 25-45 interested in yoga and mindfulness
- **Secondary**: Yoga practitioners looking for Inside Flow content
- **Tertiary**: Complete beginners seeking gentle introduction to yoga

## Testing

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once (CI)
npm run test:coverage # Run with coverage report
npm run test:ui       # Visual test UI
npm run lint          # ESLint
npm run typecheck     # TypeScript type check
npm run format:check  # Prettier check
```

### Before Making Changes

1. Run existing tests: `npm run test:run`
2. Type check: `npm run typecheck`
3. Lint: `npm run lint`

### After Making Changes

1. Run tests: `npm run test:run`
2. Type check: `npm run typecheck`
3. Lint: `npm run lint`
4. Build: `npm run build:web` / `npm run build:app`

## Deployment

- **WEB**: GitHub Pages via `deploy-pages.yml` (domain: ksebe-studio.ru)
- **APP**: Firebase Hosting via `firebase-deploy.yml` (PWA)
- **CI**: Runs on push to main/develop and all PRs

## Security Model

### Resolved (February 2026)

- **Edge Function Proxy**: Gemini API key in Supabase secrets, not client-side
- **Payment Webhook**: HMAC signature verification, secret required
- **Service Role Key**: Required for backend ops, no anon fallback
- **RLS Policies**: Subscriptions locked down (no user self-update)
- **CORS**: Restricted to ksebe-studio.ru, app.ksebe-studio.ru, localhost

### Rules

- Never commit `.env` files or secrets
- Never use `SUPABASE_SERVICE_ROLE_KEY` in browser code
- Never use `VITE_GEMINI_API_KEY` in production builds
- All Gemini calls must go through Edge Function proxy
- CORS must be restricted to specific domains (no wildcard `*`)
- All Edge Functions must validate required secrets on startup

## Contact

- **Studio Owner**: Katya Gabran
- **Address**: Станционная ул., 5Б, Дубна, 141981 (этаж 2)
- **Instagram**: @kate_gabran
- **Telegram**: @k_sebe_dubna
- **Yandex Maps**: https://yandex.ru/navi/org/k_sebe/7167334007

---

**Principles**: This is a passion project for a yoga studio. Prioritize:

- Clean, maintainable code
- Accessible design (WCAG 2.1 AA)
- Mobile-first responsive layouts
- Calm, mindful user experience
- Security first (Edge Functions proxy, RLS, input validation)

## Current Priorities (February 2026)

### P0 Critical (Blockers)

| Task                                | Status                     |
| ----------------------------------- | -------------------------- |
| Webhook secret validation           | ✅ Resolved                |
| Subscriptions RLS policy            | ✅ Resolved                |
| CORS restrictions                   | ✅ Resolved                |
| API key fallback removal            | ✅ Resolved                |
| Service Role Key enforcement        | ✅ Resolved                |
| Capacitor native wrapper            | ✅ Done (2.1.0)            |
| CI fully green                      | ✅ Done (2.1.0)            |
| Replace Unsplash placeholder images | 🔄 WEB done, APP remaining |
| Configure production .env           | ⏳ Pending                 |
| Set GitHub Secrets                  | ⏳ Pending                 |

### P1 High Priority

- Input validation with Zod for Edge Functions
- YooKassa payment integration (full)
- Database migrations for missing tables (`contacts`, `classes`)
- Increase test coverage to 50%+ (currently ~25%)
- Replace placeholder videos in APP

### P2 Medium Priority

- Remove remaining default exports
- Image optimization (WebP)
- Newsletter integration (Mailchimp)
- Logging & monitoring (Sentry)
- Database type generation

See [CURRENT_TASKS.md](./CURRENT_TASKS.md) for the full task list.

## Gamification (Implemented)

- **Streaks**: StreakCard + StreakCalendar + milestones (3/7/14/30/60/100 days)
- **Achievements**: 20+ achievements, AchievementUnlockedModal, AchievementsGrid
- **Push Notifications**: UI ready, Firebase Cloud Messaging planned

## Monetization

```
Free:     0₽      - AI Chat (100 msg/day), 3 videos/week
Premium:  990₽/mo - All videos, offline, AI programs
VIP:      2,990₽  - Premium + consultations with Katya (2/month)
```

Payment: YooKassa (Russia) + Stripe (international) — integration in progress.

## AI Agent Ecosystem

This project supports multiple AI agents. See [AGENTS.md](./AGENTS.md) for the
full multi-agent architecture.

### Agent-Specific Files

| File                         | Agent Target                                    |
| ---------------------------- | ----------------------------------------------- |
| `CLAUDE.md`                  | Claude Code, Claude                             |
| `ISKRA_CODER.md`             | Claude Code, Copilot, Cursor (Искра-Кодер vΩ.6) |
| `AGENTS.md`                  | All AI agents                                   |
| `docs/CODEX_INSTRUCTIONS.md` | OpenAI Codex                                    |
| `skills/*.yaml`              | Jules agent skills                              |
| `skills/registry.json`       | Skill registry                                  |

## Performance Targets 2026

| Metric             | Current | Q4 2026 Target |
| ------------------ | ------- | -------------- |
| Lighthouse Score   | ~75     | 90+            |
| Test Coverage      | ~20%    | 70%+           |
| Bundle Size (gzip) | ~300KB  | <200KB         |
| LCP                | ~3s     | <2.5s          |
| Tests Passing      | 174     | 300+           |

## Resources

- [Current Tasks](./CURRENT_TASKS.md)
- [Strategic Roadmap 2026](./STRATEGIC_ROADMAP_2026.md)
- [Deep Analysis 2026](./docs/DEEP_ANALYSIS_2026.md)
- [Action Plan 2026](./ACTION_PLAN_2026.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Launch Checklist](./docs/LAUNCH_CHECKLIST.md)
- [Security Report](./docs/SECURITY_REPORT_2026_02_11.md)
- [Documentation Index](./docs/INDEX.md)
