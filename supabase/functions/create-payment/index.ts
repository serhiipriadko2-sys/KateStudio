import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type PlanId = 'free' | 'premium' | 'vip';

type CreatePaymentRequest = {
  plan: PlanId;
  returnUrl?: string;
};

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

  // Strict check: Service Role is required. No fallback to Anon Key.
  if (!url || !serviceRoleKey) throw new Error('Supabase configuration error: Service Role missing');

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });
}

function buildPaymentUrl(plan: PlanId, subscriptionId: string, returnUrl?: string): string | null {
  const checkoutBase = Deno.env.get('PAYMENT_CHECKOUT_URL');
  if (!checkoutBase) return returnUrl ?? null;
  const url = new URL(checkoutBase);
  url.searchParams.set('plan', plan);
  url.searchParams.set('subscription_id', subscriptionId);
  if (returnUrl) url.searchParams.set('return_url', returnUrl);
  return url.toString();
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 }, cors);

  let payload: CreatePaymentRequest;
  try {
    payload = (await req.json()) as CreatePaymentRequest;
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 }, cors);
  }

  if (!payload.plan || !['free', 'premium', 'vip'].includes(payload.plan)) {
    return json({ error: 'Unsupported plan' }, { status: 400 }, cors);
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: 'Authentication required' }, { status: 401 }, cors);
  }

  try {
    // 1. Verify user with Supabase Auth (using Service Role but validating token)
    const supabaseAuth = getSupabaseClient(token);
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !authData.user?.id) {
      return json({ error: 'Invalid user session' }, { status: 401 }, cors);
    }

    // 2. Perform DB operations using Service Role
    // We reuse the client which is initialized with Service Role
    const supabase = getSupabaseClient(token);
    const now = new Date().toISOString();

    // Upsert subscription status (Service Role required for this table if RLS blocks users)
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: authData.user.id,
          plan: payload.plan,
          status: payload.plan === 'free' ? 'active' : 'pending',
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error || !subscription) {
      console.error('create-payment upsert error', error);
      return json({ error: 'Failed to create subscription' }, { status: 500 }, cors);
    }

    const paymentUrl = buildPaymentUrl(payload.plan, subscription.id, payload.returnUrl);

    return json({
      status: subscription.status,
      subscription,
      paymentUrl,
      message: paymentUrl ? undefined : 'Провайдер оплаты не настроен',
    }, {}, cors);
  } catch (e) {
    console.error('create-payment error', e);
    return json({ error: 'Internal error' }, { status: 500 }, cors);
  }
});
