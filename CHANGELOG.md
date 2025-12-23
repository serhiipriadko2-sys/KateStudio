# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

- Updated README.md with badges and comprehensive documentation
- Enhanced LICENSE with studio information

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
