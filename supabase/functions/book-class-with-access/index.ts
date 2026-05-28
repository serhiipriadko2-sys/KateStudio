import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { z } from 'npm:zod@3.24.1';

const RequestSchema = z.object({
  classId: z.string().min(1).max(120),
  className: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1).max(40),
  location: z.string().min(1).max(200),
  timestamp: z.number().int().positive().optional(),
});

const allowedOrigins = [
  'https://ksebe-studio.ru',
  'https://app.ksebe-studio.ru',
  'https://artful-striker-476211-h4.web.app',
  ...(Deno.env.get('ENVIRONMENT') !== 'production'
    ? ['http://localhost:3000', 'http://localhost:5173']
    : []),
];

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

  try {
    const admin = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError || !user) return json({ error: 'Invalid user session' }, { status: 401 }, cors);

    const { data, error } = await admin
      .rpc('book_class_with_access_internal', {
        p_user_id: user.id,
        p_class_id: payload.classId,
        p_class_name: payload.className,
        p_class_date: payload.date,
        p_class_time: payload.time,
        p_class_location: payload.location,
        p_class_timestamp: payload.timestamp ?? Date.now(),
      })
      .single();

    if (error) {
      console.error('book-class-with-access RPC failed:', error);
      return json({ error: 'Booking failed' }, { status: 500 }, cors);
    }

    return json(data, {}, cors);
  } catch (e) {
    console.error('book-class-with-access failed:', e);
    return json({ error: 'Internal Server Error' }, { status: 500 }, cors);
  }
});
