/**
 * create-payment Edge Function
 *
 * Stage C disable-first stub for retiring the legacy payment creation contour.
 * Keeps the endpoint reversible while preventing new legacy payment creation.
 */

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

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 }, cors);
  }

  return json(
    {
      error: 'Legacy payment contour retired',
      code: 'legacy_payment_contour_retired',
      detail: 'create-payment is disabled in the current live payment posture. Use the app-target YooKassa checkout contour instead.',
    },
    { status: 410 },
    cors
  );
});
