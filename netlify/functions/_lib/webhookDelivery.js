/**
 * Real webhook delivery — signs the payload with the webhook's own secret
 * (HMAC-SHA256, same scheme GitHub/Stripe use) and POSTs it to the
 * registered URL, recording the real result to webhook_deliveries. Used by
 * both the "Test" button (dev-webhooks.js) and real event firing (analyze.js,
 * check-score-alerts.js).
 */
import crypto from 'crypto';
import { assertPublicHttpsUrl } from './ssrfGuard.js';

const DELIVERY_TIMEOUT_MS = 8000;

export const sign = (secret, body) => crypto.createHmac('sha256', secret).update(body).digest('hex');

export async function deliverOne(supabaseAdmin, webhook, event, payload) {
  const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
  const signature = sign(webhook.secret, body);

  let statusCode = null;
  let ok = false;
  let error = null;
  try {
    // Re-checked here, not just at webhook creation (dev-webhooks.js) — DNS
    // can be repointed to an internal address after a webhook is registered
    // (DNS rebinding), and this check runs on every real delivery, not just
    // once.
    await assertPublicHttpsUrl(webhook.url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
    const res = await fetch(webhook.url, {
      method: 'POST',
      // Manual redirect handling — a 3xx response is recorded as a failed
      // delivery rather than transparently followed, which would otherwise
      // let a URL that passed the SSRF check redirect the actual request to
      // an internal address we never validated.
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        'X-Presora-Event': event,
        'X-Presora-Signature': `sha256=${signature}`,
      },
      body,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    statusCode = res.status;
    ok = res.ok;
  } catch (err) {
    error = (err?.message || 'Request failed').slice(0, 300);
  }

  await supabaseAdmin.from('webhook_deliveries').insert({
    webhook_id: webhook.id,
    user_id: webhook.user_id,
    event,
    status_code: statusCode,
    ok,
    error,
  });

  return { webhookId: webhook.id, ok, statusCode, error };
}

/**
 * Fires `event` to every active webhook the user has subscribed to it.
 * Best-effort: failures are recorded as deliveries, never thrown — a
 * misconfigured customer webhook must never break the scan/alert flow that
 * triggered it.
 */
export async function fireWebhooksForEvent(supabaseAdmin, { userId, event, payload }) {
  if (!userId) return [];
  try {
    const { data: webhooks, error } = await supabaseAdmin
      .from('webhooks')
      .select('id, user_id, url, secret')
      .eq('user_id', userId)
      .eq('active', true)
      .contains('events', [event]);
    if (error || !webhooks || webhooks.length === 0) return [];
    const settled = await Promise.allSettled(webhooks.map((wh) => deliverOne(supabaseAdmin, wh, event, payload)));
    return settled.map((s) => (s.status === 'fulfilled' ? s.value : { ok: false, error: s.reason?.message }));
  } catch (err) {
    console.error('fireWebhooksForEvent failed:', err.message);
    return [];
  }
}
