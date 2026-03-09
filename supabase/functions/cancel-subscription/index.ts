/**
 * cancel-subscription Edge Function
 *
 * Cancels the current user's active subscription.
 * Requires auth — uses service role to bypass RLS (users cannot update
 * their own subscriptions directly per security policy).
 */
import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

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

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey)
    throw new Error('Supabase configuration error: Service Role missing');
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function getSupabaseUserClient(token: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) throw new Error('Supabase configuration error');
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 }, cors);

  const token = getBearerToken(req);
  if (!token) return json({ error: 'Authentication required' }, { status: 401 }, cors);

  try {
    // Verify the user's identity using their token
    const userClient = getSupabaseUserClient(token);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser(token);

    if (authError || !user) {
      return json({ error: 'Invalid user session' }, { status: 401 }, cors);
    }

    // Use service role to update subscription (bypasses RLS per security design)
    const admin = getSupabaseAdmin();
    const { data: subscription, error: dbError } = await admin
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .neq('status', 'canceled') // idempotent: don't re-cancel
      .select()
      .single();

    if (dbError) {
      console.error('Failed to cancel subscription:', dbError);
      return json({ error: 'Failed to cancel subscription' }, { status: 500 }, cors);
    }

    console.log(`Subscription canceled: user=${user.id}`);
    return json({ success: true, subscription }, {}, cors);
  } catch (e) {
    console.error('Cancel subscription error:', e);
    return json(
      { error: e instanceof Error ? e.message : 'Internal Server Error' },
      { status: 500 },
      cors
    );
  }
});
