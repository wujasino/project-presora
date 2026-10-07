import { moderate } from "./_lib/moderation.js";

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

// In-memory store: this endpoint is reachable by guests (pre-auth), so we
// rate-limit by IP rather than user id — secondary defense only.
const requestStore = new Map();

// Only trust Netlify's own connection-IP header — x-forwarded-for can be
// pre-populated by the client itself and isn't a reliable rate-limit key.
const getIp = (event) => event.headers['x-nf-client-connection-ip'] || 'unknown';

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

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
});

export async function handler(event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const CORS = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }
  if (event.body && event.body.length > 4 * 1024) {
    return { statusCode: 413, headers: CORS, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  const ip = getIp(event);
  if (shouldRateLimit(ip)) {
    return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: 'Too many requests. Please try again shortly.' }) };
  }

  let text;
  try {
    ({ text } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!text || typeof text !== 'string') {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing text' }) };
  }

  const result = await moderate(text.slice(0, 2000));
  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
}
