# CLAUDE.md - AI Agent Instructions

This file provides context and instructions for AI assistants (Claude, GitHub Copilot, Cursor, etc.) working with the KateStudio codebase.

## Project Overview

**K Sebe Yoga Studio** ("К себе" - "To Yourself") is an InsideFlow yoga ecosystem created for Katya Gabran's yoga studio. The project consists of two main applications sharing a common library.

### Architecture

```
KateStudio/
├── shared/                    # Shared library (@ksebe/shared)
│   ├── components/           # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and backend services
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Utility functions
│   ├── constants/           # Brand constants
│   └── styles/              # Tailwind preset
├── k-sebe-yoga-studioWEB/    # Landing page / Marketing site
└── k-sebe-yoga-studio-APPp/  # Mobile-first PWA application
```

### Tech Stack

- **Frontend**: React 19.2, TypeScript 5.8, Vite 6.2
- **Styling**: Tailwind CSS with custom preset
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini API (Chat, Vision, TTS, Image Generation)
- **Package Management**: npm workspaces (monorepo)

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

| File | Purpose |
|------|---------|
| `shared/types/index.ts` | All TypeScript interfaces |
| `shared/constants/index.ts` | Brand constants, API endpoints |
| `shared/utils/index.ts` | Utility functions (cn, formatDate, etc.) |
| `shared/services/supabase.ts` | Supabase client configuration |
| `.env.example` | Required environment variables |

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
const { data: { user } } = await supabase.auth.getUser();

// Database query
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', user.id);
```

### Working with Gemini AI

```typescript
import { geminiService } from '@app/services/geminiService';

// Chat
const response = await geminiService.chat(messages, mode);

// Image analysis
const analysis = await geminiService.analyzeAsana(imageBase64);

// Text-to-speech
const audioUrl = await geminiService.textToSpeech(text);
```

## Domain Knowledge

### Inside Flow Yoga

Inside Flow is a modern yoga style created by Young Ho Kim that combines:
- Vinyasa flow movements synchronized with music
- Emotional expression through movement
- Breath-to-beat coordination
- Contemporary music integration

### Key Features

1. **AI Coach (Aria)**: Gemini-powered assistant for yoga guidance
2. **Video Library**: Curated Inside Flow classes
3. **Schedule**: Class booking with Supabase backend
4. **Breathwork**: Square breathing and pranayama exercises
5. **Blog**: Articles about yoga, wellness, mindfulness

### User Personas

- **Primary**: Women 25-45 interested in yoga and mindfulness
- **Secondary**: Yoga practitioners looking for Inside Flow content
- **Tertiary**: Complete beginners seeking gentle introduction to yoga

## Testing

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run format      # Prettier
npm run test        # Run tests (when configured)
```

## Deployment

- **WEB**: Deployed via GitHub Pages (deploy-pages.yml workflow)
- **APP**: PWA deployable to any static hosting

## Security Notes

- Never commit `.env` files
- API keys stored in GitHub Secrets
- Supabase RLS policies protect user data
- Gemini API key is client-side (rate limited)

## Contact

- **Studio Owner**: Katya Gabran
- **Website**: k-sebe-yoga.com (placeholder)
- **Instagram**: @k_sebe_yoga

---

**Remember**: This is a passion project for a yoga studio. Prioritize:
- Clean, maintainable code
- Accessible design (WCAG 2.1 AA)
- Mobile-first responsive layouts
- Calm, mindful user experience
