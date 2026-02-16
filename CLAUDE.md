# K Sebe Yoga Studio - Assistant Context

## Project Overview
- **Name**: "K Sebe" (To Yourself) Yoga Studio
- **Stack**: React 19, Vite 6, TypeScript 5.8, Tailwind CSS, Supabase (Auth, DB, Edge Functions), Vitest.
- **Monorepo**:
  - `shared`: Common components/hooks (`@ksebe/shared`)
  - `k-sebe-yoga-studioWEB`: Marketing & Admin Panel
  - `k-sebe-yoga-studio-APPp`: Mobile PWA (Offline-first)

## Core Commands

### Development
- `npm run dev:web` - Start Web workspace
- `npm run dev:app` - Start App workspace

### Building
- `npm run build:all` - Build both workspaces
- `npm run typecheck` - Run `tsc -b` (Project-wide)

### Testing & Quality
- `npm run test:run` - Run all Vitest tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier

### Database
- `supabase migration up` - Apply migrations locally
- `supabase gen types typescript --local > shared/types/supabase.ts` - Update types

## Architecture Highlights
- **AI**: Gemini integration via `gemini-proxy` Edge Function only. No client keys.
- **Auth**: Supabase Auth (RLS mandatory).
- **State**: React Query + Context.
- **Styling**: Tailwind CSS (Utility-first).

## Thinking Process Guidelines
1. **Understand**: Read `AGENTS.md` and related files first.
2. **Plan**: Outline steps before writing code.
3. **Verify**: Use `list_files`, `read_file` to confirm state.
4. **Test**: Prefer TDD where possible. Run tests after changes.
5. **Secure**: No secrets in code. Use Edge Functions for sensitive ops.

## Common Paths
- `shared/components`: Reusable UI
- `supabase/functions`: Edge Functions
- `k-sebe-yoga-studioWEB/components/admin`: Admin Panel
- `k-sebe-yoga-studio-APPp/components/AICoach`: Gemini logic
