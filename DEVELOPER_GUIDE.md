# Developer Quick Start Guide

Welcome to the K Sebe Yoga Studio ecosystem! This guide will help you get up and
running quickly.

## Prerequisites

- Node.js 18+ (check with `node --version`)
- npm 9+ (check with `npm --version`)
- Git (check with `git --version`)

## Quick Setup

```bash
# Clone the repository
git clone https://github.com/serhiipriadko2-sys/KateStudio.git
cd KateStudio

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your keys (Supabase, Gemini API)

# Start development servers
npm run dev:web    # Landing page (WEB)
npm run dev:app    # PWA application (APP)
```

## Project Structure

```
KateStudio/
├── shared/                   # Shared library (@ksebe/shared)
│   ├── components/          # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and backend services
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utility functions
│   └── constants/          # Brand constants
│
├── k-sebe-yoga-studioWEB/   # Landing page / Marketing site
│   ├── components/         # WEB-specific components
│   ├── services/           # WEB-specific services
│   └── public/             # Static assets
│
└── k-sebe-yoga-studio-APPp/ # Mobile-first PWA application
    ├── components/         # APP-specific components
    ├── services/           # APP-specific services
    ├── context/            # React Context providers
    └── public/             # Static assets + PWA manifest
```

## Common Tasks

### Running Tests

```bash
npm test              # Run all tests
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage
npm run test:ui       # Run tests with UI
```

### Code Quality

```bash
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
npm run format        # Format code with Prettier
npm run typecheck     # Check TypeScript types
```

### Building

```bash
npm run build:web     # Build WEB
npm run build:app     # Build APP
npm run build:all     # Build both
```

## Working with Shared Library

The `shared/` directory contains code shared between WEB and APP:

```typescript
// Import from shared library
import { Logo, FadeIn, useScrollLock } from '@ksebe/shared';
import { supabase } from '@ksebe/shared';
import { COLORS, BRAND } from '@ksebe/shared';
import type { UserProfile, ClassSession } from '@ksebe/shared';
```

### Adding a New Shared Component

1. Create component: `shared/components/MyComponent.tsx`
2. Export from: `shared/components/index.ts`
3. Use in WEB/APP: `import { MyComponent } from '@ksebe/shared'`

### Adding a New Type

1. Add to: `shared/types/index.ts`
2. Export is automatic via `shared/index.ts`

## Key Conventions

### TypeScript

- Always use explicit types
- Strict mode is enabled
- Use interfaces over types for objects

### Components

- Functional components only (no class components)
- Use hooks for state and effects
- Keep components under 300 lines
- Extract logic to custom hooks

### Styling

- Use Tailwind utility classes
- Brand colors: `brand-green`, `brand-mint`, `brand-yellow`
- Responsive: mobile-first approach

### Logging

```typescript
import { logger } from '@ksebe/shared';

logger.info('User logged in', { userId: user.id });
logger.error('Failed to fetch data', error, { endpoint: '/api/users' });
logger.debug('Debug info', { data });
```

See [Logger README](./shared/utils/LOGGER_README.md) for more details.

## Environment Variables

### Required for WEB and APP

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key (for local dev only)
```

### Optional

```env
VITE_ENABLE_MOCK_DATA=true        # Use mock data instead of API
VITE_LOG_LEVEL=debug              # Set log level
```

## Common Issues

### Import Errors

If you see import errors after adding shared code:

```bash
# Rebuild shared library
cd shared && npm run build

# Or restart dev server
npm run dev:web  # or dev:app
```

### Port Already in Use

```bash
# Kill process on port 5173 (WEB)
lsof -ti:5173 | xargs kill -9

# Kill process on port 5174 (APP)
lsof -ti:5174 | xargs kill -9
```

### Type Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run typecheck
```

## Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Create Pull Request on GitHub
5. Code review and merge

### Commit Message Format

```
<type>: <description>

Examples:
feat: Add user profile component
fix: Fix booking modal validation
docs: Update README with setup instructions
style: Format code with Prettier
refactor: Split Dashboard component
test: Add tests for logger utility
chore: Update dependencies
```

## Resources

- [Full Documentation](./README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Architecture Overview](./CLAUDE.md)
- [Roadmap](./ROADMAP.md)
- [Current Tasks](./CURRENT_TASKS.md)

## Getting Help

- Check [CLAUDE.md](./CLAUDE.md) for AI assistant context
- Review existing code for patterns
- Ask in team chat or create GitHub issue

## Next Steps

1. ✅ Set up development environment
2. ✅ Run WEB and APP locally
3. ✅ Explore the codebase
4. 📖 Read [ECOSYSTEM_AUDIT.md](./ECOSYSTEM_AUDIT.md) for context
5. 📖 Check [CURRENT_TASKS.md](./CURRENT_TASKS.md) for open tasks
6. 🚀 Pick a task and start coding!

---

**Happy Coding! 🧘‍♀️✨**
