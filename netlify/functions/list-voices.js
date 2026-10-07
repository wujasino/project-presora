import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { getVoices } from './_lib/elevenlabsVoices.js';

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

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
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

  // Requires a signed-in account — this proxies a paid ElevenLabs account's
  // voice catalog, no need to expose it to anonymous callers.
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.toString().replace(/^Bearer\s+/i, '');
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const admin = createAdminClient();
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  } catch (err) {
    console.error('Auth error in list-voices function:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Authentication failed. Please try again.' }) };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { statusCode: 503, body: JSON.stringify({ error: 'TTS not configured' }) };

  try {
    const voices = await getVoices(apiKey);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, max-age=300' },
      body: JSON.stringify({ voices }),
    };
  } catch (err) {
    console.error('list-voices error:', err.message);
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not load voices' }) };
  }
};
