import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { z } from 'npm:zod@3.24.1';

function hexToUint8Array(hex: string): Uint8Array | null {
  // Validate hex string: must have even length and contain only hex characters
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

type PlanId = 'free' | 'premium' | 'vip';

const WebhookPayloadSchema = z.object({
  subscription_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  plan: z.enum(['free', 'premium', 'vip']).optional(),
  status: z.enum(['active', 'pending', 'canceled', 'past_due', 'trialing']).optional(),
  current_period_end: z.string().datetime().nullable().optional(),
  provider: z.string().optional(),
  provider_subscription_id: z.string().optional(),
});

type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

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
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
    'access-control-allow-methods': 'POST, OPTIONS',
  };
}

function json(data: unknown, init: ResponseInit = {}, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(init.headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  Object.entries(headers).forEach(([k, v]) => responseHeaders.set(k, String(v)));
  return new Response(JSON.stringify(data), { ...init, headers: responseHeaders });
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
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 }, cors);

  const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
  if (!secret) {
    console.error('Configuration error: PAYMENT_WEBHOOK_SECRET is missing');
    return json({ error: 'Server configuration error' }, { status: 500 }, cors);
  }

  // Compute HMAC-SHA256 of the request body
  const text = await req.text();
  
  const signature = req.headers.get('x-webhook-signature');
  if (!signature) {
    return json({ error: 'Missing signature' }, { status: 401 }, cors);
  }

  // Verify HMAC signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signatureBytes = hexToUint8Array(signature);
  if (!signatureBytes) {
    return json({ error: 'Invalid signature format: must be a hex-encoded string' }, { status: 401 }, cors);
  }
  const dataBytes = encoder.encode(text);

  const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes);

  if (!isValid) {
    return json({ error: 'Invalid signature' }, { status: 401 }, cors);
  }

  // Parse and validate payload after HMAC verification
  let payload: WebhookPayload;
  try {
    const rawPayload = JSON.parse(text);
    payload = WebhookPayloadSchema.parse(rawPayload);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return json({ error: 'Validation error', details: e.errors }, { status: 400 }, cors);
    }
    return json({ error: 'Invalid JSON' }, { status: 400 }, cors);
  }

  if (!payload.subscription_id && !payload.user_id) {
    return json({ error: 'Missing subscription_id or user_id' }, { status: 400 }, cors);
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
      return json({ error: 'Failed to update subscription' }, { status: 500 }, cors);
    }

    return json({ success: true, subscription: response.data }, {}, cors);
  } catch (e) {
    console.error('payment-webhook error', e);
    return json({ error: 'Internal error' }, { status: 500 }, cors);
  }
});
