# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [3.0.0] - 2026-03-15

### Added

- **Edge Functions**: 4 новых функции — `cancel-subscription`, `cron-maintenance`, `send-push`, `subscribe-newsletter`
  - `cancel-subscription` — отмена подписки через YooKassa API
  - `cron-maintenance` — плановое обслуживание БД (очистка, архивация)
  - `send-push` — отправка Firebase Cloud Messaging (FCM) пуш-уведомлений
  - `subscribe-newsletter` — подписка на рассылку через Mailchimp
- **Gamification**: `DailyRecommendation` компонент с персонализированными рекомендациями
- **Gamification**: `StreakCalendar` — визуализация активности с heat-map
- **APP**: `Achievements` экран с разблокированными ачивками
- **APP**: `Retreats` компонент для секции ретритов
- **APP**: `DeveloperSettings` экран для отладки (dev-only)
- **AI Coach**: `AICoach` компонент с режимами Chat, Create, Meditation
- **Analytics**: `analytics_rpc` — RPC функция для агрегации аналитики
- **Migrations** (март 2026):
  - `20260312000001_faq_items.sql` — таблица FAQ
  - `20260312000002_site_images.sql` — управление изображениями сайта
  - `20260315000000_retreats_table.sql` — таблица ретритов
  - `20260315000001_admin_subscriptions_rls.sql` — RLS для подписок (admin)
  - `20260315000002_analytics_rpc.sql` — RPC агрегации аналитики
  - `20260315000003_grant_is_admin_execute.sql` — разрешение execute для `is_admin`
- **Tests**: 473 тестов / 60 suites (было 208/36 — рост ×2.3)
  - Новые тест-файлы: `AuthContext`, `AuthScreen`, `retentionService`, `subscriptionService`, `useStreak`, `useIsAdmin`, `geminiService`, `videoService`, утилиты `practiceLog`

### Changed

- **gemini-proxy**: Добавлены операции `editYogaImage` (Imagen 3 edit) и `generateYogaVideo` (Veo) — 12 операций итого
- **gemini-proxy**: Zod-валидация на всех входящих запросах через `ProxyRequestSchema`
- **APP VideoLibrary**: Видео читаются из Supabase DB через `videoService` (не хардкод)
- **APP Dashboard**: Subscription UI временно скрыт (`// re-enable after launch`)
- **shared/constants/images.ts**: Все URL — локальные ассеты (`/images/*`), внешние placeholder полностью убраны
- **APP**: Расписание (`Schedule`) интегрировано с Supabase с fallback на mock

### Fixed

- **Migrations**: `analytics_events` RLS — исправлена ссылка `admins.id` → `admins.user_id` (20260309000001)
- **Migrations**: `profiles` update policy — убрана ссылка на удалённую колонку `is_admin` (20260309000002)
- **shared/types**: `SubscriptionStatus` — исправлен вариант `'canceled'` (не `'cancelled'`), добавлен `'pending'`
- **shared/components/index.ts**: Убран дубль экспорта `AsanaAnalysis`

### Security

- **RLS**: Исправлена политика `analytics_events` (admins.user_id вместо admins.id)
- **RLS**: Новая политика `admin_subscriptions` — только service role может обновлять подписки
- **Edge Functions**: Zod input validation на всех операциях gemini-proxy

---

## [2.1.0] - 2026-02-27

### Added

- **Native/Capacitor**: Full Capacitor wrapper scaffold for Android/iOS builds
  - `k-sebe-yoga-studio-APPp/native/platform.ts` — platform detection utilities
    (`isNative`, `isIOS`, `isAndroid`, `isWeb`, `getPlatform`, `hasNotch`,
    `applyPlatformClasses`)
  - `k-sebe-yoga-studio-APPp/native/plugins.ts` — native plugin initializers:
    StatusBar, SplashScreen, Keyboard, App lifecycle, Network, Haptics
  - `k-sebe-yoga-studio-APPp/native/index.ts` — `initNative()` / `nativeReady()`
    entry points; Android back button, app resume/pause CustomEvents
  - `k-sebe-yoga-studio-APPp/hooks/useNative.ts` — React hook exposing platform
    info, network status, and haptic feedback utilities
  - `k-sebe-yoga-studio-APPp/capacitor.config.ts` — SplashScreen & StatusBar
    config
- **Capacitor plugins** added to `package.json`: `@capacitor/app`,
  `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/network`,
  `@capacitor/splash-screen`, `@capacitor/status-bar`
- **CSS safe-area utilities** in `index.css`: `.pt-safe`, `.pb-safe`,
  `.pl-safe`, `.pr-safe`, `.top-safe`, `.bottom-safe`, `.mb-safe`, `.mt-safe`,
  `.min-h-safe-bottom`, `--keyboard-height`, keyboard-aware layout, platform
  class overrides (`is-ios`, `is-android`)
- **Haptic feedback** integrated into key app interactions:
  - `App.tsx`: tab navigation (`hapticLight`), IntroSplash hold start
    (`hapticLight`), completion (`hapticSuccess`)
  - `BookingModal`: submit (`hapticLight`), success (`hapticSuccess`), errors
    (`hapticError`), close button (`hapticLight`)
- **Android/iOS build scripts** in `package.json`: `build:mobile`,
  `build:mobile:ios`, `cap:sync`, `cap:add:*`, `cap:open:*`

### Changed

- **WEB `BookingModal`**: Replaced direct booking form with Telegram CTA
  pointing to `@Kate_Gabran` — reduces friction, aligns with studio workflow
- **WEB**: Telegram link updated from channel to personal `@Kate_Gabran`
- **APP `index.tsx`**: `initNative()` runs synchronously pre-render;
  `nativeReady()` called in `requestAnimationFrame` to hide splash after first
  paint

### Fixed

- **CI**: Capacitor plugin versions corrected from `^7.4.3` (non-existent) to
  `^7.0.0` — `npm ci` now resolves across all workspaces
- **TypeScript**: Removed 4 invalid fields from `capacitor.config.ts` that
  caused type errors (`handleApplicationNotifications`, `captureInput`,
  `animation`, string literals where enums required)
- **Prettier**: Auto-formatted 12 files with accumulated style drift
- **ESLint**: Fixed `import/order` warnings in all new native files

---

## [2.0.0] - 2026-02-16

### Added

- **Skills**: `security_scanner.yaml` — checks PRs for leaked secrets and unsafe
  patterns
- **Skills**: `doc_sync.yaml` — validates documentation freshness and internal
  links
- **Docs**: Security Report (Feb 2026) — all P0 security blockers resolved
- **Docs**: Comprehensive Audit (Feb 2026) — full ecosystem audit

### Changed

- **CLAUDE.md**: Major update (v3.0.0) — expanded architecture diagram, security
  model, current priorities, gamification, monetization, performance targets
- **AGENTS.md**: Rewritten (v2.0.0) — multi-agent architecture with Claude Code,
  Jules, Codex, Copilot, Cursor support
- **skills/registry.json**: Updated to v2.0.0 — added 2 new skills (4 total),
  added descriptions
- **CURRENT_TASKS.md**: Refreshed — marked P0 security items as resolved,
  updated production readiness score (68 → 75)
- **docs/INDEX.md**: Updated to v6.0.0 — added security section, AI agents
  section, current metrics
- **docs/CODEX_INSTRUCTIONS.md**: Updated priorities reflecting resolved
  security items
- **CONTRIBUTING.md**: Updated Node.js requirement to 22+
- **DEVELOPER_GUIDE.md**: Updated Node.js requirement, added AGENTS.md reference

### Security

- Payment webhook secret validation: resolved (HMAC verification)
- Subscriptions RLS policy: resolved (user self-update blocked)
- CORS restrictions: resolved (domain whitelist, no wildcard)
- API key fallback removal: resolved (Edge Function proxy only)
- Service Role Key enforcement: resolved (no anon fallback)

## [1.1.0] - 2026-01-20

### Added

- Edge Function proxy for Gemini API with rate limiting
- Payment Edge Functions (create-payment, payment-webhook)
- PWA icons (72px-512px) and og-image.jpg
- Centralized asset management (shared/constants/images.ts)
- Gamification: StreakCard, StreakCalendar, AchievementsGrid, 20+ achievements
- OnboardingQuiz component
- NotificationPreferences component
- `.env.example` for APP workspace
- robots.txt and sitemap.xml for APP
- Landing page tests (Reviews, Retreats, Blog)
- Complete GitHub infrastructure (CI/CD, templates, dependabot)
- CLAUDE.md for AI agent instructions
- CONTRIBUTING.md with contribution guidelines
- SECURITY.md with security policy
- CODE_OF_CONDUCT.md
- VSCode workspace configuration
- EditorConfig for consistent coding style
- Docker development environment
- Vitest testing framework

### Changed

- Refactored ChatWidget into sub-components (ChatInput, ChatMessages,
  AudioVisualizer)
- Updated README.md with badges and comprehensive documentation
- Enhanced LICENSE with studio information
- Fixed `any` types in shared/utils
- Fixed unused variables and a11y warnings
- Updated sitemap.xml dates to 2026

### Fixed

- ESLint import resolver configuration
- JSX quote escaping in Blog.tsx and Image.tsx

## [1.0.0] - 2024-12-14

### Added

#### Shared Library (@ksebe/shared)

- **Components**: FadeIn, Logo, Breathwork, Blog, Pricing
- **Hooks**: useScrollLock
- **Services**: Supabase client configuration
- **Types**: 25+ TypeScript interfaces
- **Utils**: cn, formatDate, formatPrice, pluralize, debounce, throttle, storage
- **Constants**: BRAND, COLORS, PRICING_PLANS, CONTACT, BREATHWORK_PRESETS
- **Styles**: Tailwind CSS preset with custom design tokens

#### WEB (k-sebe-yoga-studioWEB)

- Landing page with responsive design
- Hero section with animations
- About section
- Video library showcase
- Schedule preview
- Blog section
- Pricing section
- Contact form
- ChatWidget with Gemini AI integration
- Breathwork practice component

#### APP (k-sebe-yoga-studio-APPp)

- Mobile-first PWA application
- Dashboard with quick actions
- AI Coach (Aria) with multiple modes:
  - Chat mode
  - Vision mode (asana analysis)
  - Meditation generation
  - Art therapy
  - Personal programs
- Video library with categories
- Class schedule with booking
- Breathwork practices
- Blog with article reader
- User profile management

#### Infrastructure

- Monorepo structure with npm workspaces
- TypeScript configuration with path aliases
- ESLint + Prettier setup
- Husky pre-commit hooks
- GitHub Actions CI/CD
- GitHub Pages deployment

### Technical Details

- React 19.2.1
- TypeScript 5.8
- Vite 6.2
- Supabase 2.49
- Tailwind CSS 3.x
- Google Gemini API

---

## Release Notes Format

### Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

[Unreleased]:
  https://github.com/serhiipriadko2-sys/KateStudio/compare/v2.1.0...HEAD
[2.1.0]:
  https://github.com/serhiipriadko2-sys/KateStudio/compare/v2.0.0...v2.1.0
[2.0.0]:
  https://github.com/serhiipriadko2-sys/KateStudio/compare/v1.1.0...v2.0.0
[1.1.0]:
  https://github.com/serhiipriadko2-sys/KateStudio/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/serhiipriadko2-sys/KateStudio/releases/tag/v1.0.0
