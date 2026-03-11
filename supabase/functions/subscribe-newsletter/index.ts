/**
 * subscribe-newsletter Edge Function
 * Subscribes an email to the Mailchimp audience list.
 *
 * Required Supabase secrets:
 *   MAILCHIMP_API_KEY  — e.g. "...key...-dc21"
 *   MAILCHIMP_LIST_ID  — Audience / List ID from Mailchimp dashboard
 *
 * The datacenter (dc) is parsed automatically from the API key suffix.
 *
 * Request body (JSON):
 *   { email: string; name?: string }
 *
 * Response:
 *   200 { success: true }
 *   400 { error: 'invalid_email' | 'missing_email' }
 *   409 { error: 'already_subscribed' }
 *   500 { error: 'server_error' }
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'https://ksebe-studio.ru',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  // ── Validate secrets ────────────────────────────────────────────────────────
  const apiKey = Deno.env.get('MAILCHIMP_API_KEY');
  const listId = Deno.env.get('MAILCHIMP_LIST_ID');

  if (!apiKey || !listId) {
    console.error('subscribe-newsletter: missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID');
    return json({ error: 'server_error' }, 500);
  }

  // Extract datacenter from key suffix (e.g. "...abc-us21" → "us21")
  const dc = apiKey.split('-').pop();
  if (!dc) {
    console.error('subscribe-newsletter: invalid MAILCHIMP_API_KEY format');
    return json({ error: 'server_error' }, 500);
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  if (!email) return json({ error: 'missing_email' }, 400);
  if (!EMAIL_REGEX.test(email)) return json({ error: 'invalid_email' }, 400);

  // Split name into first/last if provided
  const nameParts = (body.name?.trim() ?? '').split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ');

  // ── Mailchimp API call ──────────────────────────────────────────────────────
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const payload = {
    email_address: email,
    status: 'subscribed',
    ...(firstName || lastName ? { merge_fields: { FNAME: firstName, LNAME: lastName } } : {}),
    tags: ['ksebe-website'],
  };

  let mcRes: Response;
  try {
    mcRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('subscribe-newsletter: Mailchimp network error', err);
    return json({ error: 'server_error' }, 500);
  }

  // ── Handle Mailchimp response ───────────────────────────────────────────────
  if (mcRes.ok) {
    return json({ success: true }, 200);
  }

  const mcBody = await mcRes.json().catch(() => ({}));
  const title: string = mcBody?.title ?? '';

  // "Member Exists" is returned when already subscribed
  if (mcRes.status === 400 && title === 'Member Exists') {
    return json({ error: 'already_subscribed' }, 409);
  }

  console.error('subscribe-newsletter: Mailchimp error', mcRes.status, mcBody);
  return json({ error: 'server_error' }, 500);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
