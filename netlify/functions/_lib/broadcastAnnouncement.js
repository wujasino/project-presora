/**
 * Shared by send-announcement.js (web admin form) and discord-announce.js
 * (Discord slash command) — both authenticate/authorize the caller in their
 * own way, then hand off to this one function so the actual validation,
 * targeting and insert logic only exists once.
 */
const MAX_TITLE_LEN = 200;
const MAX_BODY_LEN = 2000;

// Display names shown in the admin form (and Pricing.tsx) → raw values
// stored in profiles.plan. Growth's paid-plan display name is "Business"
// (see PLAN_LABELS in useAccountInfo.ts) and Agency covers both the current
// 'agency' and legacy 'enterprise' rows for that same tier.
const PLAN_RAW_VALUES = {
  Free: ['free'],
  Starter: ['starter'],
  Solo: ['solo'],
  Business: ['growth'],
  Agency: ['enterprise', 'agency'],
};

/**
 * @param {object} supabaseAdmin - service-role Supabase client
 * @param {{ title: string, body: string, planScope?: string[], expiresAt?: string|null }} input
 * @returns {Promise<{ ok: true, sent: number } | { ok: false, status: number, error: string }>}
 */
async function broadcastAnnouncement(supabaseAdmin, { title, body, planScope, expiresAt }) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanBody = typeof body === 'string' ? body.trim() : '';
  if (!cleanTitle || cleanTitle.length > MAX_TITLE_LEN) {
    return { ok: false, status: 400, error: `"title" is required (max ${MAX_TITLE_LEN} chars)` };
  }
  if (!cleanBody || cleanBody.length > MAX_BODY_LEN) {
    return { ok: false, status: 400, error: `"body" is required (max ${MAX_BODY_LEN} chars)` };
  }

  const scope = Array.isArray(planScope) ? planScope.filter((p) => typeof p === 'string') : [];
  let rawPlanValues = null; // null = no filter, send to every account
  if (scope.length > 0) {
    const invalid = scope.filter((p) => !PLAN_RAW_VALUES[p]);
    if (invalid.length > 0) {
      return { ok: false, status: 400, error: `Unknown plan(s): ${invalid.join(', ')}` };
    }
    rawPlanValues = scope.flatMap((p) => PLAN_RAW_VALUES[p]);
  }

  let expiresIso = null;
  if (expiresAt) {
    const parsed = new Date(expiresAt);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return { ok: false, status: 400, error: '"expiresAt" must be a valid future date' };
    }
    expiresIso = parsed.toISOString();
  }

  let targetQuery = supabaseAdmin.from('profiles').select('id');
  if (rawPlanValues) targetQuery = targetQuery.in('plan', rawPlanValues);
  const { data: targets, error: targetsError } = await targetQuery;
  if (targetsError) return { ok: false, status: 500, error: targetsError.message };

  if (!targets || targets.length === 0) {
    return { ok: true, sent: 0 };
  }

  const rows = targets.map((t) => ({
    user_id: t.id,
    type: 'announcement',
    title: cleanTitle,
    body: cleanBody,
    data: scope.length > 0 ? { planScope: scope } : null,
    expires_at: expiresIso,
  }));

  const { error: insertError } = await supabaseAdmin.from('notifications').insert(rows);
  if (insertError) return { ok: false, status: 500, error: insertError.message };

  return { ok: true, sent: rows.length };
}

module.exports = { broadcastAnnouncement, PLAN_RAW_VALUES, MAX_TITLE_LEN, MAX_BODY_LEN };
