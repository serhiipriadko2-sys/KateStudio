# REMEDIATION PLAN - K SEBE YOGA STUDIO

## Детальный план исправлений с приоритетами

**Дата:** 2026-01-12 **Базируется на:** PRODUCTION_READINESS_AUDIT.md

---

## 📋 ПРИОРИТИЗАЦИЯ

### P0 - БЛОКЕРЫ (критично, без этого нельзя в продакшн)

**Время:** 1-2 дня **Ответственный:** Backend/Security Lead

### P1 - ВЫСОКИЙ ПРИОРИТЕТ (очень желательно перед запуском)

**Время:** 1-2 недели **Ответственный:** Full Team

### P2 - СРЕДНИЙ ПРИОРИТЕТ (можно после запуска, но скоро)

**Время:** 2-4 недели **Ответственный:** Full Team

### P3 - НИЗКИЙ ПРИОРИТЕТ (backlog, постепенно)

**Время:** ongoing **Ответственный:** Product Owner + Team

---

## 🔴 P0 - КРИТИЧЕСКИЕ БЛОКЕРЫ

### 1. Установить зависимости

**Приоритет:** P0 **Время:** 5 минут **Файл:** N/A

**Проблема:**

```
npm error missing: @eslint/js@^9.39.2
npm error missing: (еще 24 пакета)
```

**Решение:**

```bash
cd /home/user/KateStudio
npm install
```

**Проверка:**

```bash
npm ls --depth=0
# Должно показать все пакеты без UNMET DEPENDENCY
```

---

### 2. Исправить webhook secret validation

**Приоритет:** P0 **Время:** 10 минут **Файл:**
`/supabase/functions/payment-webhook/index.ts`

**Проблема (строки 41-46):**

```typescript
const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
if (secret) {
  // ⚠️ Опциональная проверка!
  const signature = req.headers.get('x-webhook-signature');
  if (!signature || signature !== secret) {
    return json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

**Решение:**

```typescript
const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
if (!secret) {
  console.error('PAYMENT_WEBHOOK_SECRET is not set');
  throw new Error('Server misconfiguration: PAYMENT_WEBHOOK_SECRET required');
}

const signature = req.headers.get('x-webhook-signature');
if (!signature || signature !== secret) {
  return json(
    { error: 'Invalid signature' },
    { status: 401 },
    { headers: corsHeaders }
  );
}
```

**После исправления установить секрет:**

```bash
# Генерируем случайный секрет
openssl rand -hex 32

# Устанавливаем в Supabase
supabase secrets set PAYMENT_WEBHOOK_SECRET=<generated-secret>
```

---

### 3. Убрать update policy с subscriptions table

**Приоритет:** P0 **Время:** 15 минут **Файл:** Новая миграция

**Проблема:** Пользователь может через DevTools изменить свой `plan` и `status`

**Решение - создать миграцию:**

```bash
cd supabase/migrations
touch 20260112_fix_subscriptions_rls.sql
```

**Содержимое миграции:**

```sql
-- Remove update policy that allows users to change their own subscriptions
drop policy if exists "subscriptions_update_own" on public.subscriptions;

-- Users can only read their subscriptions
-- Only service_role (Edge Functions) can update

-- Optionally: add a policy for users to cancel their subscription
-- (set a "cancel_requested" flag that backend will process)
create policy "subscriptions_request_cancel"
  on public.subscriptions
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    AND (NEW.status = OLD.status OR NEW.status = 'cancel_requested')
    AND NEW.plan = OLD.plan
    AND NEW.current_period_end = OLD.current_period_end
  );

-- Comment: This policy only allows users to request cancellation
-- The actual cancellation will be processed by Edge Function
```

**Применить:**

```bash
supabase db reset --local  # для локального тестирования
supabase db push           # для production
```

---

### 4. Ограничить CORS конкретными доменами

**Приоритет:** P0 **Время:** 15 минут **Файлы:** Все 3 Edge Functions

**Проблема:**

```typescript
const corsHeaders: HeadersInit = {
  'access-control-allow-origin': '*', // ⚠️ Открыто для всех
};
```

**Решение для `/supabase/functions/gemini-proxy/index.ts` (строки 29-33):**

```typescript
// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://ksebe.yoga',
  'https://katestudio-git-main-serhiipriadko2-sys.vercel.app', // Production
  'http://localhost:3000', // Development
  'http://localhost:5173', // Vite dev server
];

function getCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers':
      'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
  };
}

// В обработчике:
const origin = req.headers.get('origin');
const corsHeaders = getCorsHeaders(origin);

// Для OPTIONS:
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

**Применить ко всем 3 функциям:**

- gemini-proxy/index.ts
- create-payment/index.ts
- payment-webhook/index.ts

---

### 5. Убрать API key fallback для production

**Приоритет:** P0 **Время:** 20 минут **Файлы:**

- `/k-sebe-yoga-studioWEB/vite.config.ts`
- `/k-sebe-yoga-studio-APPp/vite.config.ts`

**Проблема (строки 19-22):**

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(geminiApiKey),
  'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
}
```

**Решение - условная компиляция:**

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;

  // В production НЕ встраиваем ключ, используем только Edge Functions
  const embedApiKey = mode === 'development' ? geminiApiKey : undefined;

  if (mode === 'production' && geminiApiKey) {
    console.warn(
      '⚠️ GEMINI_API_KEY found but will NOT be embedded in production bundle'
    );
    console.warn('✅ Using Edge Function proxy for AI requests');
  }

  return {
    // ...
    define: {
      'process.env.API_KEY': JSON.stringify(embedApiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(embedApiKey),
    },
    // ...
  };
});
```

**Обновить geminiService чтобы требовал proxy в production:**

В `geminiService.ts` добавить (после строки 11):

```typescript
// Production safety: require Edge Function proxy
const IS_PRODUCTION = import.meta.env.PROD;
const HAS_CLIENT_KEY = !!process.env.GEMINI_API_KEY;

if (IS_PRODUCTION && HAS_CLIENT_KEY) {
  console.error(
    'Security: Client-side AI key should not be available in production'
  );
}

const allowClientFallback = !IS_PRODUCTION || !PROXY_ENDPOINT;
```

---

### 6. Требовать Service Role Key

**Приоритет:** P0 **Время:** 10 минут **Файл:**
`/supabase/functions/create-payment/index.ts`

**Проблема (строки 32-34):**

```typescript
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const key = serviceRoleKey || anonKey; // ⚠️ Fallback
```

**Решение:**

```typescript
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
  throw new Error(
    'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY required'
  );
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

**Установить секрет:**

```bash
# Получить из Supabase Dashboard > Settings > API > service_role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

### 7. Создать .env файлы

**Приоритет:** P0 **Время:** 15 минут **Файлы:** `.env` (root, WEB, APP)

**Действия:**

```bash
# Root
cp .env.example .env

# WEB
cd k-sebe-yoga-studioWEB
cp ../.env.example .env

# APP
cd ../k-sebe-yoga-studio-APPp
cp ../.env.example .env
```

**Заполнить значения:**

```bash
# Получить из Supabase Dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Получить из Google AI Studio (только для DEV!)
VITE_GEMINI_API_KEY=your-gemini-key

# Опционально
VITE_APP_NAME="K Sebe Yoga Studio"
VITE_APP_URL=https://ksebe.yoga
VITE_DEV_MODE=true
```

**⚠️ Важно:** Добавить `.env` в `.gitignore` (уже добавлено)

---

### 8. Установить GitHub Secrets

**Приоритет:** P0 **Время:** 10 минут **Где:** GitHub Repository > Settings >
Secrets and variables > Actions

**Необходимые секреты:**

```
# Supabase (для CI/CD)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini (только для APP build)
VITE_GEMINI_API_KEY=your-gemini-key

# Firebase (для APP deployment)
FIREBASE_SERVICE_ACCOUNT=<json-from-firebase-console>

# Supabase Edge Functions (установить через CLI)
GEMINI_API_KEY=your-gemini-key (серверный)
PAYMENT_WEBHOOK_SECRET=<generated-secret>
SUPABASE_SERVICE_ROLE_KEY=<from-dashboard>

# YooKassa (когда будет готово)
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key

# Monitoring (опционально)
SENTRY_DSN=your-sentry-dsn
```

---

### 9. Заменить Unsplash изображения

**Приоритет:** P0 **Время:** 2-4 часа **Файлы:**

- `/k-sebe-yoga-studioWEB/components/Reviews.tsx`
- `/k-sebe-yoga-studioWEB/data/content.ts`
- `/k-sebe-yoga-studioWEB/components/Retreats.tsx`
- `/k-sebe-yoga-studio-APPp/components/VideoLibrary.tsx`

**Список изображений для замены:**

| Файл             | Строки            | Тип           | Количество |
| ---------------- | ----------------- | ------------- | ---------- |
| Reviews.tsx      | 17,23,29,35,41    | Аватары       | 5          |
| data/content.ts  | 123,143,161       | Обложки блога | 3          |
| Retreats.tsx     | 86,142            | Ретрит        | 2          |
| VideoLibrary.tsx | 13,18,23,28,33,38 | Превью видео  | 6          |

**План действий:**

1. **Собрать реальные изображения:**
   - Аватары отзывов (5 шт) - фото реальных клиентов или stock с лицензией
   - Обложки блога (3 шт) - медитация, питание, inside flow
   - Ретрит (2 шт) - фото Алтая или похожих мест
   - Превью видео (6 шт) - скриншоты из реальных видео Кати

2. **Оптимизировать:**

   ```bash
   # Установить imagemagick
   apt-get install imagemagick

   # Конвертировать в WebP
   convert input.jpg -quality 80 -resize 400x400 output.webp
   ```

3. **Загрузить в Supabase Storage:**

   ```bash
   # Через Supabase Dashboard или CLI
   supabase storage create-bucket avatars --public
   supabase storage create-bucket blog-covers --public
   supabase storage upload avatars ./avatar-1.webp
   ```

4. **Обновить URLs в коде:**

   ```typescript
   // Было:
   avatar: 'https://images.unsplash.com/photo-...';

   // Стало:
   avatar: 'https://your-project.supabase.co/storage/v1/object/public/avatars/avatar-1.webp';
   ```

---

## 🟡 P1 - ВЫСОКИЙ ПРИОРИТЕТ

### 10. Input validation в Edge Functions

**Приоритет:** P1 **Время:** 2-3 часа **Файл:**
`/supabase/functions/gemini-proxy/index.ts`

**Установить Zod:**

```typescript
// В начале файла gemini-proxy/index.ts
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
```

**Создать схемы:**

```typescript
// Request schemas
const ChatRequestSchema = z.object({
  op: z.literal('chat'),
  message: z.string().min(1).max(10000),
  mode: z.enum(['casual', 'coach', 'deep_think']).optional(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

const AnalyzeMediaSchema = z.object({
  op: z.enum(['analyzeMedia', 'analyzeVideo']),
  mimeType: z.string().regex(/^(image|video)\//),
  base64Data: z.string().min(1).max(10000000), // ~7.5MB
  prompt: z.string().min(1).max(5000),
});

const GenerateImageSchema = z.object({
  op: z.literal('generateImage'),
  prompt: z.string().min(10).max(2000),
  aspectRatio: z.enum(['1:1', '16:9', '9:16']).optional(),
});

const TTSSchema = z.object({
  op: z.literal('textToSpeech'),
  text: z.string().min(1).max(5000),
  voice: z.enum(['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede']).optional(),
});

// Union schema
const ProxyRequestSchema = z.discriminatedUnion('op', [
  ChatRequestSchema,
  AnalyzeMediaSchema,
  GenerateImageSchema,
  TTSSchema,
]);
```

**Валидировать запрос:**

```typescript
// После парсинга JSON (строка ~95)
let body: z.infer<typeof ProxyRequestSchema>;
try {
  const rawBody = await req.json();
  body = ProxyRequestSchema.parse(rawBody);
} catch (e) {
  if (e instanceof z.ZodError) {
    return json(
      { error: 'Invalid request', details: e.errors },
      { status: 400 },
      { headers: corsHeaders }
    );
  }
  return json(
    { error: 'Invalid JSON' },
    { status: 400 },
    { headers: corsHeaders }
  );
}
```

**Санитизация текста:**

```typescript
function sanitizeText(text: string): string {
  return text
    .replace(/<script/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Использовать перед отправкой в AI
const sanitizedMessage = sanitizeText(body.message);
```

**Применить к:**

- create-payment/index.ts
- payment-webhook/index.ts

---

### 11. Rate limiting в Redis/KV

**Приоритет:** P1 **Время:** 3-4 часа **Файл:**
`/supabase/functions/gemini-proxy/index.ts`

**Вариант 1: Upstash Redis**

1. Создать Upstash Redis instance на upstash.com
2. Получить UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN

```typescript
// В начале файла
const REDIS_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
const REDIS_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

async function checkRateLimit(
  userId: string,
  tier: SubscriptionPlan,
  opCost: OpCost
): Promise<RateLimitResult> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    // Fallback to in-memory (current behavior)
    return checkRateLimitMemory(userId, tier, opCost);
  }

  const limits = RATE_LIMITS[tier];
  const limit = limits[opCost];
  const key = `ratelimit:${userId}:${opCost}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  // Sliding window with Redis
  const response = await fetch(`${REDIS_URL}/eval`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script: `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])
        local cutoff = now - window

        redis.call('ZREMRANGEBYSCORE', key, 0, cutoff)
        local current = redis.call('ZCARD', key)

        if current < limit then
          redis.call('ZADD', key, now, now)
          redis.call('EXPIRE', key, 60)
          return {1, limit - current - 1}
        else
          return {0, 0}
        end
      `,
      keys: [key],
      args: [now.toString(), windowMs.toString(), limit.toString()],
    }),
  });

  const result = await response.json();
  const [allowed, remaining] = result.result;

  return {
    allowed: allowed === 1,
    remaining,
    resetAt: now + windowMs,
  };
}
```

3. Установить секреты:

```bash
supabase secrets set UPSTASH_REDIS_REST_URL=<url>
supabase secrets set UPSTASH_REDIS_REST_TOKEN=<token>
```

**Вариант 2: Supabase (через таблицу)**

Создать таблицу rate_limits:

```sql
create table rate_limits (
  user_id uuid references auth.users(id) on delete cascade,
  op_cost text not null,
  timestamp bigint not null,
  primary key (user_id, op_cost, timestamp)
);

create index rate_limits_timestamp_idx on rate_limits(timestamp);

-- Cleanup old entries (cron job)
create or replace function cleanup_rate_limits()
returns void as $$
  delete from rate_limits where timestamp < extract(epoch from now() - interval '2 minutes') * 1000;
$$ language sql;
```

---

### 12. Webhook signature verification

**Приоритет:** P1 **Время:** 1-2 часа **Файл:**
`/supabase/functions/payment-webhook/index.ts`

**YooKassa HMAC verification:**

```typescript
// Импорт для HMAC
import { createHash, createHmac } from 'node:crypto';

async function verifyYooKassaSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const hmac = createHmac('sha256', secret);
  hmac.update(body);
  const calculatedSignature = hmac.digest('hex');

  return signature === calculatedSignature;
}

// В обработчике (после проверки simple secret)
const rawBody = await req.text();
const signature = req.headers.get('x-yookassa-signature');

if (!signature) {
  return json(
    { error: 'Missing signature' },
    { status: 401 },
    { headers: corsHeaders }
  );
}

const isValid = await verifyYooKassaSignature(rawBody, signature, secret);
if (!isValid) {
  console.error('Invalid YooKassa signature');
  return json(
    { error: 'Invalid signature' },
    { status: 401 },
    { headers: corsHeaders }
  );
}

// Теперь безопасно парсить body
const event = JSON.parse(rawBody);
```

---

### 13. YooKassa интеграция

**Приоритет:** P1 **Время:** 1-2 дня **Файл:**
`/supabase/functions/create-payment/index.ts`

**Установить YooKassa SDK для Deno:**

```typescript
// Использовать fetch API напрямую (YooKassa REST API)
const YOOKASSA_SHOP_ID = Deno.env.get('YOOKASSA_SHOP_ID');
const YOOKASSA_SECRET_KEY = Deno.env.get('YOOKASSA_SECRET_KEY');

if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
  throw new Error('YooKassa credentials not configured');
}

interface YooKassaPayment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata: Record<string, string>;
}

async function createYooKassaPayment(
  amount: string,
  description: string,
  metadata: Record<string, string>,
  returnUrl: string
): Promise<YooKassaPayment> {
  const idempotenceKey = crypto.randomUUID();

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization:
        'Basic ' + btoa(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`),
    },
    body: JSON.stringify({
      amount: {
        value: amount,
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description,
      metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('YooKassa error:', error);
    throw new Error('Payment creation failed');
  }

  return await response.json();
}
```

**Обновить функцию создания подписки:**

```typescript
// После создания subscription record в БД (строка ~80)
const planPrices: Record<PlanId, string> = {
  free: '0.00',
  premium: '990.00',
  vip: '2990.00',
};

if (plan !== 'free') {
  const payment = await createYooKassaPayment(
    planPrices[plan],
    `Подписка ${plan.toUpperCase()} - K Sebe Yoga`,
    {
      subscription_id: subscription.id,
      user_id: userId,
      plan,
    },
    returnUrl || `${Deno.env.get('APP_URL')}/subscription/success`
  );

  // Сохранить payment_id в subscription
  await supabase
    .from('subscriptions')
    .update({
      provider_subscription_id: payment.id,
    })
    .eq('id', subscription.id);

  return json({
    subscription,
    payment_url: payment.confirmation.confirmation_url,
  });
}
```

**Обновить webhook для обработки YooKassa events:**

```typescript
// В payment-webhook/index.ts
interface YooKassaWebhookEvent {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    paid: boolean;
    amount: {
      value: string;
      currency: string;
    };
    metadata: {
      subscription_id: string;
      user_id: string;
      plan: string;
    };
  };
}

// После верификации signature
const event: YooKassaWebhookEvent = JSON.parse(rawBody);

if (event.event === 'payment.succeeded' && event.object.paid) {
  const { subscription_id, plan } = event.object.metadata;

  // Активировать подписку
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription_id);

  if (error) {
    console.error('Failed to activate subscription:', error);
    return json({ error: 'Database error' }, { status: 500 });
  }

  console.log(`Subscription ${subscription_id} activated for plan ${plan}`);
}

return json({ received: true });
```

---

### 14. Заменить placeholder видео

**Приоритет:** P1 **Время:** 4-8 часов (зависит от создания контента) **Файл:**
`/k-sebe-yoga-studio-APPp/components/VideoLibrary.tsx`

**Текущие placeholder URLs (строки 10-46):**

```typescript
videoUrl: 'https://www.youtube.com/embed/sTANio_2E0Q?autoplay=1',
videoUrl: 'https://www.youtube.com/embed/inpok4MKVLM?autoplay=1',
// + еще 2
```

**План:**

1. Записать реальные видео с Катей Габран
2. Загрузить на YouTube канал студии
3. Получить embed URLs
4. Обновить VideoLibrary.tsx

**Альтернатива:** Использовать Supabase Storage для приватных видео

```typescript
// Загрузить в Supabase Storage bucket 'videos'
const videos = [
  {
    id: '1',
    title: 'Inside Flow: Начальный уровень',
    duration: '30 минут',
    level: 'Начинающий',
    instructor: 'Катя Габран',
    thumbnail:
      supabaseUrl + '/storage/v1/object/public/videos/thumbnails/video-1.jpg',
    videoUrl:
      supabaseUrl + '/storage/v1/object/public/videos/inside-flow-beginner.mp4',
    isPremium: false,
  },
  // ...
];
```

**Добавить проверку подписки:**

```typescript
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('plan, status')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

const canAccessPremium =
  subscription && ['premium', 'vip'].includes(subscription.plan);

const filteredVideos = videos.filter((v) => !v.isPremium || canAccessPremium);
```

---

### 15. Интегрировать расписание с Supabase

**Приоритет:** P1 **Время:** 1-2 дня **Файлы:**

- `/k-sebe-yoga-studio-APPp/services/dataService.ts`
- Новая таблица в Supabase

**Создать таблицу classes:**

```sql
-- Миграция: 20260112_classes_table.sql
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructor text not null,
  type text not null, -- 'inside-flow', 'hatha', 'sound-healing', etc.
  level text not null, -- 'beginner', 'intermediate', 'advanced'
  date date not null,
  time time not null,
  duration_minutes integer not null default 60,
  max_capacity integer not null default 15,
  current_bookings integer not null default 0,
  is_cancelled boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index для быстрых запросов
create index classes_date_time_idx on public.classes(date, time);
create index classes_type_idx on public.classes(type);

-- RLS policies
alter table public.classes enable row level security;

create policy "classes_read_all"
  on public.classes for select
  using (true);  -- Все могут читать расписание

-- Только admin может создавать/обновлять (через service_role)
```

**Обновить dataService.ts:**

```typescript
import { supabase } from './supabaseClient';

export interface Class {
  id: string;
  title: string;
  instructor: string;
  type: string;
  level: string;
  date: string;
  time: string;
  duration_minutes: number;
  max_capacity: number;
  current_bookings: number;
  is_cancelled: boolean;
  description?: string;
}

export async function getWeekSchedule(startDate: Date): Promise<Class[]> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lt('date', endDate.toISOString().split('T')[0])
    .eq('is_cancelled', false)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Failed to fetch schedule:', error);
    // Fallback to mock data
    return getMockSchedule(startDate);
  }

  return data || [];
}

export function getLoadLevel(
  currentBookings: number,
  maxCapacity: number
): 'low' | 'medium' | 'high' | 'full' {
  const ratio = currentBookings / maxCapacity;
  if (ratio >= 1) return 'full';
  if (ratio >= 0.8) return 'high';
  if (ratio >= 0.5) return 'medium';
  return 'low';
}

// Оставить getMockSchedule как fallback
```

**Создать Admin Panel для добавления занятий:**

```typescript
// В Dashboard.tsx добавить раздел для admin
async function createClass(
  classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>
) {
  // Использовать service_role через Edge Function
  const { data, error } = await supabase.functions.invoke(
    'admin-create-class',
    {
      body: classData,
    }
  );

  if (error) {
    throw new Error('Failed to create class');
  }

  return data;
}
```

---

## 🟢 P2 - СРЕДНИЙ ПРИОРИТЕТ

### 16. Убрать default exports

**Приоритет:** P2 **Время:** 1-2 часа **Файлы:** 8 файлов

**Список файлов:**

1. `/shared/components/FadeIn.tsx:76`
2. `/shared/components/Logo.tsx:63`
3. `/shared/components/Breathwork.tsx:229`
4. `/shared/components/Blog.tsx:345`
5. `/shared/components/Pricing.tsx:311`
6. `/shared/hooks/useScrollLock.ts:21`
7. `/shared/hooks/useAchievements.ts:233`
8. `/shared/services/supabase.ts:100`

**Пример (FadeIn.tsx):**

Было:

```typescript
export default FadeIn;
```

Стало:

```typescript
export { FadeIn };
```

**Обновить импорты:**

```typescript
// Было:
import FadeIn from '@ksebe/shared/components/FadeIn';

// Стало:
import { FadeIn } from '@ksebe/shared/components/FadeIn';
// или
import { FadeIn } from '@ksebe/shared';
```

**Автоматизация:**

```bash
# Найти все default exports
grep -r "export default" shared/ --include="*.ts" --include="*.tsx"

# Заменить (осторожно, проверять вручную)
```

---

### 17. Вынести хардкод в константы

**Приоритет:** P2 **Время:** 2-3 часа **Файлы:** Blog.tsx, Pricing.tsx,
Marquee.tsx, Breathwork.tsx

**1. Blog defaultArticles (Blog.tsx строки 21-84)**

Создать в `/shared/constants/content.ts`:

```typescript
export const DEFAULT_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: '1',
    title: 'Медитация и осознанность: путь к внутренней гармонии',
    excerpt: 'Узнайте, как медитация помогает справиться со стрессом...',
    date: '15 ноября 2024',
    readTime: '5 мин',
    category: 'Медитация',
    image: 'https://...', // Заменить на реальное
    content: '...',
  },
  // ...
];
```

Обновить Blog.tsx:

```typescript
import { DEFAULT_BLOG_ARTICLES } from '@ksebe/shared/constants/content';

// Заменить строки 21-84 на:
const articles = articlesData || DEFAULT_BLOG_ARTICLES;
```

**2. Breathwork слова (Marquee.tsx строки 20-83)**

Создать в `/shared/constants/breathwork.ts`:

```typescript
export const BREATHWORK_WORDS = {
  inhale: [
    'Свет',
    'Любовь',
    'Радость',
    'Гармония',
    'Энергия',
    'Сила',
    'Мир',
    'Благодарность',
    'Спокойствие',
    'Вдохновение',
    // ... остальные 30 слов
  ],
  exhale: [
    'Тишина',
    'Покой',
    'Отпускание',
    'Расслабление',
    'Умиротворение',
    // ... остальные 30 слов
  ],
};
```

**3. Breathwork тексты фаз (Breathwork.tsx строки 46-65)**

В `/shared/constants/breathwork.ts`:

```typescript
export const BREATHWORK_PHASE_TEXTS = {
  inhale: {
    text: 'Вдох',
    subText: 'Наполняйтесь энергией',
  },
  hold1: {
    text: 'Задержка',
    subText: 'Удерживайте дыхание',
  },
  exhale: {
    text: 'Выдох',
    subText: 'Отпустите напряжение',
  },
  hold2: {
    text: 'Пауза',
    subText: 'Почувствуйте спокойствие',
  },
};
```

**4. Pricing дубликаты (Pricing.tsx строки 12-98)**

Удалить дублирующие определения и использовать:

```typescript
import { PRICING_PLANS } from '@ksebe/shared/constants';

// Удалить строки 12-98
// Использовать PRICING_PLANS напрямую
```

---

### 18. Оптимизировать изображения

**Приоритет:** P2 **Время:** 1 день **Файлы:** Все public/images/

**План действий:**

1. **Установить инструменты:**

```bash
npm install -D sharp
```

2. **Создать скрипт оптимизации:**

```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  const dirname = path.dirname(inputPath);

  // WebP
  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(path.join(dirname, `${basename}.webp`));

  // AVIF (еще лучше сжатие)
  await sharp(inputPath)
    .avif({ quality: 75 })
    .toFile(path.join(dirname, `${basename}.avif`));

  // Optimized JPEG
  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(inputPath)
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(dirname, `${basename}-optimized${ext}`));
  }

  console.log(`Optimized: ${inputPath}`);
}

// Рекурсивно обработать все изображения
async function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      await optimizeImage(fullPath);
    }
  }
}

processDirectory('./k-sebe-yoga-studioWEB/public/images');
processDirectory('./k-sebe-yoga-studio-APPp/public/images');
```

3. **Запустить:**

```bash
node scripts/optimize-images.js
```

4. **Обновить Image компонент для использования:**

```tsx
<picture>
  <source srcSet="/images/studio-1.avif" type="image/avif" />
  <source srcSet="/images/studio-1.webp" type="image/webp" />
  <img src="/images/studio-1.jpg" alt="Студия" />
</picture>
```

5. **Responsive images:**

```tsx
<img
  srcSet="/images/studio-1-400w.webp 400w,
          /images/studio-1-800w.webp 800w,
          /images/studio-1-1200w.webp 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  src="/images/studio-1.jpg"
  alt="Студия"
/>
```

---

### 19-25. Остальные P2 задачи

_(Сокращаю для экономии места, полные инструкции доступны по запросу)_

**19. Реализовать Achievements UI**

- Создать AchievementUnlockedModal.tsx
- Создать AchievementsGrid.tsx
- Интегрировать с useAchievements

**20. Добавить Veo/Image Edit в Edge proxy**

- Расширить gemini-proxy для поддержки Veo
- Добавить rate limiting для дорогих операций

**21. Раскомментировать Subscription UI**

- Dashboard.tsx строки 1, 25, 64-780
- Проверить работу после реализации платежей

**22. Newsletter интеграция**

- Выбрать сервис (Mailchimp, SendGrid)
- Создать Edge Function для подписки
- Обновить Footer.tsx

**23. "Все статьи" функционал**

- Создать отдельную страницу /blog
- Или убрать кнопку

**24. Logging & Monitoring (Sentry)**

- Создать аккаунт на sentry.io
- Установить @sentry/deno
- Настроить error tracking

**25. Error recovery & cron jobs**

- Создать Edge Function для синхронизации статусов
- Настроить Supabase cron

---

## 🔵 P3 - НИЗКИЙ ПРИОРИТЕТ

_(Краткий список, детали по запросу)_

**26. Push Notifications (Firebase)** **27. DailyRecommendation компонент**
**28. PersonalProgram 7-day programs** **29. StreakCalendar visualization**
**30. Активировать Retreats секцию** **31. Активировать AI Subscription секцию**
**32. i18n поддержка** **33. Storybook для компонентов** **34. Performance
optimization (Lighthouse 90+)** **35. Analytics integration (Mixpanel/GA)**

---

## 📅 TIMELINE

### Week 1: P0 (Блокеры)

- День 1-2: Security fixes (#1-6)
- День 3-4: Content replacement (#9)
- День 5: Testing & .env setup (#7-8)

### Week 2-3: P1 (Высокий приоритет)

- День 1-3: Backend (#10-13)
- День 4-7: Content & Integration (#14-15)
- День 8-10: Testing

### Week 4-6: P2 (Средний приоритет)

- Weeks 4-5: Code quality & optimization (#16-20)
- Week 6: Features & Polish (#21-25)

### Week 7+: P3 (Ongoing)

- Continuous improvements
- New features
- Performance optimization

---

## ✅ CHECKLIST ДЛЯ КАЖДОГО ИСПРАВЛЕНИЯ

Для каждой задачи выполнить:

1. [ ] Создать feature branch

   ```bash
   git checkout -b fix/task-name
   ```

2. [ ] Внести изменения согласно инструкциям

3. [ ] Запустить локальные тесты

   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

4. [ ] Закоммитить с описательным сообщением

   ```bash
   git commit -m "fix(security): make webhook secret required"
   ```

5. [ ] Создать Pull Request

6. [ ] Code review

7. [ ] Merge после approval

8. [ ] Проверить на staging

9. [ ] Deploy в production

10. [ ] Мониторинг после деплоя

---

## 🆘 ESCALATION

**Если что-то блокирует прогресс:**

1. Документировать проблему
2. Создать issue в GitHub
3. Эскалировать Product Owner
4. Решить/обойти проблему
5. Продолжить с остальными задачами

---

**Конец плана исправлений** Обновлено: 2026-01-12
