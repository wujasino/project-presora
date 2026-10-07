import { createClient } from '@supabase/supabase-js';
import { moderate } from './_lib/moderation.js';
import { SALES_SYSTEM_PROMPT } from './_lib/salesKnowledge.js';
import { logConversation } from './_lib/logConversation.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Logging is optional here (this endpoint has no other use for Supabase) —
// never let a missing/misconfigured service key break the actual chat.
const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { params: { eventsPerSecond: 0 } },
    });
  } catch {
    return null;
  }
};

// Public landing-page sales/FAQ chat. No auth, no per-user data — static
// knowledge only (see _lib/salesKnowledge.js). This is the "sales mode"
// half of the support bot; the result-interpreter mode (per-user scan data,
// requires auth) is a separate, later endpoint.

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const MAX_REQUESTS_PER_DAY = 60;
const EXTERNAL_TIMEOUT_MS = 20_000;

// In-memory store: reachable by anyone on the public landing page (no auth),
// so we rate-limit by IP — secondary defense only, resets on cold start.
const requestStore = new Map();

// Only trust Netlify's own connection-IP header — x-forwarded-for can be
// pre-populated by the client itself and isn't a reliable rate-limit key.
const getIp = (event) => event.headers['x-nf-client-connection-ip'] || 'unknown';

const shouldRateLimit = (key) => {
  const current = Date.now();
  const entry = requestStore.get(key) || {
    count: 0, windowStart: current, dailyCount: 0, dailyReset: current + 24 * 60 * 60 * 1000,
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

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const clampStr = (s, n = 2000) => String(s ?? '').trim().slice(0, n);

const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const callAnthropic = (messages) => fetchWithTimeout('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-5',
    max_tokens: 512,
    system: SALES_SYSTEM_PROMPT,
    messages,
  }),
});

export const handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const CORS = { ...corsHeaders(origin), 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }
  if (event.body && event.body.length > 8 * 1024) {
    return { statusCode: 413, headers: CORS, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  const ip = getIp(event);
  if (shouldRateLimit(`ip:${ip}`)) {
    return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }) };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply: "The chat assistant isn't fully connected yet — feel free to browse Pricing or sign up, and reach out at contact.presora@gmail.com with questions in the meantime." }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    const messages = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
      .slice(-12)
      .map(m => ({ role: m.role, content: clampStr(m.text, 2000) }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'A message is required.' }) };
    }

    const lastUserMessage = messages[messages.length - 1].content;
    const admin = createAdminClient();
    const modResult = await moderate(lastUserMessage).catch(() => ({ flagged: false }));
    if (modResult.flagged) {
      const reply = "I can't help with that here — happy to answer questions about Presora, AI visibility, or pricing though.";
      await logConversation(admin, { mode: 'sales', userMessage: lastUserMessage, assistantReply: reply, flagged: true });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ reply }) };
    }

    const res = await callAnthropic(messages);
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn('Anthropic error', res.status, errBody.slice(0, 200));
      throw new Error('Model request failed');
    }
    const data = await res.json();
    const content = Array.isArray(data.content) ? data.content : [];
    const reply = content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    const finalReply = reply || "Sorry, I didn't catch that — could you rephrase?";

    await logConversation(admin, { mode: 'sales', userMessage: lastUserMessage, assistantReply: finalReply });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply: finalReply }),
    };
  } catch (error) {
    console.error('chat-sales handler error:', error.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'The assistant hit a snag. Please try again.' }),
    };
  }
};
