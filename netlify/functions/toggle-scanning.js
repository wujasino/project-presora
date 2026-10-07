/**
 * GET  /.netlify/functions/toggle-scanning  -> { enabled: boolean, updatedAt, updatedBy }
 * POST /.netlify/functions/toggle-scanning  Body: { enabled: boolean }
 *
 * Admin-only kill-switch for brand scanning (app_settings.scanning_enabled,
 * see the 20240133 migration). Turning it off makes analyze.js / api-analyze.js
 * answer 503 with an honest "temporarily paused" message instead of letting
 * every scan fail deep inside the model calls, and makes the scheduled
 * re-scanner skip its runs — useful when OpenRouter can't serve requests
 * (no credits, revoked key, provider outage).
 *
 * app_settings has RLS on with no policies, so it's unreachable with an
 * anon/authenticated JWT; this service-role write is gated on the caller's
 * profiles.is_admin, mirroring set-custom-plan-price.js.
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('toggle-scanning: Supabase client init failed:', err.message);
}

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    if (!supabaseAdmin) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
    }

    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!callerProfile?.is_admin) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin access required' }) };
    }

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .select('key, value, updated_at, updated_by')
        .in('key', ['scanning_enabled', 'provider_failures', 'scanning_disabled_reason', 'auto_disable_enabled', 'openrouter_enabled']);
      if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }
      const rows = Object.fromEntries((data || []).map((r) => [r.key, r]));
      const flag = rows.scanning_enabled;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          // Missing row means "never configured" — scanning is on by default,
          // matching getScanSettings()'s fail-open behaviour.
          enabled: flag ? flag.value !== false && flag.value !== 'false' : true,
          updatedAt: flag?.updated_at ?? null,
          updatedBy: flag?.updated_by ?? null,
          // So the admin UI can say "you paused this" vs "the watchdog did,
          // after N failures, and here's the provider's last error".
          reason: rows.scanning_disabled_reason?.value ?? null,
          failureCount: Number(rows.provider_failures?.value?.count) || 0,
          // The provider's own words for the most recent failed scan. Was
          // only surfaced once the watchdog had already paused scanning, so
          // while a streak was building the admin panel showed a count and
          // nothing about the cause.
          lastError: rows.provider_failures?.value?.lastError ?? null,
          lastFailureAt: rows.provider_failures?.value?.lastFailureAt ?? null,
          // Defaults to false — see AUTO_DISABLE_DEFAULT in _lib/appSettings.js.
          autoDisable: rows.auto_disable_enabled?.value === true,
          // Missing row -> on, same fail-open default as everything else here.
          openrouterEnabled: rows.openrouter_enabled ? rows.openrouter_enabled.value !== false : true,
        }),
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    // Checked before `enabled` is required, so either preference can be
    // changed on its own without also flipping the main switch.
    if (typeof payload.autoDisable === 'boolean' && payload.enabled === undefined) {
      const { error } = await supabaseAdmin.from('app_settings').upsert(
        { key: 'auto_disable_enabled', value: payload.autoDisable, updated_at: new Date().toISOString(), updated_by: user.id },
        { onConflict: 'key' },
      );
      if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, autoDisable: payload.autoDisable }) };
    }

    // Skip a known-broken OpenRouter balance and go straight to the direct
    // Anthropic fallback — faster than paying OpenRouter's timeout on every
    // scan, and it stops six 402s per scan from burying the real signal in
    // provider_failures.lastError. Independent of the main scanning switch:
    // this can be flipped back the moment OpenRouter credits are topped up,
    // with no redeploy.
    if (typeof payload.openrouterEnabled === 'boolean' && payload.enabled === undefined) {
      const { error } = await supabaseAdmin.from('app_settings').upsert(
        { key: 'openrouter_enabled', value: payload.openrouterEnabled, updated_at: new Date().toISOString(), updated_by: user.id },
        { onConflict: 'key' },
      );
      if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, openrouterEnabled: payload.openrouterEnabled }) };
    }

    if (typeof payload.enabled !== 'boolean') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '"enabled" must be true or false' }) };
    }

    const { error: upsertError } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        key: 'scanning_enabled',
        value: payload.enabled,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'key' });

    if (upsertError) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: upsertError.message }) };
    }

    // Turning it back on clears the watchdog's streak, otherwise the very
    // next failure would immediately re-trip the threshold. Also records who
    // last flipped it, so the UI can distinguish manual from automatic.
    //
    // These were one array upsert that also wrote `value: null` for the
    // reason when enabling. app_settings.value is `jsonb NOT NULL`, so
    // PostgREST rejected the whole batch with 400 (23502) — and the result
    // was never checked, so it failed silently. The visible effect: clicking
    // "Enable scanning" left provider_failures.count at 3, so the very next
    // failed scan re-tripped the threshold and switched scanning straight
    // back off. Exactly the flapping the watchdog exists to avoid.
    //
    // Split in two, and "no reason" is now the absence of the row rather
    // than a null in a NOT NULL column — both readers (getScanSettings and
    // this function's own GET) already treat a missing key as null.
    const { error: counterError } = await supabaseAdmin
      .from('app_settings')
      .upsert(
        { key: 'provider_failures', value: { count: 0 }, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      );

    const { error: reasonError } = payload.enabled
      ? await supabaseAdmin.from('app_settings').delete().eq('key', 'scanning_disabled_reason')
      : await supabaseAdmin.from('app_settings').upsert(
          {
            key: 'scanning_disabled_reason',
            value: { source: 'manual', at: new Date().toISOString(), by: user.id },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' },
        );

    // Reported, not swallowed: the switch itself already flipped, but an
    // admin needs to know the streak wasn't cleared — otherwise scanning
    // looks like it turns itself off again for no reason.
    if (counterError || reasonError) {
      console.error('toggle-scanning: bookkeeping failed:', counterError?.message, reasonError?.message);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          enabled: payload.enabled,
          warning: `Scanning was ${payload.enabled ? 'enabled' : 'disabled'}, but the failure counter could not be reset: ${counterError?.message || reasonError?.message}`,
        }),
      };
    }

    console.log(`toggle-scanning: scanning ${payload.enabled ? 'ENABLED' : 'DISABLED'} by ${user.id}`);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, enabled: payload.enabled }) };
  } catch (err) {
    console.error('toggle-scanning handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
