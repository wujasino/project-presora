/**
 * Verifies a Presora API key (Authorization: Bearer bb_live_...) for the
 * public API endpoints (api-analyze.js, api-analyses.js). Keys are stored
 * as a SHA-256 hash (api_keys.key_hash, see dev-keys.js) — never in
 * plaintext — so this hashes the presented key and looks up the hash.
 */
import crypto from 'crypto';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * @returns {Promise<{ userId: string, keyId: string } | null>} null if the
 * key is missing, malformed, unknown, revoked, or disabled.
 */
export async function verifyApiKey(supabaseAdmin, authHeader) {
  const raw = String(authHeader || '').replace(/^Bearer\s+/i, '').trim();
  if (!raw || !raw.startsWith('bb_live_')) return null;

  const hash = sha256(raw);
  const { data: key, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, revoked_at, active')
    .eq('key_hash', hash)
    .maybeSingle();
  if (error || !key || key.revoked_at || !key.active) return null;

  return { userId: key.user_id, keyId: key.id };
}

/**
 * Persistent, DB-backed rate limit — Netlify Functions are stateless
 * between invocations, so an in-memory counter (the previous approach)
 * resets constantly and doesn't actually bound anything for a caller
 * hammering the endpoint. Uses api_key_usage (already recorded per request
 * for the Developers.tsx "Activity" panel) as the source of truth: counts
 * this key's requests in the trailing window, and only logs (and allows)
 * the current one if under the limit.
 *
 * Not perfectly atomic under heavy concurrency (a burst of simultaneous
 * requests can all read the same count before any of them insert), but a
 * real, persistent bound is a large improvement over one that doesn't
 * survive between invocations at all.
 *
 * @returns {Promise<boolean>} true if the request is allowed (and has been
 * logged), false if the caller is over the limit for this window.
 */
export async function checkRateLimitAndLog(supabaseAdmin, keyId, userId, { windowMs = 60_000, max = 10, kind = 'analyze' } = {}) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count, error: countError } = await supabaseAdmin
    .from('api_key_usage')
    .select('id', { count: 'exact', head: true })
    .eq('api_key_id', keyId)
    .eq('kind', kind)
    .gte('created_at', since);

  // Fail open on a DB hiccup — an outage here shouldn't take down the API
  // on top of it, and this is defense-in-depth on top of the plan's
  // monthly analysis cap enforced by enforce_analysis_limit() regardless.
  if (countError) {
    console.error('checkRateLimitAndLog: count query failed:', countError.message);
  } else if ((count ?? 0) >= max) {
    return false;
  }

  await supabaseAdmin.from('api_key_usage').insert({ api_key_id: keyId, user_id: userId, kind });
  // Best-effort — a failed timestamp update should never block the request
  // it's timing.
  supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyId)
    .then(() => {}, () => {});

  return true;
}
