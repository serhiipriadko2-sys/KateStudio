import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { z } from 'npm:zod@3.24.1';

const RequestSchema = z.object({
  pricingPlanId: z.string().uuid(),
  returnUrl: z.string().url().optional(),
});

const defaultAllowedOrigins = [
  'https://ksebe-studio.ru',
  'https://app.ksebe-studio.ru',
  'https://artful-striker-476211-h4.web.app',
];

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = trimmed.includes('://') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

const configuredAllowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map(normalizeOrigin)
  .filter((origin): origin is string => Boolean(origin));

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins,
    ...configuredAllowedOrigins,
    ...(Deno.env.get('ENVIRONMENT') !== 'production'
      ? ['http://localhost:3000', 'http://localhost:5173']
      : []),
  ])
);

const allowedReturnHosts = new Set(allowedOrigins.map((origin) => new URL(origin).hostname));

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.ksebe-studio.ru';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'Origin',
  };
}

function json(data: unknown, init: ResponseInit = {}, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(init.headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  Object.entries(headers).forEach(([k, v]) => responseHeaders.set(k, String(v)));
  return new Response(JSON.stringify(data), { ...init, headers: responseHeaders });
}

function getBearerToken(req: Request): string | null {
  const match = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isAllowedReturnUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (['ksebe:', 'capacitor:'].includes(parsed.protocol)) return true;
    if (parsed.hostname === 'localhost') return true;
    return allowedReturnHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}

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
  const vatCode = Number(Deno.env.get('YOOKASSA_VAT_CODE'));
  const apiBase = Deno.env.get('YOOKASSA_API_BASE') || 'https://api.yookassa.ru/v3';
  const mock = Deno.env.get('YOOKASSA_MOCK') === 'true';

  if (mock) return { shopId: 'mock', secretKey: 'mock', vatCode: vatCode || 1, apiBase, mock };
  if (!shopId || !secretKey || !Number.isInteger(vatCode) || vatCode < 1) {
    throw new Error('YooKassa configuration error');
  }

  return { shopId, secretKey, vatCode, apiBase, mock };
}

function formatAmount(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 }, cors);

  const token = getBearerToken(req);
  if (!token) return json({ error: 'Authentication required' }, { status: 401 }, cors);

  let payload: z.infer<typeof RequestSchema>;
  try {
    payload = RequestSchema.parse(await req.json());
  } catch (e) {
    return json(
      { error: 'Validation error', details: e instanceof z.ZodError ? e.errors : e },
      { status: 400 },
      cors
    );
  }

  if (payload.returnUrl && !isAllowedReturnUrl(payload.returnUrl)) {
    return json({ error: 'Invalid returnUrl' }, { status: 400 }, cors);
  }

  try {
    const admin = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError || !user) return json({ error: 'Invalid user session' }, { status: 401 }, cors);

    const { data: plan, error: planError } = await admin
      .from('pricing_plans')
      .select(
        'id, category, title, price, description, features, amount_cents, currency, visits_total, valid_days, is_payable, is_active'
      )
      .eq('id', payload.pricingPlanId)
      .single();

    if (planError || !plan || !plan.is_active) {
      return json({ error: 'Pricing plan not found' }, { status: 404 }, cors);
    }

    if (!plan.is_payable || !plan.amount_cents || !plan.visits_total || !plan.valid_days) {
      return json({ error: 'Pricing plan is not payable online' }, { status: 400 }, cors);
    }

    const customerContact = user.email || user.phone;
    if (!customerContact) {
      return json({ error: 'Customer phone or email required for receipt' }, { status: 400 }, cors);
    }

    const planSnapshot = {
      id: plan.id,
      category: plan.category,
      title: plan.title,
      price: plan.price,
      description: plan.description,
      features: plan.features ?? [],
      amount_cents: plan.amount_cents,
      currency: plan.currency,
      visits_total: plan.visits_total,
      valid_days: plan.valid_days,
    };

    const { data: order, error: orderError } = await admin
      .from('payment_orders')
      .insert({
        user_id: user.id,
        pricing_plan_id: plan.id,
        amount_cents: plan.amount_cents,
        currency: plan.currency ?? 'RUB',
        plan_snapshot: planSnapshot,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to create payment order:', orderError);
      return json({ error: 'Failed to create payment order' }, { status: 500 }, cors);
    }

    const config = getYooKassaConfig();
    const returnUrl = payload.returnUrl || 'https://app.ksebe-studio.ru';
    const amountValue = formatAmount(plan.amount_cents);

    const paymentBody = {
      amount: { value: amountValue, currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      description: `K Sebe: ${plan.title}`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        pricing_plan_id: plan.id,
      },
      receipt: {
        customer: user.email ? { email: user.email } : { phone: user.phone },
        items: [
          {
            description: plan.title,
            quantity: '1.00',
            amount: { value: amountValue, currency: 'RUB' },
            vat_code: config.vatCode,
            payment_subject: 'service',
            payment_mode: 'full_payment',
          },
        ],
      },
    };

    const payment = config.mock
      ? {
          id: `mock_${order.id}`,
          status: 'pending',
          confirmation: { confirmation_url: `${returnUrl}?payment_order=${order.id}` },
          metadata: paymentBody.metadata,
        }
      : await fetch(`${config.apiBase}/payments`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${config.shopId}:${config.secretKey}`)}`,
            'Content-Type': 'application/json',
            'Idempotence-Key': order.id,
          },
          body: JSON.stringify(paymentBody),
        }).then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`YooKassa API error ${response.status}: ${errorText}`);
          }
          return response.json();
        });

    const confirmationUrl = payment.confirmation?.confirmation_url;
    if (!payment.id || !confirmationUrl) throw new Error('YooKassa response missing confirmation');

    const { error: updateError } = await admin
      .from('payment_orders')
      .update({
        provider_payment_id: payment.id,
        status: payment.status ?? 'pending',
        checkout_url: confirmationUrl,
        provider_payload: payment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to save YooKassa payment:', updateError);
      return json({ error: 'Failed to save payment' }, { status: 500 }, cors);
    }

    return json(
      {
        orderId: order.id,
        paymentId: payment.id,
        confirmationUrl,
        status: payment.status ?? 'pending',
      },
      {},
      cors
    );
  } catch (e) {
    console.error('Checkout creation failed:', e);
    return json(
      { error: e instanceof Error ? e.message : 'Internal Server Error' },
      { status: 500 },
      cors
    );
  }
});
