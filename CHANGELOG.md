# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2026-02-21

### Changed

- **CLAUDE.md**: Updated to v3.2.0 — fixed scripts count (3→4), verified all
  metrics against codebase
- **AGENTS.md**: Updated to v2.1.0 — refreshed Codex priorities (P0 security
  all resolved), updated date
- **CURRENT_TASKS.md**: Marked Zod validation (#10) and Rate limiting (#11) as
  completed (already implemented in gemini-proxy)
- **docs/CODEX_INSTRUCTIONS.md**: Marked Zod and Rate limiting as resolved
- **docs/INDEX.md**: Updated to v6.1.0 — added Zod/Rate limiting to completed
  items, updated version

## [2.0.0] - 2026-02-16

### Added

- **Skills**: `security_scanner.yaml` — checks PRs for leaked secrets and
  unsafe patterns
- **Skills**: `doc_sync.yaml` — validates documentation freshness and internal
  links
- **Docs**: Security Report (Feb 2026) — all P0 security blockers resolved
- **Docs**: Comprehensive Audit (Feb 2026) — full ecosystem audit

### Changed

- **CLAUDE.md**: Major update (v3.0.0) — expanded architecture diagram,
  security model, current priorities, gamification, monetization, performance
  targets
- **AGENTS.md**: Rewritten (v2.0.0) — multi-agent architecture with Claude
  Code, Jules, Codex, Copilot, Cursor support
- **skills/registry.json**: Updated to v2.0.0 — added 2 new skills (4 total),
  added descriptions
- **CURRENT_TASKS.md**: Refreshed — marked P0 security items as resolved,
  updated production readiness score (68 → 75)
- **docs/INDEX.md**: Updated to v6.0.0 — added security section, AI agents
  section, current metrics
- **docs/CODEX_INSTRUCTIONS.md**: Updated priorities reflecting resolved
  security items
- **CONTRIBUTING.md**: Updated Node.js requirement to 22+
- **DEVELOPER_GUIDE.md**: Updated Node.js requirement, added AGENTS.md
  reference

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
  https://github.com/serhiipriadko2-sys/KateStudio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/serhiipriadko2-sys/KateStudio/releases/tag/v1.0.0
