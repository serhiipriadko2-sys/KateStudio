import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { z } from 'npm:zod@3.24.1';

const FUNCTION_NAME = 'book-class-with-access';

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

function getCorrelationId(req: Request): string {
  const existing = req.headers.get('x-correlation-id')?.trim();
  return existing || crypto.randomUUID();
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.ksebe-studio.ru';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-headers':
      'authorization, x-client-info, apikey, content-type, x-correlation-id',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-expose-headers': 'x-correlation-id',
    vary: 'Origin',
  };
}

function serializeError(error: unknown) {
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { message: String(error) };
}

function logEvent(
  event: string,
  correlationId: string,
  fields: Record<string, unknown> = {},
  level: 'warn' | 'error' = 'warn'
) {
  const payload = JSON.stringify({
    function: FUNCTION_NAME,
    event,
    correlation_id: correlationId,
    ...fields,
  });

  if (level === 'error') console.error(payload);
  else console.warn(payload);
}

function json(
  data: unknown,
  init: ResponseInit = {},
  headers: HeadersInit = {},
  correlationId?: string
): Response {
  const responseHeaders = new Headers(init.headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  if (correlationId) responseHeaders.set('x-correlation-id', correlationId);
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
  const startedAt = Date.now();
  const correlationId = getCorrelationId(req);
  const cors = getCorsHeaders(req);

  logEvent('request_received', correlationId, {
    method: req.method,
    origin: req.headers.get('origin') || null,
  });

  if (req.method === 'OPTIONS') {
    logEvent('request_completed', correlationId, {
      status: 200,
      code: 'preflight_ok',
      duration_ms: Date.now() - startedAt,
    });
    return new Response('ok', { headers: { ...cors, 'x-correlation-id': correlationId } });
  }

  if (req.method !== 'POST') {
    logEvent(
      'request_completed',
      correlationId,
      {
        status: 405,
        code: 'method_not_allowed',
        duration_ms: Date.now() - startedAt,
      },
      'warn'
    );
    return json({ error: 'Method not allowed' }, { status: 405 }, cors, correlationId);
  }

  const token = getBearerToken(req);
  if (!token) {
    logEvent(
      'request_completed',
      correlationId,
      {
        status: 401,
        code: 'auth_required',
        duration_ms: Date.now() - startedAt,
      },
      'warn'
    );
    return json({ error: 'Authentication required' }, { status: 401 }, cors, correlationId);
  }

  let payload: z.infer<typeof RequestSchema>;
  try {
    payload = RequestSchema.parse(await req.json());
  } catch (e) {
    logEvent(
      'request_completed',
      correlationId,
      {
        status: 400,
        code: 'validation_error',
        duration_ms: Date.now() - startedAt,
        error: serializeError(e),
      },
      'warn'
    );
    return json(
      { error: 'Validation error', details: e instanceof z.ZodError ? e.errors : e },
      { status: 400 },
      cors,
      correlationId
    );
  }

  try {
    const admin = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError || !user) {
      logEvent(
        'request_completed',
        correlationId,
        {
          status: 401,
          code: 'invalid_user_session',
          duration_ms: Date.now() - startedAt,
          error: authError ? serializeError(authError) : null,
        },
        'warn'
      );
      return json({ error: 'Invalid user session' }, { status: 401 }, cors, correlationId);
    }

    logEvent('session_verified', correlationId);

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
      logEvent(
        'request_completed',
        correlationId,
        {
          status: 500,
          code: 'rpc_failed',
          duration_ms: Date.now() - startedAt,
          error: serializeError(error),
        },
        'error'
      );
      return json({ error: 'Booking failed' }, { status: 500 }, cors, correlationId);
    }

    logEvent('request_completed', correlationId, {
      status: 200,
      code: data?.code ?? 'unknown',
      ok: data?.ok ?? null,
      duration_ms: Date.now() - startedAt,
    });

    return json(data, {}, cors, correlationId);
  } catch (e) {
    logEvent(
      'request_completed',
      correlationId,
      {
        status: 500,
        code: 'internal_error',
        duration_ms: Date.now() - startedAt,
        error: serializeError(e),
      },
      'error'
    );
    return json({ error: 'Internal Server Error' }, { status: 500 }, cors, correlationId);
  }
});
