/**
 * POST /.netlify/functions/discord-announce
 *
 * Discord Interactions endpoint for the `/announce` slash command — set
 * this function's URL as the app's "Interactions Endpoint URL" in the
 * Discord Developer Portal. Every request (including Discord's own PING
 * health check) is signed with the app's Ed25519 key pair; requests that
 * don't verify are rejected before anything else runs, same as Discord's
 * own reference examples.
 *
 * Registering the /announce command itself is a one-time step, done via
 * scripts/register-discord-command.mjs — this file only *handles* the
 * command once Discord has been told it exists.
 */
const nacl = require('tweetnacl');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const { broadcastAnnouncement } = require('./_lib/broadcastAnnouncement');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// Only this Discord account may run /announce — being a member of the
// server isn't enough, since anyone there could otherwise invoke it once
// the command exists. A Discord user ID is a public snowflake, not a
// secret, so it's fine hardcoded here rather than another env var.
const ALLOWED_DISCORD_USER_ID = '1133688925358141481';

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('discord-announce: Supabase client init failed:', err.message);
}

// Signature verification needs the exact raw bytes Discord signed —
// re-serializing a parsed body would produce different bytes and always
// fail, so this reads event.body as-is (decoding base64 first if Netlify
// delivered it that way) and only JSON.parses it after the signature checks out.
const rawBody = (event) =>
  event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');

const verifySignature = (event) => {
  if (!DISCORD_PUBLIC_KEY) return false;
  const signature = event.headers['x-signature-ed25519'] || event.headers['X-Signature-Ed25519'];
  const timestamp = event.headers['x-signature-timestamp'] || event.headers['X-Signature-Timestamp'];
  if (!signature || !timestamp) return false;
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody(event)),
      Buffer.from(signature, 'hex'),
      Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
    );
  } catch {
    return false;
  }
};

const optionValue = (options, name) => options?.find((o) => o.name === name)?.value;

const ephemeral = (content) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  // flags: 64 = EPHEMERAL — only the person who ran the command sees the
  // reply, not the whole channel.
  body: JSON.stringify({ type: 4, data: { content, flags: 64 } }),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  if (!verifySignature(event)) {
    return { statusCode: 401, body: 'Invalid request signature' };
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody(event));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // PING — Discord sends this once when you save the Interactions Endpoint
  // URL, to confirm the endpoint is live and correctly signed.
  if (interaction.type === 1) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 1 }) };
  }

  if (interaction.type === 2 && interaction.data?.name === 'announce') {
    const invokerId = interaction.member?.user?.id || interaction.user?.id;
    if (invokerId !== ALLOWED_DISCORD_USER_ID) {
      return ephemeral('Not authorized to run this command.');
    }
    if (!supabaseAdmin) {
      return ephemeral('Server misconfiguration — check SUPABASE_URL / SUPABASE_SERVICE_KEY.');
    }

    const options = interaction.data.options;
    const title = optionValue(options, 'title');
    const message = optionValue(options, 'message');
    const plansRaw = optionValue(options, 'plans');
    const hideAfterDays = optionValue(options, 'hide_after_days');

    const planScope = typeof plansRaw === 'string' && plansRaw.trim()
      ? plansRaw.split(',').map((p) => p.trim()).filter(Boolean)
      : [];
    const expiresAt = typeof hideAfterDays === 'number' && hideAfterDays > 0
      ? new Date(Date.now() + hideAfterDays * 86_400_000).toISOString()
      : null;

    const result = await broadcastAnnouncement(supabaseAdmin, { title, body: message, planScope, expiresAt });

    if (!result.ok) {
      return ephemeral(`Failed: ${result.error}`);
    }
    const scopeNote = planScope.length ? ` (plans: ${planScope.join(', ')})` : '';
    const expiryNote = expiresAt ? ` — hides after ${new Date(expiresAt).toLocaleDateString()}` : '';
    return ephemeral(`Sent to ${result.sent} account${result.sent === 1 ? '' : 's'}.${scopeNote}${expiryNote}`);
  }

  return { statusCode: 400, body: 'Unknown interaction' };
};
