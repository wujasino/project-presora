/**
 * GET  /.netlify/functions/admin-update-user?email=...  -> account snapshot
 * POST /.netlify/functions/admin-update-user
 *      Body: { email, plan?, credits?, resetUsage? }
 *
 * Admin-only account management: change a user's plan, set their credit
 * balance, or reset this month's usage counter (support cases — a scan that
 * failed on our side still incremented the counter, etc.).
 *
 * All three fields are guarded by protect_plan_changes() (see the 20240134
 * migration) which rejects any non-service-role write, so these edits are
 * only possible through this function — and only after verifying the
 * caller's profiles.is_admin. Mirrors set-custom-plan-price.js.
 *
 * `credits` is real money (stripe-webhook.js tops it up from paid payment
 * links) so the change is written to the log with who did it.
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('admin-update-user: Supabase client init failed:', err.message);
}

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

// Keep in sync with enforce_analysis_limit()'s CASE and PLAN_LIMITS in
// src/hooks/useAccountInfo.ts — an unknown value here falls through to that
// trigger's ELSE branch (3/month) with no error anywhere.
//
// 'solo_brew' and 'growth_roast' used to be listed here. Migration 20240126
// removed their branches from the trigger as dead code, but this list wasn't
// updated, so an admin could still set either one — and silently cap that
// account at 3 analyses a month while the UI showed no limit at all.
const VALID_PLANS = new Set([
  'free', 'starter', 'solo', 'growth', 'enterprise', 'agency',
]);

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-zA-Z]{2,}$/;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
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

const SNAPSHOT_COLUMNS = 'id, email, plan, credits, analyses_this_month, analyses_reset_at, is_admin, subscription_status';

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    if (!supabaseAdmin) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
    }

    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!callerProfile?.is_admin) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin access required' }) };
    }

    if (shouldRateLimit(user.id)) {
      return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
    }

    // ── Look up an account ────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      const email = String(event.queryStringParameters?.email || '').trim().toLowerCase();
      if (!email || !EMAIL_RE.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
      }

      const { data: target, error } = await supabaseAdmin
        .from('profiles')
        .select(SNAPSHOT_COLUMNS)
        .eq('email', email)
        .maybeSingle();
      if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }
      if (!target) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'No account found for that email' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ user: target }) };
    }

    // ── Apply changes ─────────────────────────────────────────────────
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email || !EMAIL_RE.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const patch = {};

    if (payload.plan !== undefined) {
      const plan = String(payload.plan).trim().toLowerCase();
      if (!VALID_PLANS.has(plan)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Invalid plan. Allowed: ${[...VALID_PLANS].join(', ')}` }),
        };
      }
      patch.plan = plan;
    }

    if (payload.credits !== undefined) {
      const credits = payload.credits;
      if (!Number.isInteger(credits) || credits < 0 || credits > 1_000_000) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Credits must be a whole number between 0 and 1000000' }) };
      }
      patch.credits = credits;
    }

    if (payload.resetUsage === true) {
      // Both columns together: enforce_analysis_limit() re-zeroes the counter
      // only when analyses_reset_at is older than the current month, so
      // moving the date forward is what makes the reset stick.
      patch.analyses_this_month = 0;
      patch.analyses_reset_at = new Date().toISOString();
    }

    if (Object.keys(patch).length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nothing to update' }) };
    }

    const { data: target, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, plan, credits')
      .eq('email', email)
      .maybeSingle();
    if (findError) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: findError.message }) };
    }
    if (!target) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'No account found for that email' }) };
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(patch)
      .eq('id', target.id)
      .select(SNAPSHOT_COLUMNS)
      .single();
    if (updateError) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: updateError.message }) };
    }

    console.log(
      `admin-update-user: ${user.id} updated ${target.email} — ` +
      `plan ${target.plan}->${updated.plan}, credits ${target.credits}->${updated.credits}` +
      (payload.resetUsage === true ? ', usage reset' : ''),
    );

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, user: updated }) };
  } catch (err) {
    console.error('admin-update-user handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
