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

Deno.serve(async (req) => {
  // YooKassa webhook security check (basic example, ideally verify IP range or signature)
  const userAgent = req.headers.get('user-agent') || '';
  if (!userAgent.includes('YooKassa') && !userAgent.includes('Yandex.Money')) {
    // Optional: add stricter validation here
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
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
