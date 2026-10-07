/**
 * GET/POST/DELETE /.netlify/functions/dev-keys
 *
 * Manages a signed-in user's own API keys (Developers.tsx > API Keys tab).
 * Session-authenticated (the caller's own Supabase JWT) — this is account
 * management, not the public API itself (see api-analyze.js/api-analyses.js,
 * which are authenticated with the keys this endpoint issues).
 *
 * The plaintext secret is returned exactly once, at creation — only its
 * SHA-256 hash is ever stored (api_keys.key_hash), same pattern as
 * recovery_codes.code_hash.
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import ws from 'ws';

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('dev-keys: Supabase client init failed:', err.message);
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

const MAX_ACTIVE_KEYS = 10;
const genSecret = () => `bb_live_${crypto.randomBytes(24).toString('hex')}`;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

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
      const [{ data: keys, error: keysError }, { data: usage, error: usageError }] = await Promise.all([
        supabaseAdmin
          .from('api_keys')
          .select('id, name, prefix, active, created_at, last_used_at, revoked_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabaseAdmin
          .from('api_key_usage')
          .select('id, api_key_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (keysError) return { statusCode: 500, headers, body: JSON.stringify({ error: keysError.message }) };
      if (usageError) return { statusCode: 500, headers, body: JSON.stringify({ error: usageError.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ keys: keys || [], usage: usage || [] }) };
    }

    if (event.httpMethod === 'POST') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

      const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 80) : '';
      if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name is required' }) };

      const { count } = await supabaseAdmin
        .from('api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('revoked_at', null);
      if ((count ?? 0) >= MAX_ACTIVE_KEYS) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Limit of ${MAX_ACTIVE_KEYS} active keys reached. Revoke one first.` }) };
      }

      const secret = genSecret();
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .insert({ user_id: user.id, name, prefix: secret.slice(0, 16), key_hash: sha256(secret) })
        .select('id, name, prefix, created_at')
        .single();
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };

      // The only time the plaintext secret ever leaves the server.
      return { statusCode: 200, headers, body: JSON.stringify({ ...data, secret }) };
    }

    if (event.httpMethod === 'PATCH') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
      const id = typeof payload.id === 'string' ? payload.id : '';
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id is required' }) };

      const patch = {};
      if (payload.name !== undefined) {
        const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 80) : '';
        if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name cannot be empty' }) };
        patch.name = name;
      }
      if (payload.active !== undefined) {
        if (typeof payload.active !== 'boolean') return { statusCode: 400, headers, body: JSON.stringify({ error: 'active must be a boolean' }) };
        patch.active = payload.active;
      }
      if (Object.keys(patch).length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nothing to update' }) };
      }

      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .update(patch)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, name, prefix, active, created_at, last_used_at, revoked_at')
        .maybeSingle();
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      if (!data) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Key not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'DELETE') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
      const id = typeof payload.id === 'string' ? payload.id : '';
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id is required' }) };

      const { error } = await supabaseAdmin
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('dev-keys handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
