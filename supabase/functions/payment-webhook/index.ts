import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type PlanId = 'free' | 'premium' | 'vip';

type WebhookPayload = {
  subscription_id?: string;
  user_id?: string;
  plan?: PlanId;
  status?: 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';
  current_period_end?: string | null;
  provider?: string;
  provider_subscription_id?: string;
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

function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) throw new Error('Supabase service role missing');
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });

  const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
  if (secret) {
    const signature = req.headers.get('x-webhook-signature');
    if (!signature || signature !== secret) {
      return json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload.subscription_id && !payload.user_id) {
    return json({ error: 'Missing subscription_id or user_id' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const updates = {
      plan: payload.plan,
      status: payload.status,
      current_period_end: payload.current_period_end ?? undefined,
      provider: payload.provider,
      provider_subscription_id: payload.provider_subscription_id,
      updated_at: new Date().toISOString(),
    };

    let response;
    if (payload.subscription_id) {
      response = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', payload.subscription_id)
        .select()
        .single();
    } else {
      response = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: payload.user_id,
            plan: payload.plan ?? 'free',
            status: payload.status ?? 'active',
            current_period_end: payload.current_period_end ?? null,
            provider: payload.provider,
            provider_subscription_id: payload.provider_subscription_id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();
    }

    if (response.error) {
      console.error('payment-webhook update error', response.error);
      return json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return json({ success: true, subscription: response.data });
  } catch (e) {
    console.error('payment-webhook error', e);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});
