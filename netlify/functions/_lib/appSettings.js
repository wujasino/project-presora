// Runtime feature flags in public.app_settings (migrations 20240133/20240134).
// Service-role only — that table has RLS on with no policies.

// Consecutive all-models-failed scans before the watchdog pauses scanning by
// itself. 3 rides out a one-off blip but reacts fast to a dead key/empty
// balance, where every single scan is guaranteed to fail.
export const AUTO_DISABLE_THRESHOLD = 3;

/**
 * Whether the watchdog may flip `scanning_enabled` off by itself.
 *
 * Default **off**, by the owner's explicit call: with a provider outage that
 * lasts (an unpaid balance rather than a blip) auto-pausing turns every scan
 * into "temporarily paused" and the only way back is an admin visiting
 * /admin/settings. They would rather see the real error and keep the switch
 * under human control.
 *
 * Failures are still counted and recorded either way — the diagnostics in
 * /admin/settings do not depend on this.
 */
const AUTO_DISABLE_DEFAULT = false;

const truthy = (v) => v !== false && v !== 'false';

/**
 * Reads the scan-related flags in one round-trip.
 * Fails OPEN (enabled) on any error: these are deliberate off-switches, not
 * security controls, so a DB hiccup must never take scanning down by itself.
 */
export async function getScanSettings(supabaseAdmin) {
  const fallback = { enabled: true, failureCount: 0, disabledReason: null, autoDisable: AUTO_DISABLE_DEFAULT, openrouterEnabled: true };
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('key, value')
      .in('key', ['scanning_enabled', 'provider_failures', 'scanning_disabled_reason', 'auto_disable_enabled', 'openrouter_enabled']);

    if (error) {
      console.warn('getScanSettings: query failed, assuming enabled:', error.message);
      return fallback;
    }

    const byKey = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
    return {
      // A missing row means "never configured" -> on.
      enabled: byKey.scanning_enabled === undefined ? true : truthy(byKey.scanning_enabled),
      failureCount: Number(byKey.provider_failures?.count) || 0,
      disabledReason: byKey.scanning_disabled_reason ?? null,
      autoDisable: byKey.auto_disable_enabled === undefined
        ? AUTO_DISABLE_DEFAULT
        : truthy(byKey.auto_disable_enabled),
      // Lets an admin skip a known-broken OpenRouter balance entirely rather
      // than paying its 20s timeout on every single scan before falling back
      // to Anthropic. Missing row -> on, same as every other flag here.
      openrouterEnabled: byKey.openrouter_enabled === undefined ? true : truthy(byKey.openrouter_enabled),
    };
  } catch (err) {
    console.warn('getScanSettings: unexpected failure, assuming enabled:', err.message);
    return fallback;
  }
}

/** Back-compat helper for callers that only need the gate. */
export async function isScanningEnabled(supabaseAdmin) {
  const { enabled } = await getScanSettings(supabaseAdmin);
  return enabled;
}

const writeSetting = (supabaseAdmin, key, value) =>
  supabaseAdmin.from('app_settings').upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  );

/**
 * Records how a scan went and pauses scanning automatically once
 * AUTO_DISABLE_THRESHOLD consecutive scans have failed at the provider.
 *
 * Deliberately never re-enables on its own: an admin turns it back on once
 * the underlying cause (credits, key, outage) is actually fixed. Auto-
 * recovery would flap — re-enable, fail again, disable — and each cycle
 * costs real users a broken scan.
 *
 * Best-effort: bookkeeping must never turn a working scan into an error, so
 * everything here is swallowed.
 *
 * @param {number} knownFailureCount count already read via getScanSettings,
 *   so the happy path costs no extra read.
 */
export async function recordScanOutcome(supabaseAdmin, { ok, knownFailureCount = 0, error = null, autoDisable = AUTO_DISABLE_DEFAULT }) {
  try {
    if (ok) {
      // Only write when there's something to clear.
      if (knownFailureCount > 0) {
        await writeSetting(supabaseAdmin, 'provider_failures', { count: 0 });
      }
      return { autoDisabled: false };
    }

    const count = knownFailureCount + 1;
    await writeSetting(supabaseAdmin, 'provider_failures', {
      count,
      lastError: String(error || 'unknown').slice(0, 1000),
      lastFailureAt: new Date().toISOString(),
    });

    // Counting always happens; flipping the switch is opt-in.
    if (autoDisable && count >= AUTO_DISABLE_THRESHOLD) {
      await writeSetting(supabaseAdmin, 'scanning_enabled', false);
      await writeSetting(supabaseAdmin, 'scanning_disabled_reason', {
        source: 'auto',
        at: new Date().toISOString(),
        failures: count,
        lastError: String(error || 'unknown').slice(0, 1000),
      });
      console.error(
        `appSettings: scanning AUTO-DISABLED after ${count} consecutive provider failures. Last error: ${error}`,
      );
      return { autoDisabled: true };
    }

    return { autoDisabled: false };
  } catch (err) {
    console.warn('recordScanOutcome: bookkeeping failed (ignored):', err.message);
    return { autoDisabled: false };
  }
}
