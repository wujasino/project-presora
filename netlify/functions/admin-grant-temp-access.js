/**
 * GET  /.netlify/functions/admin-grant-temp-access?email=...  -> current grant (or null)
 * POST /.netlify/functions/admin-grant-temp-access
 *      Body: { email, plan, days }               -> grant/extend temporary access
 *      Body: { email, revoke: true }              -> revoke early, revert now
 *
 * Admin-only: grants an account a plan for a fixed number of days — e.g. a
 * 14-day Business trial for a prospect — without a real subscription. The
 * account's plan changes immediately; expire-temp-access.js (run hourly)
 * reverts it automatically once expires_at passes.
 *
 * previous_plan is captured once, the first time a grant is created for a
 * user, and never overwritten by a later grant while one is still active —
 * otherwise granting a second trial before the first expires would forget
 * the account's real, paid-for plan and revert to the wrong thing.
 *
 * Same auth pattern as admin-update-user.js: caller must be signed in with
 * profiles.is_admin = true. profiles.plan is guarded by
 * protect_plan_changes() (migration 20240134), which only accepts a
 * service-role write — this function's supabaseAdmin client satisfies that.
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
  console.error('admin-grant-temp-access: Supabase client init failed:', err.message);
}

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

// Same list as admin-update-user.js's VALID_PLANS — keep in sync.
const VALID_PLANS = new Set(['free', 'starter', 'solo', 'growth', 'enterprise', 'agency']);

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-zA-Z]{2,}$/;
const MAX_DAYS = 365;

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

    // ── Look up the current grant for an account ──────────────────────
    if (event.httpMethod === 'GET') {
      const email = String(event.queryStringParameters?.email || '').trim().toLowerCase();
      if (!email || !EMAIL_RE.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
      }
      const { data: target, error: findError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (findError) return { statusCode: 500, headers, body: JSON.stringify({ error: findError.message }) };
      if (!target) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No account found for that email' }) };

      const { data: grant, error: grantError } = await supabaseAdmin
        .from('temporary_access_grants')
        .select('granted_plan, previous_plan, expires_at, created_at')
        .eq('user_id', target.id)
        .maybeSingle();
      if (grantError) return { statusCode: 500, headers, body: JSON.stringify({ error: grantError.message }) };

      return { statusCode: 200, headers, body: JSON.stringify({ grant: grant || null }) };
    }

    // ── Grant, extend, or revoke ────────────────────────────────────────
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

    const { data: target, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, plan')
      .eq('email', email)
      .maybeSingle();
    if (findError) return { statusCode: 500, headers, body: JSON.stringify({ error: findError.message }) };
    if (!target) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No account found for that email' }) };

    const { data: existingGrant, error: existingError } = await supabaseAdmin
      .from('temporary_access_grants')
      .select('id, previous_plan')
      .eq('user_id', target.id)
      .maybeSingle();
    if (existingError) return { statusCode: 500, headers, body: JSON.stringify({ error: existingError.message }) };

    // ── Revoke early ────────────────────────────────────────────────
    if (payload.revoke === true) {
      if (!existingGrant) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No active temporary grant for this account' }) };
      }
      const { data: reverted, error: revertError } = await supabaseAdmin
        .from('profiles')
        .update({ plan: existingGrant.previous_plan })
        .eq('id', target.id)
        .select('id, email, plan, credits, analyses_this_month, analyses_reset_at, is_admin, subscription_status')
        .single();
      if (revertError) return { statusCode: 500, headers, body: JSON.stringify({ error: revertError.message }) };

      const { error: deleteError } = await supabaseAdmin
        .from('temporary_access_grants')
        .delete()
        .eq('user_id', target.id);
      if (deleteError) console.error('admin-grant-temp-access: failed to delete revoked grant row:', deleteError.message);

      console.log(`admin-grant-temp-access: ${user.id} revoked temp access for ${target.email}, reverted to ${existingGrant.previous_plan}`);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, user: reverted }) };
    }

    // ── Grant / extend ──────────────────────────────────────────────
    const plan = String(payload.plan || '').trim().toLowerCase();
    if (!VALID_PLANS.has(plan)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid plan. Allowed: ${[...VALID_PLANS].join(', ')}` }) };
    }
    const days = Number(payload.days);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `"days" must be a whole number between 1 and ${MAX_DAYS}` }) };
    }

    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    // Only captured the first time — an extension must not forget the
    // account's real plan from before any temporary grant existed.
    const previousPlan = existingGrant ? existingGrant.previous_plan : target.plan;

    const { error: upsertError } = await supabaseAdmin
      .from('temporary_access_grants')
      .upsert(
        { user_id: target.id, granted_plan: plan, previous_plan: previousPlan, expires_at: expiresAt, granted_by: user.id },
        { onConflict: 'user_id' },
      );
    if (upsertError) return { statusCode: 500, headers, body: JSON.stringify({ error: upsertError.message }) };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ plan })
      .eq('id', target.id)
      .select('id, email, plan, credits, analyses_this_month, analyses_reset_at, is_admin, subscription_status')
      .single();
    if (updateError) return { statusCode: 500, headers, body: JSON.stringify({ error: updateError.message }) };

    console.log(`admin-grant-temp-access: ${user.id} granted ${target.email} plan=${plan} for ${days}d (reverts to ${previousPlan})`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, user: updated, grant: { granted_plan: plan, previous_plan: previousPlan, expires_at: expiresAt } }),
    };
  } catch (err) {
    console.error('admin-grant-temp-access handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
