import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey)
    throw new Error('Supabase configuration error: Service Role missing');

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return result === 0;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
  if (!secret) {
    console.error('PAYMENT_WEBHOOK_SECRET is not set — rejecting all webhooks');
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500 });
  }

  const signature = req.headers.get('x-webhook-signature');
  if (!signature || !timingSafeEqual(signature, secret)) {
    console.warn('Invalid or missing webhook signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const event = await req.json();

    if (event.type === 'notification') {
      const payment = event.object;

      if (payment.status === 'succeeded' && payment.paid === true) {
        const userId = payment.metadata.user_id;
        const planId = payment.metadata.plan_id;

        if (userId && planId) {
          const supabase = getSupabaseAdmin();

          // Update subscription status to active
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan: planId,
            status: 'active',
            updated_at: new Date().toISOString(),
            // Calculate expiration date based on plan (e.g., +1 month)
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

          if (error) {
            console.error('Failed to update subscription:', error);
            return new Response('Database error', { status: 500 });
          }
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error('Webhook processing error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
});
