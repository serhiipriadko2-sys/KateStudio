# Руководство по реализации обновлений 2026

> **Для разработчиков:** Практическое пошаговое руководство  
> **Дата:** 5 января 2026  
> **Статус:** Active Development

---

## Быстрый старт

### Приоритет 1: Безопасность (КРИТИЧНО)

#### Шаг 1: Создать Edge Function для Gemini API

**Файл:** `supabase/functions/gemini-proxy/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Rate limiting check
    const { data: rateLimit } = await supabaseClient
      .from('api_rate_limits')
      .select('count, reset_at')
      .eq('user_id', user.id)
      .eq('endpoint', 'gemini')
      .single();

    const now = new Date();
    const resetAt = rateLimit?.reset_at ? new Date(rateLimit.reset_at) : null;

    if (resetAt && now < resetAt && (rateLimit?.count ?? 0) >= 100) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request
    const { prompt, model, mode } = await req.json();

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.length > 10000) {
      throw new Error('Invalid prompt');
    }

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash-exp'}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();

    // Update rate limit
    const newResetAt =
      resetAt && now < resetAt
        ? resetAt
        : new Date(now.getTime() + 60 * 60 * 1000);
    const newCount = resetAt && now < resetAt ? (rateLimit?.count ?? 0) + 1 : 1;

    await supabaseClient.from('api_rate_limits').upsert({
      user_id: user.id,
      endpoint: 'gemini',
      count: newCount,
      reset_at: newResetAt.toISOString(),
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

#### Шаг 2: Создать таблицу для rate limiting

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_rate_limits.sql

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint);
```

#### Шаг 3: Обновить geminiService

**Файл:** `k-sebe-yoga-studioWEB/services/geminiService.ts`

```typescript
import { supabase } from '@ksebe/shared';

const USE_PROXY = true; // Feature flag

async function callGeminiAPI(
  prompt: string,
  model: string = 'gemini-2.0-flash-exp'
) {
  if (USE_PROXY) {
    // Используем Edge Function proxy
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-proxy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt, model }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } else {
    // Старый способ (только для разработки)
    // ... existing code
  }
}
```

#### Шаг 4: Настроить Supabase secrets

```bash
# Локально
supabase secrets set GEMINI_API_KEY=your_api_key_here

# Или через Dashboard:
# Project Settings > Edge Functions > Add Secret
```

#### Шаг 5: Развернуть Edge Function

```bash
supabase functions deploy gemini-proxy
```

---

## Приоритет 2: Геймификация

### Streak System (уже частично реализован)

**Компоненты:**

- ✅ `StreakCard.tsx` (базовый UI)
- ⏳ `StreakCalendar.tsx` (нужно добавить)
- ⏳ Streak notifications

#### Добавить таблицу user_progress

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_user_progress.sql

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_practices INT DEFAULT 0,
  last_practice_date DATE,
  weekly_goal INT DEFAULT 5,
  weekly_progress INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Создать useStreak hook

**Файл:** `shared/hooks/useStreak.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@ksebe/shared';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPractices: number;
  lastPracticeDate: string | null;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  async function loadStreak() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStreak({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          totalPractices: data.total_practices,
          lastPracticeDate: data.last_practice_date,
          weeklyGoal: data.weekly_goal,
          weeklyProgress: data.weekly_progress,
        });
      } else {
        // Initialize
        await supabase.from('user_progress').insert({
          user_id: user.id,
        });
        setStreak({
          currentStreak: 0,
          longestStreak: 0,
          totalPractices: 0,
          lastPracticeDate: null,
          weeklyGoal: 5,
          weeklyProgress: 0,
        });
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  }

  async function recordPractice() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const current = streak!;

      // Calculate new streak
      let newStreak = current.currentStreak;
      if (current.lastPracticeDate) {
        const lastDate = new Date(current.lastPracticeDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // Already practiced today
          return;
        } else if (diffDays === 1) {
          // Continue streak
          newStreak++;
        } else {
          // Streak broken
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const { error } = await supabase
        .from('user_progress')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, current.longestStreak),
          total_practices: current.totalPractices + 1,
          last_practice_date: today,
          weekly_progress: current.weeklyProgress + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await loadStreak();
    } catch (error) {
      console.error('Error recording practice:', error);
    }
  }

  return { streak, loading, recordPractice, reload: loadStreak };
}
```

### Achievements System

#### Создать таблицу achievements

```sql
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);
```

#### Achievement definitions

**Файл:** `shared/constants/achievements.ts`

```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (progress: UserProgress) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_practice',
    name: 'Первый шаг',
    description: 'Завершите первую практику',
    icon: '🌱',
    condition: (p) => p.totalPractices >= 1,
  },
  {
    id: 'streak_7',
    name: 'Неделя силы',
    description: '7 дней подряд',
    icon: '🔥',
    condition: (p) => p.currentStreak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Месяц трансформации',
    description: '30 дней подряд',
    icon: '💪',
    condition: (p) => p.currentStreak >= 30,
  },
  {
    id: 'practices_10',
    name: 'Начинающий йог',
    description: '10 практик',
    icon: '🧘',
    condition: (p) => p.totalPractices >= 10,
  },
  {
    id: 'practices_50',
    name: 'Опытный практик',
    description: '50 практик',
    icon: '🌟',
    condition: (p) => p.totalPractices >= 50,
  },
  // Добавить больше...
];
```

---

## Приоритет 3: Монетизация

### YooKassa интеграция

#### Шаг 1: Регистрация

1. Зарегистрироваться на https://yookassa.ru/
2. Получить `shopId` и `secretKey`
3. Настроить webhook URL

#### Шаг 2: Edge Function для создания платежа

**Файл:** `supabase/functions/create-payment/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { plan, returnUrl } = await req.json();

  const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');

  const prices = {
    premium: { amount: '990.00', currency: 'RUB' },
    vip: { amount: '2990.00', currency: 'RUB' },
  };

  const price = prices[plan as keyof typeof prices];

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
      Authorization: `Basic ${btoa(`${shopId}:${secretKey}`)}`,
    },
    body: JSON.stringify({
      amount: price,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description: `K Sebe ${plan} subscription`,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Приоритет 4: Performance

### Lighthouse optimization

#### 1. Image optimization

```typescript
// Используйте Image component из shared
import { Image } from '@ksebe/shared';

<Image
  src="/images/hero.jpg"
  alt="Yoga"
  srcSet="/images/hero-400w.webp 400w, /images/hero-800w.webp 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
/>
```

#### 2. Code splitting

```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const VideoLibrary = lazy(() => import('./pages/VideoLibrary'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/videos" element={<VideoLibrary />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

#### 3. Service Worker optimization

```javascript
// Добавить в vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
          },
        },
      ],
    },
  }),
],
```

---

## Чек-лист разработчика

### Перед каждым PR

- [ ] `npm run typecheck` — без ошибок
- [ ] `npm run lint` — без ошибок
- [ ] `npm run test:run` — все тесты проходят
- [ ] `npm run build:all` — успешная сборка
- [ ] Lighthouse score > 80 (для UI изменений)
- [ ] Добавлены тесты для нового функционала
- [ ] Документация обновлена

### Для AI features

- [ ] Используется Edge Function proxy
- [ ] Добавлен rate limiting
- [ ] Есть fallback на ошибки
- [ ] Добавлено кэширование
- [ ] Логирование использования

### Для геймификации

- [ ] Метрики трекаются
- [ ] A/B тесты настроены
- [ ] Есть opt-out опция
- [ ] UX протестирован

---

## FAQ

**Q: Можно ли пока использовать прямые вызовы Gemini API?**  
A: Только для локальной разработки. Для production обязательно использовать Edge
Function proxy.

**Q: Как тестировать платежи?**  
A: YooKassa предоставляет тестовый режим. Используйте тестовые карты из
документации.

**Q: Нужно ли мигрировать на Tailwind 4?**  
A: Пока нет, v4 в beta. Подождать stable release.

**Q: Как проверить test coverage?**  
A: `npm run test:coverage`

---

_Документ создан: 5 января 2026_  
_Последнее обновление: 5 января 2026_
