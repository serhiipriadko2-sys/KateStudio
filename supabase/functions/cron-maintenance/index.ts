/**
 * cron-maintenance Edge Function
 *
 * Periodic maintenance tasks run daily via GitHub Actions cron or pg_cron.
 *
 * Tasks:
 *   1. expire_subscriptions  — sets active subscriptions to 'past_due' when
 *                              current_period_end has passed
 *   2. recover_payments      — checks YooKassa for pending payments older than
 *                              30 min and updates status (handles missed webhooks)
 *   3. cleanup_analytics     — deletes analytics_events older than 90 days
 *
 * Required secrets:
 *   SUPABASE_SERVICE_ROLE_KEY  — for admin DB access
 *   YOOKASSA_SHOP_ID           — for payment recovery
 *   YOOKASSA_SECRET_KEY        — for payment recovery
 *   CRON_SECRET                — simple bearer token to protect the endpoint
 *
 * Invocation:
 *   POST /functions/v1/cron-maintenance
 *   Authorization: Bearer <CRON_SECRET>
 *   Body (optional): { "tasks": ["expire_subscriptions"] }  // runs all if omitted
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

const CORS_HEADERS = { 'Content-Type': 'application/json' };

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Task 1: Expire subscriptions ─────────────────────────────────────────────

async function expireSubscriptions(): Promise<{ expired: number }> {
  const admin = getAdmin();
  const now = new Date().toISOString();

  const { data, error } = await admin
    .from('subscriptions')
    .update({ status: 'past_due', updated_at: now })
    .eq('status', 'active')
    .lt('current_period_end', now)
    .select('id');

  if (error) throw new Error(`expire_subscriptions: ${error.message}`);
  return { expired: data?.length ?? 0 };
}

// ── Task 2: Payment recovery (missed webhooks) ────────────────────────────────

async function recoverPayments(): Promise<{ recovered: number; failed: number }> {
  const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');
  if (!shopId || !secretKey) {
    console.warn('cron-maintenance: YOOKASSA_SHOP_ID/SECRET_KEY not set — skipping recovery');
    return { recovered: 0, failed: 0 };
  }

  const admin = getAdmin();

  // Find subscriptions stuck in 'pending' for >30 minutes
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: pending, error: fetchErr } = await admin
    .from('subscriptions')
    .select('id, user_id, plan, provider_subscription_id, created_at')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .not('provider_subscription_id', 'is', null);

  if (fetchErr) throw new Error(`recover_payments fetch: ${fetchErr.message}`);
  if (!pending || pending.length === 0) return { recovered: 0, failed: 0 };

  let recovered = 0;
  let failed = 0;

  for (const sub of pending) {
    if (!sub.provider_subscription_id) continue;

    try {
      const res = await fetch(
        `https://api.yookassa.ru/v3/payments/${sub.provider_subscription_id}`,
        {
          headers: {
            Authorization: `Basic ${btoa(`${shopId}:${secretKey}`)}`,
          },
        }
      );

      if (!res.ok) {
        console.error(
          `cron: YooKassa fetch failed for ${sub.provider_subscription_id}`,
          res.status
        );
        continue;
      }

      const payment = await res.json();
      const now = new Date().toISOString();

      if (payment.status === 'succeeded') {
        await admin
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: now,
          })
          .eq('id', sub.id);
        recovered++;
      } else if (payment.status === 'canceled') {
        await admin
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: now })
          .eq('id', sub.id);
        failed++;
      }
      // If still 'pending' in YooKassa — leave as is, try again next run
    } catch (err) {
      console.error(`cron: recovery error for sub ${sub.id}:`, err);
    }
  }

  return { recovered, failed };
}

// ── Task 3: Analytics cleanup ─────────────────────────────────────────────────

async function cleanupAnalytics(retentionDays = 90): Promise<{ deleted: number }> {
  const admin = getAdmin();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from('analytics_events')
    .delete()
    .lt('created_at', cutoff)
    .select('id');

  if (error) throw new Error(`cleanup_analytics: ${error.message}`);
  return { deleted: data?.length ?? 0 };
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret) {
    console.error('cron-maintenance: missing CRON_SECRET');
    return new Response(JSON.stringify({ error: 'server_misconfigured' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== cronSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: CORS_HEADERS,
    });
  }

  // Determine which tasks to run
  let tasks: string[] = ['expire_subscriptions', 'recover_payments', 'cleanup_analytics'];
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body.tasks) && body.tasks.length > 0) {
      tasks = body.tasks as string[];
    }
  } catch {
    /* use defaults */
  }

  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const startTime = Date.now();

  for (const task of tasks) {
    try {
      switch (task) {
        case 'expire_subscriptions':
          results[task] = await expireSubscriptions();
          break;
        case 'recover_payments':
          results[task] = await recoverPayments();
          break;
        case 'cleanup_analytics':
          results[task] = await cleanupAnalytics();
          break;
        default:
          errors[task] = 'unknown_task';
      }
    } catch (err) {
      errors[task] = err instanceof Error ? err.message : String(err);
      console.error(`cron-maintenance task "${task}" failed:`, err);
    }
  }

  const response = {
    ok: Object.keys(errors).length === 0,
    ran_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    results,
    ...(Object.keys(errors).length > 0 ? { errors } : {}),
  };

  console.warn('cron-maintenance completed:', JSON.stringify(response));

  return new Response(JSON.stringify(response), {
    status: response.ok ? 200 : 207, // 207 Multi-Status if partial failure
    headers: CORS_HEADERS,
  });
});
