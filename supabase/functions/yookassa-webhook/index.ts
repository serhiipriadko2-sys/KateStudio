import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type YooKassaPayment = {
  id?: string;
  status?: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid?: boolean;
  amount?: { value?: string; currency?: string };
  metadata?: {
    order_id?: string;
    user_id?: string;
    pricing_plan_id?: string;
  };
};

function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase configuration error');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function getYooKassaConfig() {
  const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');
  const apiBase = Deno.env.get('YOOKASSA_API_BASE') || 'https://api.yookassa.ru/v3';
  const mock = Deno.env.get('YOOKASSA_MOCK') === 'true';

  if (mock) return { shopId: 'mock', secretKey: 'mock', apiBase, mock };
  if (!shopId || !secretKey) throw new Error('YooKassa configuration error');
  return { shopId, secretKey, apiBase, mock };
}

function centsFromAmount(value?: string): number | null {
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) return null;
  return Math.round(Number(value) * 100);
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

function verifyOptionalBasicAuth(req: Request): boolean {
  const expectedUser = Deno.env.get('YOOKASSA_WEBHOOK_USER');
  const expectedPassword = Deno.env.get('YOOKASSA_WEBHOOK_PASSWORD');
  if (!expectedUser && !expectedPassword) return true;

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) return false;
  try {
    const decoded = atob(auth.slice('Basic '.length));
    return decoded === `${expectedUser}:${expectedPassword}`;
  } catch {
    return false;
  }
}

async function fetchPayment(
  paymentId: string,
  signalPayment?: YooKassaPayment
): Promise<YooKassaPayment> {
  const config = getYooKassaConfig();
  if (config.mock && signalPayment?.id) return signalPayment;

  const response = await fetch(`${config.apiBase}/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${btoa(`${config.shopId}:${config.secretKey}`)}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`YooKassa fetch payment failed: ${response.status}`);
  return response.json();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!verifyOptionalBasicAuth(req)) return unauthorized();

  try {
    const rawEvent = await req.json();
    const signalPayment = (rawEvent?.object ?? rawEvent) as YooKassaPayment;
    const paymentId = signalPayment?.id;
    if (!paymentId) return new Response('OK', { status: 200 });

    const payment = await fetchPayment(paymentId, signalPayment);
    const orderId = payment.metadata?.order_id;
    const userId = payment.metadata?.user_id;
    const pricingPlanId = payment.metadata?.pricing_plan_id;
    if (!orderId || !userId || !pricingPlanId) return new Response('OK', { status: 200 });

    const admin = getSupabaseAdmin();
    const { data: order, error: orderError } = await admin
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.warn('Payment order not found:', orderId);
      return new Response('OK', { status: 200 });
    }

    const paidAmountCents = centsFromAmount(payment.amount?.value);
    const isCanonicalMatch =
      order.provider_payment_id === payment.id &&
      order.user_id === userId &&
      order.pricing_plan_id === pricingPlanId &&
      order.amount_cents === paidAmountCents &&
      order.currency === payment.amount?.currency;

    if (!isCanonicalMatch) {
      console.warn('YooKassa payment/order mismatch:', { orderId, paymentId });
      await admin
        .from('payment_orders')
        .update({
          status: 'failed',
          error_message: 'Provider payment verification mismatch',
          provider_payload: payment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      return new Response('OK', { status: 200 });
    }

    if (payment.status === 'succeeded' && payment.paid === true) {
      const now = new Date();
      const snapshot = order.plan_snapshot as {
        title?: string;
        visits_total?: number;
        valid_days?: number;
      };
      const visitsTotal = Number(snapshot.visits_total || 1);
      const validDays = Number(snapshot.valid_days || 30);
      const validUntil = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

      const { error: orderUpdateError } = await admin
        .from('payment_orders')
        .update({
          status: 'succeeded',
          paid_at: now.toISOString(),
          provider_payload: payment,
          updated_at: now.toISOString(),
        })
        .eq('id', orderId);

      if (orderUpdateError) throw orderUpdateError;

      const { error: passError } = await admin.from('user_passes').upsert(
        {
          user_id: userId,
          payment_order_id: orderId,
          pricing_plan_id: pricingPlanId,
          title: snapshot.title || 'Абонемент',
          visits_total: visitsTotal,
          visits_remaining: visitsTotal,
          valid_from: now.toISOString(),
          valid_until: validUntil.toISOString(),
          status: 'active',
          updated_at: now.toISOString(),
        },
        { onConflict: 'payment_order_id' }
      );

      if (passError) throw passError;
    } else if (payment.status === 'canceled') {
      const { error } = await admin
        .from('payment_orders')
        .update({
          status: 'canceled',
          provider_payload: payment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (error) throw error;
    } else if (payment.status === 'waiting_for_capture') {
      await admin
        .from('payment_orders')
        .update({
          status: 'waiting_for_capture',
          provider_payload: payment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error('YooKassa webhook processing error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
});
