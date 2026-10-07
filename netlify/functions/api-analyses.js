/**
 * GET /api/v1/analyses          -> list (most recent 50)
 * GET /api/v1/analyses?id=UUID  -> single analysis
 * Header: Authorization: Bearer bb_live_...
 *
 * Read-only counterpart to api-analyze.js — see ApiDocs.tsx's
 * "GET /analyses" and "GET /analyses/{id}" sections.
 */
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { verifyApiKey, checkRateLimitAndLog } from './_lib/apiKeyAuth.js';

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const SELECT_COLUMNS = 'id, brand_name, trust_score, authority, sentiment, recency, mentions, accuracy, sources, created_at';

// Matches api-analyze.js's response shape (camelCase, flat dimensions)
// instead of leaking raw snake_case DB column names — the two endpoints
// describe the same resource and should look like it.
const toApiShape = (row) => ({
  id: row.id,
  brandName: row.brand_name,
  createdAt: row.created_at,
  trustScore: row.trust_score,
  authority: row.authority,
  sentiment: row.sentiment,
  recency: row.recency,
  mentions: row.mentions,
  accuracy: row.accuracy,
  sources: row.sources,
});

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.error('api-analyses: Supabase client init failed:', err.message);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  const auth = await verifyApiKey(supabaseAdmin, event.headers.authorization || event.headers.Authorization);
  if (!auth) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid or revoked API key' }) };
  }

  const allowed = await checkRateLimitAndLog(supabaseAdmin, auth.keyId, auth.userId, { windowMs: 60_000, max: 60, kind: 'analyses' });
  if (!allowed) {
    return { statusCode: 429, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Rate limit exceeded' }) };
  }

  const id = event.queryStringParameters?.id;

  try {
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('analyses')
        .select(SELECT_COLUMNS)
        .eq('id', id)
        .eq('user_id', auth.userId) // a key only ever sees its own account's analyses
        .maybeSingle();
      if (error) return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
      if (!data) return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Not found' }) };
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toApiShape(data)) };
    }

    const { data, error } = await supabaseAdmin
      .from('analyses')
      .select(SELECT_COLUMNS)
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analyses: (data || []).map(toApiShape) }) };
  } catch (err) {
    console.error('api-analyses handler error:', err.message);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
