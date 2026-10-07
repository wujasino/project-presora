/**
 * POST /.netlify/functions/set-custom-plan-price
 * Body: { email: string, monthlyPrice: number|null, yearlyPrice: number|null }
 *
 * Admin-only: sets profiles.custom_plan_price_monthly/_yearly for the
 * account matching `email` — a negotiated quote (e.g. Agency plan, already
 * advertised on Pricing as "from $220"), informational only. Does NOT touch
 * Stripe — the actual amount charged is still driven entirely by the
 * subscription's price ID (create-checkout.js / manage-subscription.js).
 *
 * Writes go through the service-role client only after verifying the
 * caller's profiles.is_admin — profiles' UPDATE RLS policy only checks
 * auth.uid() = id, and protect_plan_changes() (20240129 migration) rejects
 * any non-service-role write to these columns regardless, so this is
 * defense in depth, not the only guard.
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
  console.error('set-custom-plan-price: Supabase client init failed:', err.message);
}

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
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

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-zA-Z]{2,}$/;

// Accepts null (clear the override) or a positive number up to 999999.99 —
// matches the NUMERIC(10,2) column, and rules out negative-price nonsense.
const isValidPrice = (v) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 999999.99);

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') {
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

    const monthlyPrice = payload.monthlyPrice === undefined ? null : payload.monthlyPrice;
    const yearlyPrice = payload.yearlyPrice === undefined ? null : payload.yearlyPrice;
    if (!isValidPrice(monthlyPrice) || !isValidPrice(yearlyPrice)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prices must be null or a number between 0 and 999999.99' }) };
    }

    const { data: target, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, plan')
      .eq('email', email)
      .maybeSingle();
    if (findError) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: findError.message }) };
    }
    if (!target) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'No account found for that email' }) };
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ custom_plan_price_monthly: monthlyPrice, custom_plan_price_yearly: yearlyPrice })
      .eq('id', target.id);
    if (updateError) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: updateError.message }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, email: target.email, plan: target.plan, monthlyPrice, yearlyPrice }),
    };
  } catch (err) {
    console.error('set-custom-plan-price handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
