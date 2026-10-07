import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { isValidVoiceId } from './_lib/elevenlabsVoices.js';

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

// voiceId used to be interpolated straight into the ElevenLabs URL path with
// no validation — an authenticated caller could pass anything (e.g.
// "abc/../user") and pivot the site's paid ElevenLabs API key to a different
// endpoint than intended. isValidVoiceId() checks both the id's shape and
// that it's a real, current voice on the account (see _lib/elevenlabsVoices.js)
// — this lets users pick from the full ElevenLabs catalog (see list-voices.js)
// instead of a hardcoded handful, without reopening that hole.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_REQUESTS_PER_DAY = 100;

// In-memory store: secondary defense only — primary rate limiting is per user ID (verified via JWT)
const requestStore = new Map();
const now = () => Date.now();

const shouldRateLimit = (key) => {
  const current = now();
  const entry = requestStore.get(key) || {
    count: 0, windowStart: current, dailyCount: 0,
    dailyReset: current + 24 * 60 * 60 * 1000,
  };
  if (current > entry.dailyReset) {
    entry.dailyCount = 0; entry.dailyReset = current + 24 * 60 * 60 * 1000;
    entry.windowStart = current; entry.count = 0;
  }
  if (current - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = current; entry.count = 0;
  }
  entry.count += 1; entry.dailyCount += 1;
  requestStore.set(key, entry);
  return entry.count > MAX_REQUESTS_PER_WINDOW || entry.dailyCount > MAX_REQUESTS_PER_DAY;
};

const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role configuration');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { params: { eventsPerSecond: 0 } },
  });
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  if (event.body && event.body.length > 8 * 1024) {
    return { statusCode: 413, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  // This endpoint calls a metered, paid third-party API (ElevenLabs) —
  // require a verified account so it can't be used as a free, unlimited proxy.
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.toString().replace(/^Bearer\s+/i, '');
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let admin;
  try {
    admin = createAdminClient();
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    if (shouldRateLimit(`user:${user.id}`)) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }) };
    }
  } catch (err) {
    console.error('Auth error in tts function:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Authentication failed. Please try again.' }) };
  }

  let text, voiceId;
  try {
    ({ text, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!text || typeof text !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'text required' }) };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { statusCode: 503, body: JSON.stringify({ error: 'TTS not configured' }) };

  if (!(await isValidVoiceId(apiKey, voiceId))) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid voiceId' }) };
  }

  let res;
  try {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (e) {
    console.error('TTS fetch error:', e.message);
    return { statusCode: 502, body: JSON.stringify({ error: 'TTS request failed' }) };
  }

  if (!res.ok) {
    console.error('ElevenLabs error:', res.status, await res.text().catch(() => ''));
    return { statusCode: 502, body: JSON.stringify({ error: 'TTS provider error' }) };
  }

  const buffer = await res.arrayBuffer();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(buffer.byteLength) },
    body: Buffer.from(buffer).toString('base64'),
    isBase64Encoded: true,
  };
};
