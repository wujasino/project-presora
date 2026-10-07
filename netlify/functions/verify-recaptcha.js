/**
 * POST /.netlify/functions/verify-recaptcha
 * Body: { token: string, action: string }
 *
 * Standalone check used by registerUser() (src/lib/auth.ts) before it calls
 * supabase.auth.signUp() directly from the browser — signUp() has no
 * backend function of its own to hook a reCAPTCHA check into, so this
 * gates registration as a separate pre-flight call instead.
 */
const RECAPTCHA_MIN_SCORE = 0.5;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (event.body && event.body.length > 2048) {
    return { statusCode: 413, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // Fails open — no secret configured means reCAPTCHA isn't set up yet, and
  // that must never block real registrations.
  if (!secret) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }

  let token, action;
  try {
    ({ token, action } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!token) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false }) };
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    const ok =
      data.success === true &&
      (data.score === undefined || data.score >= RECAPTCHA_MIN_SCORE) &&
      (!action || !data.action || data.action === action);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok }) };
  } catch (err) {
    console.error('reCAPTCHA verify error:', err.message);
    // Google being unreachable must never block real registrations.
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }
};
