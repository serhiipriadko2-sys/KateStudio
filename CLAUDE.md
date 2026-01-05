# CLAUDE.md - AI Agent Instructions

This file provides context and instructions for AI assistants (Claude, GitHub
Copilot, Cursor, etc.) working with the KateStudio codebase.

## Project Overview

**K Sebe Yoga Studio** ("К себе" - "To Yourself") is an InsideFlow yoga
ecosystem created for Katya Gabran's yoga studio. The project consists of two
main applications sharing a common library.

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

| File                          | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `shared/types/index.ts`       | All TypeScript interfaces                |
| `shared/constants/index.ts`   | Brand constants, API endpoints           |
| `shared/utils/index.ts`       | Utility functions (cn, formatDate, etc.) |
| `shared/services/supabase.ts` | Supabase client configuration            |
| `.env.example`                | Required environment variables           |

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
- **Address**: Станционная ул., 5Б, Дубна, 141981 (этаж 2)
- **Instagram**: @kate_gabran
- **Telegram**: @k_sebe_dubna
- **Yandex Maps**: https://yandex.ru/navi/org/k_sebe/7167334007

---

**Remember**: This is a passion project for a yoga studio. Prioritize:

- Clean, maintainable code
- Accessible design (WCAG 2.1 AA)
- Mobile-first responsive layouts
- Calm, mindful user experience

## 2026 Updates and Best Practices

### Latest Research (January 2026)

The project has been comprehensively analyzed against 2026 industry trends. See
[DEEP_ANALYSIS_2026.md](./docs/DEEP_ANALYSIS_2026.md) for full details.

#### Key Findings

**Inside Flow Ecosystem:**

- 10,000+ certified teachers globally
- Elite Training Frankfurt (May-June 2026)
- Annual licensing model (€108/year)
- Strong emphasis on emotional storytelling and music integration

**AI Trends:**

- Gemini 2.5: Deep Think mode, 1M token context, native audio I/O
- Real-time computer vision for pose correction
- Hyper-personalization through ML
- Voice coaching becoming standard

**Monetization:**

- Freemium conversion: 6-8% (top tier)
- Subscription: Primary revenue model ($10-15/month)
- Gamification: +50% retention improvement
- Community features: +50% retention

**Tech Stack Updates:**

- React 19: Automatic memoization, improved batching
- Vite 6: Smarter HMR, 40% faster builds
- TypeScript 5.8: Granular checks, better performance
- Tailwind 4 (beta): 5-10x faster builds with Oxide engine

### Critical Security Priorities

⚠️ **URGENT:** API keys currently exposed in client-side code

1. **Implement Edge Function Proxy**

   ```
   Create: supabase/functions/gemini-proxy/index.ts
   Move GEMINI_API_KEY to Supabase secrets
   Update: WEB & APP geminiService.ts to use proxy
   ```

2. **Add Rate Limiting**

   ```
   Per-user limits: 100 requests/hour
   Track via Supabase user_id
   Implement exponential backoff
   ```

3. **Input Validation**
   ```
   Sanitize all user inputs
   Prevent prompt injection attacks
   Add content moderation
   ```

### Gamification Strategy (Proven ROI)

**Priority 1: Streaks** (+30-40% DAU)

- Already have StreakCard component
- Add streak notifications
- Calendar visualization
- Streak recovery mechanism

**Priority 2: Achievements** (+20-25% engagement)

- 10 baseline achievements (see DEEP_ANALYSIS_2026.md)
- Achievement unlock animations
- Social sharing integration
- Progress tracking

**Priority 3: Push Notifications** (Essential for retention)

- Firebase Cloud Messaging setup
- Notification types: streak reminders, new content, achievements
- User preferences management
- Optimal timing (9AM default)

### Monetization Roadmap

**Recommended Pricing (Russia):**

```
Free:     0₽      - AI Chat (100 msg/day), 3 videos/week
Premium:  990₽/mo - All videos, offline, AI programs
VIP:      2,990₽  - Premium + consultations with Katya (2/month)
```

**Implementation:**

```
Q1 2026: YooKassa (Russia) + Stripe (international)
Q2 2026: Optimize conversion with A/B testing
Target:  8% conversion rate by Q4 2026
```

### AI Differentiation

**Unique Competitive Advantages:**

1. ✅ Inside Flow specialization (vs. generic yoga apps)
2. ✅ AI Vision analysis (Gemini 2.5 Pro)
3. ✅ Personal brand (Katya Gabran)
4. ✅ Russian language native support
5. 🔄 Daily AI recommendations (planned)
6. 🔄 7-day personalized programs (planned)

### Performance Targets 2026

| Metric             | Current | Q4 2026 Target |
| ------------------ | ------- | -------------- |
| Lighthouse Score   | 75      | 90+            |
| Test Coverage      | 50%     | 70%+           |
| Bundle Size (gzip) | ~300KB  | <200KB         |
| LCP                | ~3s     | <2.5s          |

### Development Workflow

**Before Making Changes:**

1. Check existing tests: `npm run test:run`
2. Run type check: `npm run typecheck`
3. Run linter: `npm run lint`

**When Adding AI Features:**

1. Use Edge Functions proxy (security)
2. Implement rate limiting
3. Add error handling and fallbacks
4. Cache responses where possible
5. Monitor usage and costs

**When Adding Gamification:**

1. Track engagement metrics
2. A/B test mechanics
3. Balance fun vs. pressure
4. Provide opt-out options

### Code Patterns 2026

**React 19:**

```typescript
// Automatic memoization (no React.memo needed)
function VideoCard({ video }: { video: Video }) {
  return <div>{video.title}</div>;
}

// useOptimistic for optimistic updates
function AddBooking() {
  const [optimisticBookings, addOptimistic] = useOptimistic(
    bookings,
    (state, newBooking) => [...state, newBooking]
  );
}
```

**Error Boundaries:**

```typescript
// Already have ErrorBoundary in shared
import { ErrorBoundary } from '@ksebe/shared';

<ErrorBoundary fallback={<ErrorView />}>
  <YourComponent />
</ErrorBoundary>
```

**Offline-First:**

```typescript
// Already implemented with IndexedDB
import { storage } from '@ksebe/shared';

// Check online status
import { useOnlineStatus } from '@ksebe/shared';
const isOnline = useOnlineStatus();
```

### Resources

- [Strategic Roadmap 2026](./STRATEGIC_ROADMAP_2026.md)
- [Deep Analysis 2026](./docs/DEEP_ANALYSIS_2026.md)
- [Action Plan 2026](./ACTION_PLAN_2026.md)
- [Architecture](./docs/ARCHITECTURE.md)
