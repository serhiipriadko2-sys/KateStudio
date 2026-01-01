import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type PlanId = 'free' | 'premium' | 'vip';

type CreatePaymentRequest = {
  plan: PlanId;
  returnUrl?: string;
};

const corsHeaders: HeadersInit = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, String(v)));
  return new Response(JSON.stringify(data), { ...init, headers });
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
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const key = serviceRoleKey || anonKey;
  if (!url || !key) throw new Error('Supabase env missing');

  return createClient(url, key, {
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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });

  let payload: CreatePaymentRequest;
  try {
    payload = (await req.json()) as CreatePaymentRequest;
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload.plan || !['free', 'premium', 'vip'].includes(payload.plan)) {
    return json({ error: 'Unsupported plan' }, { status: 400 });
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const supabaseAuth = getSupabaseClient(token);
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !authData.user?.id) {
      return json({ error: 'Invalid user session' }, { status: 401 });
    }

    const supabase = getSupabaseClient(token);
    const now = new Date().toISOString();
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
      return json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    const paymentUrl = buildPaymentUrl(payload.plan, subscription.id, payload.returnUrl);

    return json({
      status: subscription.status,
      subscription,
      paymentUrl,
      message: paymentUrl ? undefined : 'Провайдер оплаты не настроен',
    });
  } catch (e) {
    console.error('create-payment error', e);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});
