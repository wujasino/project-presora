import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

// Netlify Scheduled Function (see the `[functions."expire-temp-access"]`
// schedule in netlify.toml) — reverts any temporary admin-granted plan
// (admin-grant-temp-access.js) once its expires_at passes, and removes the
// grant row. Runs hourly: an access window is always granted in whole
// days, so an hour's slack past expiry is never user-visible.
//
// Only reverts profiles.plan if it still equals the plan that was granted
// — if an admin or a real Stripe checkout already changed it in the
// meantime, this must not clobber that; the expired grant row is still
// removed either way, since its job is done regardless.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role configuration');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { params: { eventsPerSecond: 0 } },
  });
};

// Cap per invocation so one run can't time out chasing a large backlog —
// anything left over is still expired (past expires_at) and gets picked up
// on the next hourly run.
const MAX_GRANTS_PER_RUN = 100;

export const handler = async () => {
  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (err) {
    console.error('expire-temp-access: client init failed:', err.message);
    return { statusCode: 500, body: 'Server misconfiguration' };
  }

  const { data: expired, error: fetchError } = await supabaseAdmin
    .from('temporary_access_grants')
    .select('id, user_id, granted_plan, previous_plan')
    .lte('expires_at', new Date().toISOString())
    .limit(MAX_GRANTS_PER_RUN);

  if (fetchError) {
    console.error('expire-temp-access: fetch failed:', fetchError.message);
    return { statusCode: 500, body: fetchError.message };
  }
  if (!expired?.length) {
    return { statusCode: 200, body: 'No expired grants' };
  }

  let reverted = 0;
  let skipped = 0;
  for (const grant of expired) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', grant.user_id)
      .single();

    if (profile?.plan === grant.granted_plan) {
      const { error: revertError } = await supabaseAdmin
        .from('profiles')
        .update({ plan: grant.previous_plan })
        .eq('id', grant.user_id);
      if (revertError) {
        console.error(`expire-temp-access: failed to revert user ${grant.user_id}:`, revertError.message);
        continue; // leave the grant row so the next run retries the revert
      }
      reverted += 1;
    } else {
      // Plan already changed by something else — just clean up the row.
      skipped += 1;
    }

    await supabaseAdmin.from('temporary_access_grants').delete().eq('id', grant.id);
  }

  console.log(`expire-temp-access: reverted ${reverted}, skipped ${skipped} (plan already changed)`);
  return { statusCode: 200, body: `Reverted ${reverted}, skipped ${skipped}` };
};
