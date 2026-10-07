/**
 * GET /.netlify/functions/health
 *
 * Public, unauthenticated live health check backing the /status page.
 * Reports current reachability only — there is no persisted history or
 * uptime percentage here, since nothing collects that yet. Never returns
 * secret values, only booleans/timings.
 */
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
});

const checkSupabase = async () => {
  if (!SUPABASE_URL) return { status: 'down', latencyMs: null };
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // GoTrue's own public health endpoint — no auth required, no data touched.
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return { status: res.ok ? 'operational' : 'degraded', latencyMs: Date.now() - start };
  } catch {
    return { status: 'down', latencyMs: Date.now() - start };
  }
};

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const database = await checkSupabase();
    const checks = {
      app: { status: 'operational' },
      database,
    };
    const overall = Object.values(checks).some(c => c.status === 'down')
      ? 'down'
      : Object.values(checks).some(c => c.status === 'degraded')
        ? 'degraded'
        : 'operational';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: overall, timestamp: new Date().toISOString(), checks }),
    };
  } catch (err) {
    console.error('health check error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'degraded', timestamp: new Date().toISOString(), checks: {}, error: 'Health check itself failed' }),
    };
  }
};
