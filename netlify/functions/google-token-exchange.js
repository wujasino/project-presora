// Only the app's own callback route may be forwarded to Google — without
// this, the endpoint would proxy a token exchange for any redirect_uri a
// caller supplies (Google still enforces its own registered-URI check, but
// this closes the gap if that registration is ever loosely configured).
//
// VITE_SITE_URL.replace(/\/$/, '') strips a trailing slash if the env var
// has one — a bare string mismatch here (VITE_SITE_URL set to
// "https://www.presora.app/" vs the client always sending an origin with
// no trailing slash) would silently 400 every Google sign-in with this
// exact "Invalid redirect_uri" error, and looks identical from the outside
// to an actually-wrong redirect_uri.
const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.presora.app').replace(/\/$/, '');
const ALLOWED_REDIRECT_URIS = new Set([
  `${SITE_URL}/auth/google/callback`,
  'https://www.presora.app/auth/google/callback',
  'https://presora.app/auth/google/callback',
  'http://localhost:5173/auth/google/callback',
  'http://localhost:8888/auth/google/callback',
]);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { code, redirect_uri, code_verifier } = JSON.parse(event.body ?? '{}');

    if (!code || !redirect_uri) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing code or redirect_uri' }) };
    }

    if (!ALLOWED_REDIRECT_URIS.has(redirect_uri)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid redirect_uri' }) };
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Google credentials not configured' }) };
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (code_verifier) body.set('code_verifier', code_verifier);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Google token exchange error:', data);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.error_description || data.error || 'Token exchange failed' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: data.id_token }),
    };
  } catch (err) {
    console.error('google-token-exchange error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
