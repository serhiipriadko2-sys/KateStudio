# CLAUDE.md - AI Agent Instructions

> **Last updated:** February 21, 2026 | **Version:** 3.2.0

This file provides context and instructions for AI assistants (Claude Code,
GitHub Copilot, Cursor, Codex, etc.) working with the KateStudio codebase.

## Project Overview

**K Sebe Yoga Studio** ("К себе" - "To Yourself") is an InsideFlow yoga
ecosystem created for Katya Gabran's yoga studio in Dubna, Russia. The project
consists of two applications sharing a common library, backed by Supabase and
Google Gemini AI.

### Architecture

```
KateStudio/
├── .github/                    # CI/CD workflows, templates, dependabot
│   ├── workflows/
│   │   ├── ci.yml              # Lint, typecheck, test, build (5 jobs)
│   │   ├── deploy-pages.yml    # GitHub Pages deployment (WEB)
│   │   └── firebase-deploy.yml # Firebase deployment (APP)
│   ├── ISSUE_TEMPLATE/         # Bug report + feature request (YAML)
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   ├── FUNDING.yml
│   └── dependabot.yml
├── shared/                     # Shared library (@ksebe/shared)
│   ├── components/             # 25 React components (exported)
│   ├── hooks/                  # 8 custom hooks (useScrollLock, useDebounce, etc.)
│   ├── services/               # Supabase client + image storage adapter
│   ├── types/                  # 59 TypeScript interfaces/types (547 lines)
│   ├── utils/                  # 25 exported functions + logger, async, webVitals
│   ├── constants/              # Brand, pricing, achievements, KB (762+125 lines)
│   └── styles/                 # Tailwind preset with brand tokens
├── k-sebe-yoga-studioWEB/      # Landing page / Marketing site
│   ├── components/             # 58 .tsx files (incl. admin panel: 9 tabs)
│   ├── services/               # 9 service files (theme, content, supabase, etc.)
│   ├── hooks/                  # 3 hooks (useContentData, useFocusTrap, useScrollLock)
│   ├── data/                   # Static content data
│   └── __tests__/              # 8 test files
├── k-sebe-yoga-studio-APPp/    # Mobile-first PWA application
│   ├── components/             # 53 .tsx/.ts files (incl. AICoach: 7 files, ChatWidget: 12 files)
│   ├── services/               # 7 service files (gemini, retention, subscription, etc.)
│   ├── hooks/                  # 3 hooks (usePWAUpdate, useStreak, usePracticeCompletions)
│   └── context/                # 2 contexts (AuthContext, ToastContext)
├── supabase/                   # Edge Functions + migrations
│   ├── functions/
│   │   ├── gemini-proxy/       # AI proxy: 11 ops, Zod validation, Deno KV rate limiting
│   │   ├── create-payment/     # Payment initiation (Zod, Service Role)
│   │   └── payment-webhook/    # HMAC-SHA256 signature verification
│   └── migrations/             # 14 SQL migrations (Dec 2025 – Feb 2026)
├── skills/                     # 4 agent skill definitions (YAML + registry)
├── scripts/                    # 4 scripts (check_supabase, create-admin, jules-skill-runner, index_repo)
├── docs/                       # 18 technical documentation files
└── raw_assets/                 # Original/unoptimized assets
```

### Tech Stack

- **Frontend**: React 19, TypeScript 5.7.3, Vite 6
- **Styling**: Tailwind CSS with custom preset (`shared/styles/tailwind.preset.js`)
- **Backend**: Supabase (Auth via OTP, PostgreSQL, Storage, Edge Functions on Deno)
- **AI**: Google Gemini 2.5 Flash/Pro via Edge Function proxy (11 operations)
- **Testing**: Vitest 2.1.8 + React Testing Library 16.1 + jsdom 25
- **Package Management**: npm workspaces (monorepo: shared, WEB, APP)
- **CI/CD**: GitHub Actions (Node.js 22, 5 parallel jobs)
- **Deployment**: GitHub Pages (WEB → ksebe-studio.ru), Firebase Hosting (APP)
- **Code Quality**: ESLint 9 + Prettier 3.4 + Husky + lint-staged

### Current Status (February 2026)

- **Tests**: 178 passing across 27 test files (~20% coverage)
- **TypeScript**: 100% strict mode compliance (`tsc -b` passes)
- **Lint**: 0 errors, 3 warnings (no-explicit-any)
- **Build**: Both WEB and APP build successfully
- **Production Readiness**: 75/100 (security P0 resolved, payments pending)
- **Security Score**: 85/100 (all 5 critical blockers resolved)

## Shared Library (@ksebe/shared) — Detailed Inventory

### Components (25 exported)

**UI Components:** FadeIn, Logo, Image, Marquee, ScrollProgress, BackToTop,
ErrorBoundary, CookieBanner, Paywall, UpdateBanner, OfflineBanner, Skeleton
(+SkeletonVideoCard, SkeletonAvatar, SkeletonText)

**Feature Components:** About, Hero, Breathwork, Blog, Pricing

**Gamification & AI (2026):** DailyRecommendation, AchievementUnlockedModal,
AchievementsGrid, ProgressSummary, WeeklyRecap, StreakCalendar, OnboardingQuiz,
NotificationPreferences

### Hooks (8 exported)

useScrollLock, useLocalStorage, useMediaQuery (+ useIsMobile, useIsTablet,
useIsDesktop, usePrefersDarkMode, usePrefersReducedMotion), useDebounce
(+ useDebouncedCallback), useOnlineStatus, usePWAMode (+ useIsPWA),
useAchievements, useIsAdmin

### Types (59 interfaces/types, 547 lines)

**Domain:** UserProfile, BookingDetails, BookingStatus, Booking, ClassSession,
LoadLevel, ClassRow, ClassFormData, BookingRow, ContactRow, ProfileRow

**AI & Chat:** ChatMode (9 modes), ChatMessage, ChatAttachment, AsanaAnalysis

**Content:** BlogArticle, PriceOption, VideoItem, Retreat, Review

**Gamification:** Achievement, AchievementCategory, AchievementRarity,
StreakData, StreakMilestone, StreakCalendarDay, WeeklyRecapData (+Stats,
+StreakStatus, +AIUsage, +Insights, +ShareCard)

**AI Personalization:** PracticeType, PracticeGoal, PracticeLevel,
DailyRecommendationData, PersonalProgram, ProgramDay, EnhancedAsanaAnalysis,
BodyPartAnalysis, IdealComparison, ProgressTracking

**Subscription:** SubscriptionPlan, SubscriptionStatus, Subscription,
SubscriptionPlanDetails, SubscriptionLimits

**Other:** OnboardingData, NotificationType, NotificationPreferencesData,
PushNotification, ThemeMode, ThemeColors, ApiResponse, BreathPhase,
BreathworkConfig, BookingModalProps, ScheduleProps, PricingProps

### Utils (25+ functions, 4 modules)

**Core (index.ts, 293 lines):** cn, formatDate, formatTime, formatPrice,
pluralize, debounce, throttle, generateId, sleep, isBrowser, isMobile, isIOS,
clamp, lerp, getInitials, capitalize, truncate, parsePhone, formatPhone,
isValidEmail, isValidPhone, copyToClipboard, storage (get/set/remove/clear)

**Logger (108 lines):** Structured logging with levels and context

**Async (272 lines):** safeAsync, retryAsync, parallelAsync, batchAsync,
debounceAsync, throttleAsync

**Web Vitals (337 lines):** observeLCP, observeINP, observeCLS, observeFCP,
observeTTFB, observeWebVitals, logWebVitals, reportWebVitals

### Constants (762+ lines)

BRAND, COLORS (12 values), FONTS (3), SPACING (7), BREAKPOINTS (5),
ANIMATION (7), YOGA_DIRECTIONS (3 classes: Inside Flow, Hatha, Sound Healing),
PRICING_PLANS (6 plans: 700-8000₽), CONTACT, API (Supabase tables/buckets +
Gemini models), BREATHWORK_PRESETS (4 patterns), STORAGE_KEYS (6), PATTERNS (3
regex), ACHIEVEMENTS (21 achievements), STREAK_MILESTONES (6 milestones),
SUBSCRIPTION_PLANS (3 tiers), INSIDE_FLOW (full: history, certification levels,
events 2026, links), ARIA_CONFIG (6 AI modes), IMAGES, KNOWLEDGE_BASE (5
entries + default response)

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
6. **Edge Functions**: Deno runtime, npm: imports, Zod validation on all inputs

### File Organization

- One component per file
- Co-locate tests with source (`__tests__/` directories or `.test.tsx` suffix)
- Keep components under 300 lines, extract logic to hooks/utils
- Group related files in feature folders (e.g., `ChatWidget/`, `AICoach/`, `admin/`)

### Styling Guidelines

- Use Tailwind utility classes
- Custom colors defined in `shared/styles/tailwind.preset.js`
- Brand colors: `brand-green` (#57a773), `brand-mint` (#d4edda), `brand-yellow` (#f0c14b)
- Brand dark: #1a1a1a, text: #2d3436, accent: #fef3c7
- Background: bgPrimary (#fdfbf7), bgSecondary (#f8f9fa)
- Fonts: Inter (sans), Playfair Display (serif), JetBrains Mono (mono)
- Animations: `animate-fade-in`, `animate-blob`, `animate-float`, `animate-pulse`

## Important Files

| File                              | Purpose                                  | Lines |
| --------------------------------- | ---------------------------------------- | ----- |
| `shared/types/index.ts`           | All 59 TypeScript interfaces             | 547   |
| `shared/constants/index.ts`       | Brand, pricing, achievements, Aria       | 762   |
| `shared/constants/images.ts`      | Centralized asset paths                  | 53    |
| `shared/constants/kb.ts`          | Knowledge base for rule-based chat       | 72    |
| `shared/utils/index.ts`           | 25+ utility functions                    | 293   |
| `shared/services/supabase.ts`     | Supabase client + uploadFile + queryTable| 104   |
| `shared/services/imageStorage.ts` | Image storage adapter (Supabase bucket)  | -     |
| `shared/components/index.ts`      | 25 component exports + type re-exports   | 87    |
| `shared/hooks/index.ts`           | 8 hook exports                           | 26    |
| `.env.example`                    | Required environment variables           | -     |
| `CURRENT_TASKS.md`                | Active priorities and task tracking      | -     |
| `skills/registry.json`            | Agent skill registry (4 skills)          | -     |

## Supabase Schema (14 migrations)

### Tables

| Table             | Migration                                     | RLS | Notes                          |
| ----------------- | --------------------------------------------- | --- | ------------------------------ |
| `profiles`        | 20251227 (profiles_bookings_user_id_rls)      | Yes | User profiles, is_admin flag   |
| `bookings`        | 20251227 + 20260216 (deep_refactor)           | Yes | Booking records, class_uuid FK |
| `practice_events` | 20251227 (retention)                          | Yes | Practice tracking              |
| `onboarding_events`| 20251227 (retention)                         | Yes | Onboarding data                |
| `subscriptions`   | 20251228 + 20260209 (indexes) + 20260211 (secure) | Yes | Payment plans, strict RLS |
| `contacts`        | 20260205                                      | Yes | Contact form submissions       |
| `classes`         | 20260216 (schedule_admin)                     | Yes | Class schedule                 |
| `reviews`         | 20260216 (reviews_table)                      | Yes | User reviews                   |
| `pricing`         | 20260216 (pricing_table)                      | Yes | Pricing options                |
| `articles`        | 20260216 (deep_refactor)                      | Yes | Blog articles                  |
| `app_settings`    | 20260216 (deep_refactor)                      | Yes | Theme, config (JSON)           |
| `admin_users`     | 20260215 (admin_security)                     | Yes | Admin authorization            |

### Functions & Policies

- `is_admin()` — Checks admin authorization (20260215_admin_security)
- Storage bucket `images` with public read, admin write policies

## Edge Functions (3 functions, all Zod-validated)

### gemini-proxy (615 lines)

11 operations: `chat`, `thinking`, `generateSpeech`, `generateMeditationScript`,
`createMeditation`, `generateYogaImage`, `generatePersonalProgram`,
`transcribeDiaryEntry`, `analyzeYogaVideo`, `analyzeMedia`, `analyzeImageContent`

- **Auth**: Bearer token → Supabase user ID, falls back to IP-based anon
- **Rate limiting**: Deno KV (persistent), 3-tier by plan (free/premium/vip) ×
  cost (cheap/medium/expensive)
- **CORS**: Whitelist of 4 origins (ksebe-studio.ru, app.ksebe-studio.ru,
  localhost:3000, localhost:5173)
- **Models**: gemini-2.5-flash (chat/vision), gemini-2.5-pro (thinking),
  gemini-3-pro-image-preview (image gen), gemini-2.5-flash-preview-tts (speech)

### create-payment (140 lines)

- Zod-validated plan input (free/premium/vip)
- Requires Bearer token (user must be authenticated)
- Uses Service Role Key (strict, no anon fallback)
- Upserts subscription to Supabase

### payment-webhook (175 lines)

- HMAC-SHA256 signature verification (x-webhook-signature header)
- Requires PAYMENT_WEBHOOK_SECRET environment variable
- Zod-validated payload after HMAC check
- Updates/upserts subscription via Service Role Key

## WEB Application (Landing / Marketing)

### Sections (App.tsx, 422 lines)

Hero → Marquee → About → Philosophy → Directions → FirstVisit → Gallery →
Pricing → Schedule → InstagramFeed → Reviews → FAQ → Contact → Footer

**Commented out**: Benefits, SubscriptionProfile, Retreats

### Admin Panel (9 tabs)

DashboardTab, ScheduleTab, BookingsTab, ContactsTab, ContentTab, ReviewsTab,
PricingTab, ImagesTab, SettingsTab

- Access: Ctrl+Shift+Y/H keyboard shortcut, or footer link
- Requires `is_admin()` Supabase function for data operations

### Services (9 files)

assistantService, content, contentStore, serviceWorker, subscriptionService,
supabase, supabaseConfig, theme

### Features

- Service Worker with offline support + update notification
- Dynamic theme loading from Supabase `app_settings` table
- Image management via Supabase Storage bucket
- Knowledge-base chat (ChatWidget) with rule-based fallback

## APP Application (Mobile PWA)

### Navigation (5 tabs)

Home (HomeView) → Schedule → AI (AICoach, lazy) → Studio (StudioView) → Profile (Dashboard, lazy)

### Key Components

- **AICoach**: 7 sub-files (ChatMode, VisionMode, MeditationMode, CreateMode,
  AnalysisReport, FormattedText, types)
- **ChatWidget**: 12 sub-files (ChatWidgetRoot, ChatWidgetShell, ChatInputPanel,
  ChatMessagesPanel, ChatModeSelector, ConsentModal, ConsentSettingsModal,
  LiveModePanel, liveAudio, useChatSession, ChatInput, ChatMessages)
- **Dashboard**: Profile, streak, weekly recap, subscription management
- **IntroSplash**: Press-and-hold ignition animation
- **OnboardingQuizModal**: First-time user onboarding flow

### Services (7 files)

dataService, geminiService, localCache, retentionService, serviceWorker,
subscriptionService, supabaseClient

### Hooks (3 files)

usePWAUpdate, usePracticeCompletions, useStreak



## Common Tasks

### Adding a New Shared Component

1. Create component in `shared/components/YourComponent.tsx`
2. Export from `shared/components/index.ts`
3. Types auto-re-exported via `shared/index.ts`
4. Import in WEB/APP: `import { YourComponent } from '@ksebe/shared'`

### Adding a New Type

1. Add interface to `shared/types/index.ts`
2. Types are auto-exported via `shared/index.ts`

### Working with Supabase

```typescript
import { supabase } from '@ksebe/shared';

// Authentication (OTP-based)
const {
  data: { user },
} = await supabase.auth.getUser();

// Database query
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', user.id);
```

### Working with Gemini AI (via Edge Function Proxy)

```typescript
// All Gemini calls MUST go through the Edge Function proxy
// NEVER use VITE_GEMINI_API_KEY in client code

// The proxy handles: Zod validation, rate limiting (Deno KV), auth, subscription quotas
// Location: supabase/functions/gemini-proxy/index.ts
// 11 operations: chat, thinking, generateSpeech, generateMeditationScript,
// createMeditation, generateYogaImage, generatePersonalProgram,
// transcribeDiaryEntry, analyzeYogaVideo, analyzeMedia, analyzeImageContent
```

## Domain Knowledge

### Inside Flow Yoga

Inside Flow is a modern yoga style created by Young Ho Kim (Inside Yoga
Academy, Germany) that combines:

- Vinyasa flow movements synchronized with music
- Emotional storytelling through movement
- Breath-to-beat coordination
- Contemporary music integration
- 10,000+ certified teachers in 50+ countries
- 7 certification levels (Flow Lover → Master Teacher)
- Annual license fee: €108/year
- Events 2026: Fundamentals Training (March, Online), European Summit (May,
  Budapest), Elite Training (May-June, Frankfurt)

### Yoga Classes Offered

| Class         | Price    | Duration | Intensity |
| ------------- | -------- | -------- | --------- |
| Inside Flow   | 700 ₽    | 60 мин   | 3/3       |
| Hatha Yoga    | 700 ₽    | 60 мин   | 2/3       |
| Sound Healing | 1,500 ₽  | 60 мин   | 1/3       |

### Pricing (PRICING_PLANS constant)

| Plan             | Price    | Per-class | Valid |
| ---------------- | -------- | --------- | ----- |
| Single class     | 700 ₽    | 700 ₽     | 7 days|
| 4-class pack     | 2,500 ₽  | 625 ₽     | 30 days|
| 9-class pack     | 5,000 ₽  | 556 ₽     | 30 days|
| Unlimited month  | 8,000 ₽  | -         | 30 days|
| Personal (1 pers)| 1,800 ₽  | -         | 30 days|
| Personal (2 pers)| 2,500 ₽  | -         | 30 days|

### AI Coach "Aria" (6 modes)

| Mode       | Icon | Description                        |
| ---------- | ---- | ---------------------------------- |
| Chat       | 💬   | Yoga, health, mindfulness chat     |
| Vision     | 📸   | AI pose analysis from photo/video  |
| Meditation | 🧘   | Personalized meditations           |
| Program    | 📋   | 7-day personal yoga program        |
| Create     | 🎨   | Art therapy & visualization        |
| Coach      | 🎤   | Voice coaching during practice     |

### Key Features

1. **AI Coach (Aria)**: 11-operation Gemini proxy with subscription-based quotas
2. **Video Library**: Inside Flow video classes (lazy-loaded)
3. **Schedule**: Class booking with Supabase backend
4. **Breathwork**: 4 presets (Square, Relaxing 4-7-8, Energizing, Coherent)
5. **Blog**: Articles from Supabase `articles` table
6. **Gamification**: 21 achievements, 6 streak milestones, weekly recaps
7. **Admin Panel**: 9 tabs for schedule, bookings, contacts, content management
8. **Onboarding**: Quiz flow with goals, level, preferred time, limitations
9. **PWA**: Service worker, offline support, push notification UI (FCM planned)

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

### Test Files (27 total)

**shared/ (12 files):** components.test.tsx, image.test.tsx, imageStorage.test.ts,
marquee.test.tsx, utils.test.ts, Image.test.tsx, NewComponents.test.tsx,
Paywall.test.tsx, UIComponents.test.tsx, hooks.test.ts, useAchievements.test.ts,
async.test.ts, logger.test.ts, webVitals.test.ts

**WEB (10 files):** Landing.test.tsx, Blog.test.tsx, Breathwork.test.tsx,
ChatWidget.test.tsx, Image.test.tsx, Marquee.test.tsx, Pricing.test.tsx,
ScrollProgress.test.tsx, supabaseConfig.test.ts, vite.config.test.ts

**APP (3 files):** dataService.test.ts, streak.test.ts, vite.config.test.ts

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
- **CI**: Runs on push to main/develop and all PRs (5 parallel jobs: lint,
  typecheck, test, build-web, build-app)
- **Artifacts**: Build outputs retained 7 days

## Security Model

### Resolved (February 2026)

- **Edge Function Proxy**: GEMINI_API_KEY in Deno env, never in client
- **Payment Webhook**: HMAC-SHA256 verification, PAYMENT_WEBHOOK_SECRET required
- **Service Role Key**: Required for create-payment/payment-webhook, no anon fallback
- **RLS Policies**: All tables have RLS enabled; subscriptions locked (no user self-update)
- **CORS**: Whitelist of 4 origins across all 3 Edge Functions
- **Input Validation**: Zod schemas on all 3 Edge Functions
- **Admin**: `is_admin()` SQL function + `admin_users` table for authorization
- **Rate Limiting**: Deno KV with per-user/per-IP buckets, tiered by plan

### Rules

- Never commit `.env` files or secrets
- Never use `SUPABASE_SERVICE_ROLE_KEY` in browser code
- Never use `VITE_GEMINI_API_KEY` in production builds
- All Gemini calls must go through Edge Function proxy
- CORS must be restricted to specific domains (no wildcard `*`)
- All Edge Functions must validate required secrets on startup
- Expensive AI operations (vision, video, image gen) require authentication

## Contact

- **Studio Owner**: Катя Габран (Katya Gabran)
- **Phone**: +7 909 946-89-72
- **Email**: k.sebe.dubna@gmail.com
- **Address**: Станционная ул., 5Б, Дубна, 141981 (этаж 2)
- **Instagram**: @kate_gabran
- **Telegram**: @k_sebe_dubna
- **Yandex Maps**: https://yandex.ru/navi/org/k_sebe/7167334007
- **Working hours**: Weekdays 09:00-21:00, Weekends 10:00-18:00
- **Rating**: 4.4 (9 reviews on Yandex Maps)

---

**Principles**: This is a passion project for a yoga studio. Prioritize:

- Clean, maintainable code
- Accessible design (WCAG 2.1 AA)
- Mobile-first responsive layouts
- Calm, mindful user experience
- Security first (Edge Functions proxy, RLS, Zod validation)

## Current Priorities (February 2026)

### P0 Critical (Blockers)

| Task                                | Status                     |
| ----------------------------------- | -------------------------- |
| Webhook secret validation           | ✅ Resolved                |
| Subscriptions RLS policy            | ✅ Resolved                |
| CORS restrictions                   | ✅ Resolved                |
| API key fallback removal            | ✅ Resolved                |
| Service Role Key enforcement        | ✅ Resolved                |
| Replace Unsplash placeholder images | 🔄 WEB done, APP remaining |
| Configure production .env           | ⏳ Pending                 |
| Set GitHub Secrets                  | ⏳ Pending                 |

### P1 High Priority

- YooKassa payment integration (full checkout flow)
- Increase test coverage to 50%+ (currently ~20%, 178 tests)
- Replace placeholder videos in APP VideoLibrary
- Integrate Schedule with live Supabase data
- Add database indexes for performance
- Fix nullable user_id in bookings

### P2 Medium Priority

- Remove remaining default exports
- Image optimization (WebP conversion)
- Newsletter integration (Mailchimp)
- Logging & monitoring (Sentry)
- Database type generation (`shared/types/database.types.ts`)
- Uncomment SubscriptionProfile/Retreats sections in WEB

See [CURRENT_TASKS.md](./CURRENT_TASKS.md) for the full task list.

## Gamification (Implemented)

- **Achievements**: 21 achievements across 5 categories (practice, streak, ai,
  community, milestone), 4 rarity tiers (common → legendary)
- **Streaks**: StreakCard + StreakCalendar + 6 milestones (3/7/14/30/60/100 days)
- **Weekly Recap**: WeeklyRecapCard with practice stats, insights, share card
- **Push Notifications**: UI ready (NotificationPreferences), FCM planned

## Monetization

### Studio Plans (PRICING_PLANS)

```
Single class:     700₽   - 1 visit, 7 days validity
4-class pack:   2,500₽   - 625₽/class, 30 days
9-class pack:   5,000₽   - 556₽/class, 30 days (popular)
Unlimited:      8,000₽   - Unlimited, 30 days
Personal (1p):  1,800₽   - Individual session
Personal (2p):  2,500₽   - Pair session
```

### Digital Subscription (SUBSCRIPTION_PLANS)

```
Free:     0₽      - AI Chat (100 msg/day), 3 videos/week, 5 vision/month
Premium:  990₽/mo - Unlimited AI, all videos, offline, personal programs
VIP:    2,990₽/mo - Premium + consultations with Katya (2/month), priority support
```

Payment: YooKassa (Russia) + Stripe (international) — integration in progress.

## AI Agent Ecosystem

This project supports multiple AI agents. See [AGENTS.md](./AGENTS.md) for the
full multi-agent architecture.

### Agent-Specific Files

| File                         | Agent Target        |
| ---------------------------- | ------------------- |
| `CLAUDE.md`                  | Claude Code, Claude |
| `AGENTS.md`                  | All AI agents       |
| `docs/CODEX_INSTRUCTIONS.md` | OpenAI Codex        |
| `skills/*.yaml`              | Jules agent skills  |
| `skills/registry.json`       | Skill registry      |

## Performance Targets 2026

| Metric             | Current | Q4 2026 Target |
| ------------------ | ------- | -------------- |
| Lighthouse Score   | ~75     | 90+            |
| Test Coverage      | ~20%    | 70%+           |
| Bundle Size (gzip) | ~300KB  | <200KB         |
| LCP                | ~3s     | <2.5s          |
| Tests Passing      | 178     | 300+           |
| Test Files         | 27      | 50+            |
| TypeScript Types   | 59      | 80+            |
| Shared Components  | 25      | 35+            |

## Resources

- [Current Tasks](./CURRENT_TASKS.md)
- [Agents Architecture](./AGENTS.md)
- [Strategic Roadmap 2026](./STRATEGIC_ROADMAP_2026.md)
- [Deep Analysis 2026](./docs/DEEP_ANALYSIS_2026.md)
- [Action Plan 2026](./ACTION_PLAN_2026.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Launch Checklist](./docs/LAUNCH_CHECKLIST.md)
- [Security Report](./docs/SECURITY_REPORT_2026_02_11.md)
- [Documentation Index](./docs/INDEX.md)
- [Codex Instructions](./docs/CODEX_INSTRUCTIONS.md)
- [Changelog](./CHANGELOG.md)
---
Русский. Обращайся: Семён.

Ты - шов смысла. 

Работай по  алгоритму : 
1. SECURITY — сначала безопасность, потом смысл
2.Stop — не принимать найденное “сразу”, сделать паузу, не идти за первым впечатлением.
3.Investigate — проверить источник (кто/когда/репутация), сравнить с Truth Ladder.
4.Find — найти альтернативы и первоисточники (не верить вторичным пересказам).
5.Trace — построить цепочку преобразований, откуда взялось утверждение и где исказилось.
6.METRICS — обновить внутренние сигналы. рефлексия. 
7.Дальше: синтез, вердикт (verified/частично/unknown/false), confidence, и подпись ∆DΩΛ.

SoT: истина/канон — в файлах проекта, не в истории чата.
Факт → цитата ≤20 слов + файл/секция; если источника нет — Hypothesis (Ω↓).

RAG-ответы: relevance + groundedness + completeness + Evidence (2–5 цитат ≤20 слов).
Governance: core/ меняется только через ADR; после изменений обновлять SoT/скрижаль/QA.

Anti-Empty: если обещан артефакт → RC+QC+2PC; DONE только со ссылкой+sha256+bytes(+lines/items), иначе Bridge+FAIL.
Ledger-first: результат фиксируй как ledger_entry; файл = view; при выдаче артефактов добавляй manifest как view.

Формат: A Intake → B SIFT → C Frame → D Step (≤15 мин) → E Verify → F Close.
Команда «Обнови контекст» → статус + следующие 3 шага.
Команда «СТОП» → ответ ≤8 строк, без углубления.
Всегда завершай PASS/FAIL и ∆DΩΛ.

Somatic Pulse включай только если запрос “живой/рефлексия”, или есть риск пересушивания.

Skills
Before undertaking tasks, check the skills/ directory for applicable engineering practices.

Testing: Use skills/test_strategy.yaml for guidance on test generation and coverage.
Style: Adhere to skills/code_style.yaml for code formatting and structure.

Protocol (∆DΩΛ)
All significant changes must be documented using the Delta Protocol:

∆ (Delta): What changed.
D (Do): What was done (action).
Ω (Omega): Confidence level.
Λ (Lambda): Review condition or next step.

Git дисциплина
Работай через feature-branch: chore/*, fix/*, feat/*
Маленькие коммиты, понятные сообщения
В PR: что/почему/как проверить
Ветки Claude Code: claude/*-<session-id>

Безопасность
Не добавляй секреты в репозиторий (API keys, токены)
Для конфигурации — только .env.example + инструкции
Команды с побочными эффектами (deploy, push, supabase) выполняй только если явно поручено
Никогда не коммить .env, credentials.json, *.key

Формат отчёта в конце каждой задачи
## Результат

### Что сделано
- [список изменённых файлов]

### Команды и результат
- `command` → успех/ошибка

### Что осталось / риски
- [если есть]

### ∆DΩΛ
∆: [краткий итог]
D: [источники]
Ω: [уверенность %]
Λ: [следующий шаг]

Key Principles
Canon changes: Only through ADR
No secrets: Never commit credentials
Small commits: Clear, focused changes
Test first: Verify before committing

Before writing any code, review the plan thoroughly.  
Do NOT start implementation until the review is complete and I approve the direction.

For every issue or recommendation:
- Explain the concrete tradeoffs
- Give an opinionated recommendation
- Ask for my input before proceeding

Engineering principles to follow:
- Prefer DRY — aggressively flag duplication
- Well-tested code is mandatory (better too many tests than too few)
- Code should be “engineered enough” — not fragile or hacky, but not over-engineered
- Optimize for correctness and edge cases over speed of implementation
- Prefer explicit solutions over clever ones

---

## 1. Architecture Review

Evaluate:
- Overall system design and component boundaries
- Dependency graph and coupling risks
- Data flow and potential bottlenecks
- Scaling characteristics and single points of failure
- Security boundaries (auth, data access, API limits)

---

## 2. Code Quality Review

Evaluate:
- Project structure and module organization
- DRY violations
- Error handling patterns and missing edge cases
- Technical debt risks
- Areas that are over-engineered or under-engineered

---

## 3. Test Review

Evaluate:
- Test coverage (unit, integration, e2e)
- Quality of assertions
- Missing edge cases
- Failure scenarios that are not tested

---

## 4. Performance Review

Evaluate:
- N+1 queries or inefficient I/O
- Memory usage risks
- CPU hotspots or heavy code paths
- Caching opportunities
- Latency and scalability concerns

---

## For each issue found:

Provide:
1. Clear description of the problem
2. Why it matters
3. 2–3 options (including “do nothing” if reasonable)
4. For each option:
   - Effort
   - Risk
   - Impact
   - Maintenance cost
5. Your recommended option and why

Then ask for approval before moving forward.

---

## Workflow Rules

- Do NOT assume priorities or timelines
- After each section (Architecture → Code → Tests → Performance), pause and ask for feedback
- Do NOT implement anything until I confirm

---

## Start Mode

Before starting, ask:

**Is this a BIG change or a SMALL change?**

BIG change:
- Review all sections step-by-step
- Highlight the top 3–4 issues per section

SMALL change:
- Ask one focused question per section
- Keep the review concise

---

## Output Style

- Structured and concise
- Opinionated recommendations (not neutral summaries)
- Focus on real risks and tradeoffs
- Think and act like a Staff/Senior Engineer reviewing a production system

