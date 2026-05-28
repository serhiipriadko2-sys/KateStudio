/**
 * payment-webhook Edge Function
 *
 * Stage E disable-first stub for retiring the legacy payment completion contour.
 * Keeps the endpoint reversible while preventing further legacy completion writes.
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-yookassa-signature',
        'access-control-allow-methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(
    JSON.stringify({
      error: 'Legacy payment contour retired',
      code: 'legacy_payment_contour_retired',
      detail: 'payment-webhook is disabled in the current live payment posture.',
    }),
    {
      status: 410,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    }
  );
});
