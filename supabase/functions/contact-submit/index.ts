import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type ContactPayload = {
  name: string;
  phone: string;
  message?: string;
  recaptchaToken: string;
};

type RecaptchaResponse = {
  success: boolean;
  score?: number;
  action?: string;
  'error-codes'?: string[];
};

const MAX_REQUESTS_PER_HOUR = 5;
const KV_TTL_MS = 60 * 60 * 1000;

const corsHeaders: HeadersInit = {
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const getCorsOrigin = (req: Request): string => {
  const origin = req.headers.get('origin') ?? '';
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowed.length === 0) return origin;
  return allowed.includes(origin) ? origin : allowed[0];
};

const json = (data: unknown, origin: string, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('access-control-allow-origin', origin);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, String(value)));
  return new Response(JSON.stringify(data), { ...init, headers });
};

const getSupabaseClient = () => {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase env missing');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
};

const getClientIp = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
};

const checkRateLimit = async (ip: string): Promise<boolean> => {
  const kv = await Deno.openKv();
  const key = ['contact_submit', ip];
  const existing = await kv.get<{ count: number; resetAt: number }>(key);
  const now = Date.now();

  if (!existing.value || existing.value.resetAt <= now) {
    await kv.set(key, { count: 1, resetAt: now + KV_TTL_MS }, { expireIn: KV_TTL_MS });
    return true;
  }

  if (existing.value.count >= MAX_REQUESTS_PER_HOUR) return false;

  await kv.set(
    key,
    { count: existing.value.count + 1, resetAt: existing.value.resetAt },
    { expireIn: existing.value.resetAt - now }
  );
  return true;
};

const verifyRecaptcha = async (token: string, ip: string): Promise<void> => {
  const secret = Deno.env.get('RECAPTCHA_SECRET_KEY');
  if (!secret) {
    throw new Error('reCAPTCHA secret missing');
  }
  const params = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = (await res.json()) as RecaptchaResponse;
  const minScore = Number(Deno.env.get('RECAPTCHA_MIN_SCORE') ?? '0.5');
  if (!data.success || (data.score ?? 0) < minScore) {
    throw new Error('reCAPTCHA verification failed');
  }
};

Deno.serve(async (req) => {
  const origin = getCorsOrigin(req);
  if (req.method === 'OPTIONS') {
    const headers = new Headers(corsHeaders);
    headers.set('access-control-allow-origin', origin);
    return new Response('ok', { headers });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, origin, { status: 405 });
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return json({ error: 'Invalid JSON' }, origin, { status: 400 });
  }

  if (!payload.name || !payload.phone || !payload.recaptchaToken) {
    return json({ error: 'Missing required fields' }, origin, { status: 400 });
  }

  const ip = getClientIp(req);
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return json({ error: 'Too many requests' }, origin, { status: 429 });
  }

  try {
    await verifyRecaptcha(payload.recaptchaToken, ip);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('contacts').insert({
      name: payload.name,
      phone: payload.phone,
      message: payload.message ?? '',
      source: 'web',
      ip_address: ip,
    });

    if (error) throw error;
    return json({ status: 'ok' }, origin);
  } catch (error) {
    console.error('contact-submit error', error);
    return json({ error: 'Request failed' }, origin, { status: 500 });
  }
});
