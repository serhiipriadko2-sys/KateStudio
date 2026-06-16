const CORS_HEADERS = {
  'access-control-allow-origin': 'https://ksebe-studio.ru',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
  'content-type': 'application/json; charset=utf-8',
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  return json(
    {
      error: 'Legacy AI contour retired',
      code: 'ai_contour_retired',
      detail: 'ai-embeddings is disabled in the current live AI posture. Use gemini-proxy for supported AI operations.',
    },
    410
  );
});
