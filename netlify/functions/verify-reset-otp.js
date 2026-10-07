import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Node < 22 has no native WebSocket — supabase-js inits Realtime eagerly.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ALLOWED_ORIGINS = ['https://presora.app', 'https://www.presora.app'];

function corsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://presora.app';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function json(statusCode, body, event) {
  return { statusCode, headers: corsHeaders(event), body: JSON.stringify(body) };
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// A 6-digit code has 1,000,000 combinations — without a cap on verification
// attempts it can be brute-forced well within its 10-minute validity window.
const MAX_VERIFY_ATTEMPTS = 8;

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(event) };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, event);

  if ((event.body?.length ?? 0) > 1024) return json(400, { error: 'Payload too large' }, event);

  let email, code, newPassword;
  try {
    ({ email, code, newPassword } = JSON.parse(event.body ?? '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON' }, event);
  }

  if (!email || !code || !/^\d{6}$/.test(code)) {
    return json(400, { error: 'Nieprawidłowe dane' }, event);
  }

  // Two-phase flow:
  //  - without newPassword → just verify the code is valid (does NOT consume it)
  //  - with newPassword     → verify, set the new password, consume the code
  const settingPassword = newPassword !== undefined && newPassword !== null;
  if (settingPassword && (typeof newPassword !== 'string' || newPassword.length < 8)) {
    return json(400, { error: 'Hasło musi mieć co najmniej 8 znaków.' }, event);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const codeHash = await sha256(code);

  // Register this attempt before checking the code — caps brute-force
  // guessing regardless of which specific code was tried.
  const { data: totalAttempts, error: attemptError } = await supabase
    .rpc('register_otp_attempt', { p_email: normalizedEmail });

  if (attemptError) {
    console.error('OTP attempt tracking error:', attemptError.message);
    return json(500, { error: 'Błąd serwera.' }, event);
  }

  if ((totalAttempts ?? 0) > MAX_VERIFY_ATTEMPTS) {
    return json(429, { error: 'Zbyt wiele prób. Wyślij nowy kod.' }, event);
  }

  // Find a valid, unused OTP for this email
  const { data: rows, error: dbError } = await supabase
    .from('password_reset_otps')
    .select('id, expires_at, used_at')
    .eq('email', normalizedEmail)
    .eq('code_hash', codeHash)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (dbError) {
    console.error('DB query error:', dbError.message);
    return json(500, { error: 'Błąd serwera.' }, event);
  }

  if (!rows || rows.length === 0) {
    return json(400, { error: 'Nieprawidłowy lub wygasły kod.' }, event);
  }

  const record = rows[0];

  // Check expiry
  if (new Date(record.expires_at) < new Date()) {
    return json(400, { error: 'Kod wygasł. Wyślij nowy.' }, event);
  }

  // Phase 1: code-only verification — confirm it's valid without consuming it
  if (!settingPassword) {
    return json(200, { ok: true, verified: true }, event);
  }

  // Mark as used (one-time use) before mutating the account
  await supabase
    .from('password_reset_otps')
    .update({ used_at: new Date().toISOString() })
    .eq('id', record.id);

  // Resolve the user id for this email. generateLink returns the user object
  // without sending any email, so it doubles as a reliable lookup.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: normalizedEmail,
  });

  const userId = linkData?.user?.id;
  if (linkError || !userId) {
    console.error('User lookup error:', linkError?.message);
    return json(400, { error: 'Nie znaleziono konta dla tego adresu e-mail.' }, event);
  }

  // Set the new password directly — no redirect, no Supabase recovery link needed
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    console.error('Password update error:', updateError.message);
    return json(500, { error: 'Nie udało się zmienić hasła. Spróbuj ponownie.' }, event);
  }

  return json(200, { ok: true }, event);
};
