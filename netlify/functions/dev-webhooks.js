/**
 * GET/POST/PATCH/DELETE /.netlify/functions/dev-webhooks
 *
 * Manages a signed-in user's own webhooks (Developers.tsx > Webhooks tab).
 * Session-authenticated, same pattern as dev-keys.js. GET also returns the
 * user's 25 most recent deliveries (real ones now — including from the
 * "Test" button, action=test below — not the Math.random() simulation the
 * page used to fake).
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import ws from 'ws';
import { deliverOne } from './_lib/webhookDelivery.js';
import { assertPublicHttpsUrl } from './_lib/ssrfGuard.js';

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('dev-webhooks: Supabase client init failed:', err.message);
}

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const requestStore = new Map();
const shouldRateLimit = (key) => {
  const current = Date.now();
  const entry = requestStore.get(key) || { count: 0, windowStart: current };
  if (current - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = current;
    entry.count = 0;
  }
  entry.count += 1;
  requestStore.set(key, entry);
  return entry.count > MAX_REQUESTS_PER_WINDOW;
};

const MAX_WEBHOOKS = 10;
const ALLOWED_EVENTS = new Set(['analysis.completed', 'analysis.failed', 'sentiment.dropped', 'score.changed']);

const isValidUrl = (u) => {
  try { const parsed = new URL(u); return parsed.protocol === 'https:'; } catch { return false; }
};

export const handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  if (!supabaseAdmin) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

  if (shouldRateLimit(user.id)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const [{ data: webhooks, error: whError }, { data: deliveries, error: delError }] = await Promise.all([
        supabaseAdmin.from('webhooks').select('id, url, events, active, secret, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabaseAdmin.from('webhook_deliveries').select('id, webhook_id, event, status_code, ok, error, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(25),
      ]);
      if (whError) return { statusCode: 500, headers, body: JSON.stringify({ error: whError.message }) };
      if (delError) return { statusCode: 500, headers, body: JSON.stringify({ error: delError.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ webhooks: webhooks || [], deliveries: deliveries || [] }) };
    }

    if (event.httpMethod === 'POST') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

      // action=test delivers a real sample event to an existing webhook,
      // rather than creating a new one.
      if (payload.action === 'test') {
        const id = typeof payload.id === 'string' ? payload.id : '';
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id is required' }) };
        const { data: webhook, error: findError } = await supabaseAdmin
          .from('webhooks').select('id, user_id, url, secret, events').eq('id', id).eq('user_id', user.id).maybeSingle();
        if (findError) return { statusCode: 500, headers, body: JSON.stringify({ error: findError.message }) };
        if (!webhook) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Webhook not found' }) };

        const testEvent = webhook.events?.[0] || 'analysis.completed';
        const result = await deliverOne(supabaseAdmin, webhook, testEvent, {
          brandName: 'Example Brand',
          trustScore: 78,
          note: 'This is a test delivery triggered from the Developers page.',
        });
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }

      const url = typeof payload.url === 'string' ? payload.url.trim() : '';
      if (!isValidUrl(url)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'A valid HTTPS URL is required' }) };
      try {
        await assertPublicHttpsUrl(url);
      } catch (err) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
      }

      const events = Array.isArray(payload.events) ? payload.events.filter((e) => ALLOWED_EVENTS.has(e)) : [];
      if (events.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Select at least one event' }) };

      const { count } = await supabaseAdmin.from('webhooks').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      if ((count ?? 0) >= MAX_WEBHOOKS) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Limit of ${MAX_WEBHOOKS} webhooks reached. Delete one first.` }) };
      }

      const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
      const { data, error } = await supabaseAdmin
        .from('webhooks')
        .insert({ user_id: user.id, url, events, secret })
        .select('id, url, events, active, secret, created_at')
        .single();
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'PATCH') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
      const id = typeof payload.id === 'string' ? payload.id : '';
      if (!id || typeof payload.active !== 'boolean') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and active are required' }) };
      }
      const { error } = await supabaseAdmin.from('webhooks').update({ active: payload.active }).eq('id', id).eq('user_id', user.id);
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
      const id = typeof payload.id === 'string' ? payload.id : '';
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id is required' }) };
      const { error } = await supabaseAdmin.from('webhooks').delete().eq('id', id).eq('user_id', user.id);
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('dev-webhooks handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
