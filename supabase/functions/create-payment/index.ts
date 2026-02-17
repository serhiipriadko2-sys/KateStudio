import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { z } from 'npm:zod@3.24.1';

type PlanId = 'free' | 'premium' | 'vip';

const CreatePaymentRequestSchema = z.object({
  plan: z.enum(['free', 'premium', 'vip']),
  returnUrl: z.string().url().optional(),
});

type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;

const allowedOrigins = [
  'https://ksebe-studio.ru',
  'https://app.ksebe-studio.ru',
  'http://localhost:3000',
  'http://localhost:5173',
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

const PLANS: Record<PlanId, { amount: string; currency: string; description: string }> = {
  free: { amount: '0.00', currency: 'RUB', description: 'Basic Access' },
  premium: { amount: '499.00', currency: 'RUB', description: 'Premium Access (Monthly)' },
  vip: { amount: '1999.00', currency: 'RUB', description: 'VIP Access + Personal Plan' },
};

async function createYookassaPayment(
  planId: PlanId,
  userId: string,
  returnUrl: string,
  metadata: Record<string, string>
) {
  const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');

  if (!shopId || !secretKey) {
    throw new Error('YooKassa credentials missing');
  }

  const plan = PLANS[planId];
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
    description: `Subscription: ${plan.description}`,
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

    // Upsert subscription status to 'pending'
    const { error: dbError } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      plan: payload.plan,
      status: 'pending',
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Database error:', dbError);
      return json({ error: 'Failed to initialize subscription' }, { status: 500 }, cors);
    }

    // Call YooKassa API
    const defaultReturnUrl = payload.returnUrl || 'https://app.ksebe-studio.ru/profile';
    const payment = await createYookassaPayment(payload.plan, user.id, defaultReturnUrl, {});

    return json(
      {
        paymentUrl: payment.confirmation.confirmation_url,
        paymentId: payment.id,
        status: payment.status,
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
