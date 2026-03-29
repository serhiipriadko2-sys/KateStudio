import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { z } from 'npm:zod@3.24.1';

const CreatePaymentRequestSchema = z.object({
  plan: z.enum(['free', 'premium', 'vip']),
  returnUrl: z.string().url().optional(),
});

type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;

const allowedOrigins = [
  'https://ksebe-studio.ru',
  'https://app.ksebe-studio.ru',
  ...(Deno.env.get('ENVIRONMENT') !== 'production'
    ? ['http://localhost:3000', 'http://localhost:5173']
    : []),
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://ksebe-studio.ru';

  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
  };
}

function json(data: unknown, init: ResponseInit = {}, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(init.headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  Object.entries(headers).forEach(([k, v]) => responseHeaders.set(k, String(v)));
  return new Response(JSON.stringify(data), { ...init, headers: responseHeaders });
}

// Custom app protocols that are always allowed as returnUrl schemes
const ALLOWED_RETURN_PROTOCOLS = ['ksebe:', 'capacitor:'];

// Hostnames from ALLOWED_ORIGINS env var, parsed once at module load
const allowedReturnHosts = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedReturnUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (ALLOWED_RETURN_PROTOCOLS.includes(parsed.protocol)) return true;
    if (parsed.hostname === 'localhost') return true;
    return allowedReturnHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getSupabaseClient(token?: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey)
    throw new Error('Supabase configuration error: Service Role missing');

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });
}

// Canonical prices — must match shared/constants/index.ts SUBSCRIPTION_PLANS
const PAID_PLANS: Record<
  'premium' | 'vip',
  { amount: string; currency: string; description: string }
> = {
  premium: { amount: '990.00', currency: 'RUB', description: 'Премиум (ежемесячно)' },
  vip: { amount: '2990.00', currency: 'RUB', description: 'VIP + персональные занятия' },
};

async function createYookassaPayment(
  planId: 'premium' | 'vip',
  userId: string,
  returnUrl: string,
  metadata: Record<string, string>
) {
  const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');

  if (!shopId || !secretKey) {
    throw new Error('YooKassa credentials missing');
  }

  const plan = PAID_PLANS[planId];
  const idempotencyKey = crypto.randomUUID();

  const body = {
    amount: {
      value: plan.amount,
      currency: plan.currency,
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    description: `Подписка: ${plan.description}`,
    metadata: {
      user_id: userId,
      plan_id: planId,
      ...metadata,
    },
  };

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${shopId}:${secretKey}`)}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YooKassa Error:', errorText);
    throw new Error(`YooKassa API error: ${response.status}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 }, cors);
  }

  let payload: CreatePaymentRequest;
  try {
    const rawPayload = await req.json();
    payload = CreatePaymentRequestSchema.parse(rawPayload);
  } catch (e) {
    return json(
      { error: 'Validation error', details: e instanceof z.ZodError ? e.errors : e },
      { status: 400 },
      cors
    );
  }

  if (payload.returnUrl !== undefined && !isAllowedReturnUrl(payload.returnUrl)) {
    return json({ error: 'Invalid returnUrl' }, { status: 400 }, cors);
  }

  const token = getBearerToken(req);
  if (!token) return json({ error: 'Authentication required' }, { status: 401 }, cors);

  try {
    const supabase = getSupabaseClient(token);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return json({ error: 'Invalid user session' }, { status: 401 }, cors);
    }

    // --- Free plan: no payment needed, activate immediately ---
    if (payload.plan === 'free') {
      const { data: subscription, error: dbError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan: 'free',
            status: 'active',
            provider: 'none',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return json({ error: 'Failed to update subscription' }, { status: 500 }, cors);
      }

      return json({ paymentUrl: null, paymentId: null, status: 'active', subscription }, {}, cors);
    }

    // --- Paid plans: initiate YooKassa payment ---
    const { error: dbError } = await supabase.from('subscriptions').upsert(
      {
        user_id: user.id,
        plan: payload.plan,
        status: 'pending',
        provider: 'yookassa',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (dbError) {
      console.error('Database error:', dbError);
      return json({ error: 'Failed to initialize subscription' }, { status: 500 }, cors);
    }

    const defaultReturnUrl = payload.returnUrl || 'https://app.ksebe-studio.ru/profile';
    const payment = await createYookassaPayment(payload.plan, user.id, defaultReturnUrl, {});

    // Save the provider payment ID so webhook can correlate later
    await supabase
      .from('subscriptions')
      .update({ provider_subscription_id: payment.id })
      .eq('user_id', user.id);

    return json(
      {
        paymentUrl: payment.confirmation.confirmation_url,
        paymentId: payment.id,
        status: payment.status,
        subscription: null, // will be updated by webhook after payment succeeds
      },
      {},
      cors
    );
  } catch (e) {
    console.error('Payment creation failed:', e);
    return json(
      { error: e instanceof Error ? e.message : 'Internal Server Error' },
      { status: 500 },
      cors
    );
  }
});
