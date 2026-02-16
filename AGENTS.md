# K Sebe Yoga Studio - Agent Guidelines

This document serves as the **primary source of truth** for all AI agents and developers working on the K Sebe Yoga Studio ecosystem. It supersedes all previous instructions.

## 1. Project Structure & Monorepo

The repository is a Monorepo managed with npm workspaces.

- **`shared`** (`@ksebe/shared`):
  - Contains reusable UI components, hooks, services, types, and utilities.
  - **Rule**: All shared code must be exported from here. Do not duplicate logic between apps.
  - **Build**: Uses `tsc -b` (composite project).
  - **Styling**: Uses a shared Tailwind preset (`shared/styles/tailwind.preset.js`).

- **`k-sebe-yoga-studioWEB`** (WEB):
  - The marketing landing page and main web portal.
  - Deployed to GitHub Pages / Firebase Hosting.

- **`k-sebe-yoga-studio-APPp`** (APP):
  - Mobile-first PWA for students (booking, videos, AI coach).
  - Designed for offline-first usage (IndexedDB/localStorage).

- **`supabase`**:
  - Contains backend logic: Database migrations, Edge Functions, seed data.

## 2. Supabase Architecture

**Strict Rule**: We use Supabase as our backend-as-a-service.

### Authentication & RLS
- **RLS is Mandatory**: Every table must have Row Level Security enabled.
- **Policies**:
  - `public` tables (e.g., `articles`, `classes`) are generally readable by `anon`.
  - User-specific tables (e.g., `bookings`, `user_profiles`) must be restricted to `auth.uid()`.
  - Admin access is controlled via the `public.admins` table and `is_admin()` function.

### Edge Functions
- **AI Operations**: All AI interactions (Gemini, Vision, etc.) **MUST** go through the `gemini-proxy` Edge Function.
  - **NEVER** expose the Gemini API key in client-side code (`VITE_GEMINI_API_KEY` is deprecated/removed).
  - Use `supabase.functions.invoke('gemini-proxy', ...)`.
- **Payments**: All payment processing (YooKassa/Stripe) must be handled via Edge Functions (`create-payment`, `payment-webhook`).
- **Secrets**: Store API keys in Supabase Secrets, never in the codebase.

## 3. Technology Stack & Standards

### Frontend
- **Framework**: React 19 + Vite 6.
- **Language**: TypeScript 5.8 (Strict Mode).
- **Styling**: Tailwind CSS v3 (migrating to v4).
  - Use `clsx` or `tailwind-merge` for class conditional logic.
  - Follow the design system in `shared/styles`.
- **State Management**:
  - **Server State**: `@tanstack/react-query` (v5). Use for all data fetching.
  - **Client State**: React Context (minimal usage) or `zustand` (if needed, currently mostly Context).

### Testing
- **Runner**: Vitest.
- **Integration**: `@testing-library/react`.
- **Mocking**:
  - Mock `supabase-js` calls using `vi.mock`.
  - Mock Edge Functions responses.
  - Use `vi.hoisted` for top-level mocks.
- **Command**: `npm run test:run` (runs all workspaces).

### Linting & Formatting
- **Linter**: ESLint (Flat Config).
- **Formatter**: Prettier.
- **Pre-commit**: Husky runs `lint-staged`.
- **Rule**: No `console.log` in production code. Use a logging utility or suppress if necessary.

## 4. Development Workflow

### Branching
- `main`: Production-ready code.
- `dev` / `feature/*`: Development branches.
- **Commit Messages**: Follow Conventional Commits (e.g., `feat: add booking modal`, `fix: resolve cors issue`).

### Creating New Features
1. **Plan**: Analyze requirements and existing code.
2. **Shared First**: If a component is reusable, build it in `shared` first.
3. **Implementation**: Build in the specific workspace (WEB or APP).
4. **Test**: Write unit tests for logic and components.
5. **Verify**: Run linting and typechecking before committing.

### Modifying Database
1. Create a migration file in `supabase/migrations` (timestamped).
2. Apply locally: `supabase db reset` or `supabase migration up`.
3. Update types: `supabase gen types typescript --local > shared/types/supabase.ts`.

## 5. Deployment

- **WEB**: Automatically deployed via GitHub Actions to GitHub Pages.
- **APP**: Manual build/deploy (currently) or automated via workflow.
- **Edge Functions**: Deploy via `supabase functions deploy <name>`.

## 6. Important Context (Memory)

- **Admin Panel**: Located in `k-sebe-yoga-studioWEB`. Protected by `LoginScreen`.
- **Images**: stored in `public/images` and mapped via `app_settings`.
- **AI Coach**: Aria (Gemini) is a core differentiator. Ensure prompt engineering is maintained in the Edge Function.

---

**Remember**: Code quality, security, and user experience are paramount. "To Yourself" (K Sebe) implies mindfulness—reflect that in your code.
