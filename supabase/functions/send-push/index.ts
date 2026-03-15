/**
 * send-push Edge Function
 * Sends Firebase Cloud Messaging push notifications to one or more users.
 *
 * Required Supabase secrets:
 *   SUPABASE_URL               — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — Service role key (to read push tokens)
 *   FIREBASE_PROJECT_ID        — Firebase project ID (e.g. "ksebe-studio")
 *   FIREBASE_SERVICE_ACCOUNT_JSON — Full service account JSON as a string
 *
 * Request body (JSON):
 *   {
 *     userIds: string[],       // Supabase auth user IDs to notify
 *     title: string,           // Notification title
 *     body: string,            // Notification body
 *     data?: Record<string, string>,  // Custom payload
 *     imageUrl?: string,       // Optional notification image
 *   }
 *
 * Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>  (internal use only)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type ServiceAccount = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  token_uri: string;
};

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

// ── FCM Auth: create a short-lived OAuth2 token via Service Account JWT ──────

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signingInput = `${enc(header)}.${enc(payload)}`;

  // Import the RSA private key
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const keyDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signingInput}.${sig}`;

  // Exchange JWT for access token
  const tokenRes = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Failed to get access token: ${tokenRes.status}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token as string;
}

// ── Send a single FCM message ─────────────────────────────────────────────────

async function sendFcmMessage(
  projectId: string,
  accessToken: string,
  token: string,
  notification: { title: string; body: string; image?: string },
  data?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const message: Record<string, unknown> = {
    token,
    notification: {
      title: notification.title,
      body: notification.body,
      ...(notification.image ? { image: notification.image } : {}),
    },
    webpush: {
      notification: {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        requireInteraction: false,
      },
      fcm_options: { link: '/' },
    },
    ...(data ? { data } : {}),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (res.ok) return { success: true };

  const err = await res.json().catch(() => ({}));
  const errCode: string = err?.error?.details?.[0]?.errorCode ?? err?.error?.status ?? 'UNKNOWN';

  // UNREGISTERED / INVALID_ARGUMENT means token is stale — caller should delete it
  return { success: false, error: errCode };
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Validate secrets
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
  const saJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');

  if (!supabaseUrl || !serviceRoleKey || !projectId || !saJson) {
    console.error('send-push: missing required secrets');
    return json({ error: 'server_misconfigured' }, 500);
  }

  // Explicitly require internal bearer auth.
  const token = getBearerToken(req);
  if (!token || token !== serviceRoleKey) {
    return json({ error: 'unauthorized' }, 401);
  }

  // Parse body
  let body: {
    userIds: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (!Array.isArray(body.userIds) || body.userIds.length === 0) {
    return json({ error: 'userIds must be a non-empty array' }, 400);
  }
  if (!body.title || !body.body) {
    return json({ error: 'title and body are required' }, 400);
  }

  // Parse service account
  let sa: ServiceAccount;
  try {
    sa = JSON.parse(saJson) as ServiceAccount;
  } catch {
    return json({ error: 'invalid FIREBASE_SERVICE_ACCOUNT_JSON' }, 500);
  }

  // Get FCM access token
  let accessToken: string;
  try {
    accessToken = await getAccessToken(sa);
  } catch (err) {
    console.error('send-push: auth error', err);
    return json({ error: 'firebase_auth_failed' }, 500);
  }

  // Fetch tokens for the target users
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: rows, error: dbErr } = await admin
    .from('user_push_tokens')
    .select('id, user_id, token, platform')
    .in('user_id', body.userIds);

  if (dbErr) {
    console.error('send-push: db error', dbErr.message);
    return json({ error: 'db_error' }, 500);
  }

  if (!rows || rows.length === 0) {
    return json({ sent: 0, skipped: 0, message: 'No tokens found for these users' });
  }

  // Send notifications in parallel (max 500 tokens per call — FCM limit)
  const results = await Promise.all(
    rows.map(async (row) => {
      const result = await sendFcmMessage(
        projectId,
        accessToken,
        row.token,
        { title: body.title, body: body.body, image: body.imageUrl },
        body.data
      );

      // Remove stale tokens automatically
      if (
        !result.success &&
        (result.error === 'UNREGISTERED' || result.error === 'INVALID_ARGUMENT')
      ) {
        await admin.from('user_push_tokens').delete().eq('id', row.id);
      }

      return { tokenId: row.id, platform: row.platform, ...result };
    })
  );

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`send-push: sent=${sent} failed=${failed}`);
  return json({ sent, failed, total: rows.length });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
