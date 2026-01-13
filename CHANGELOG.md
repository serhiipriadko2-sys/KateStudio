# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-01-13

### Added

- **Jules Platform Architecture**: Introduced `skills/` directory and
  orchestration workflows for autonomous agent operations.
- **Skill Runner**: Added `scripts/jules-skill-runner.ts` for local execution of
  agent skills (audit, test gen).
- **Environment Helper**: Added `scripts/setup-prod-env.sh` to streamline
  production configuration.
- **Image Registry**: Centralized external assets in
  `shared/constants/images.ts`.

### Changed

- **Refactoring**: Split `shared/constants/index.ts` into modular files
  (`brand.ts`, `pricing.ts`, `contact.ts`, etc.) for better maintainability.
- **Dependencies**: Updated all npm packages to latest compatible versions
  (React 19, Vite 6, etc.).
- **Linting**: Enhanced ESLint configuration with
  `eslint-import-resolver-typescript` for better monorepo support.
- **Documentation**: Overhauled `README.md` and added
  `docs/JULES_ARCHITECTURE.md`.

### Fixed

- **Code Style**: Resolved numerous import order and type safety warnings.
- **Resilience**: Added graceful degradation for Payment features in the
  frontend when provider is unconfigured.
