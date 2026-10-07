import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Real subscription management — previously "Cancel"/"Pause"/"Resume" in the
// UI only ever flipped a local flag (Settings.tsx wrote to localStorage,
// Pricing.tsx's downgrade dialog just redirected to /dashboard) with no
// effect on the actual Stripe subscription, so customers who "canceled" kept
// being billed. This endpoint is the only place that mutates the Stripe
// subscription and is the source of truth `profiles` gets synced from
// (via stripe-webhook.js reacting to the resulting Stripe events).

const ACTIONS = new Set(['cancel', 'resume', 'pause', 'unpause']);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (event.body && event.body.length > 2 * 1024) {
    return { statusCode: 413, body: JSON.stringify({ error: 'Payload too large' }) };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let action;
  try {
    ({ action } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!ACTIONS.has(action)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile?.stripe_subscription_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No active subscription found for this account.' }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const subscriptionId = profile.stripe_subscription_id;

  try {
    // Verify the subscription actually belongs to this user before mutating
    // it — stripe_subscription_id is server-set (webhook), but this check
    // stays cheap insurance against ever trusting a stale/reassigned id.
    const existing = await stripe.subscriptions.retrieve(subscriptionId);
    if (existing.metadata?.userId && existing.metadata.userId !== user.id) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Subscription does not belong to this account.' }) };
    }

    let updated;
    switch (action) {
      case 'cancel':
        // Graceful cancellation: access continues until the current period
        // ends (matches the pricing page FAQ: "cancel anytime, keep access
        // to the end of the billing period"). Never cancel immediately —
        // that would end access the customer already paid for.
        updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        break;
      case 'resume':
        updated = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
          pause_collection: '',
        });
        break;
      case 'pause':
        updated = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: { behavior: 'void' },
        });
        break;
      case 'unpause':
        updated = await stripe.subscriptions.update(subscriptionId, { pause_collection: '' });
        break;
    }

    // Best-effort local sync — stripe-webhook.js is the authoritative sync
    // path (customer.subscription.updated fires for this same change), this
    // just avoids a UI flash back to the old state before the webhook lands.
    await supabase
      .from('profiles')
      .update({
        cancel_at_period_end: updated.cancel_at_period_end,
        subscription_status: updated.pause_collection
          ? 'paused'
          : updated.cancel_at_period_end
            ? 'canceled'
            : updated.status,
      })
      .eq('id', user.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        status: updated.status,
        cancel_at_period_end: updated.cancel_at_period_end,
        paused: Boolean(updated.pause_collection),
        current_period_end: updated.current_period_end
          ? new Date(updated.current_period_end * 1000).toISOString()
          : null,
      }),
    };
  } catch (error) {
    console.error('manage-subscription error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not update your subscription. Please try again.' }),
    };
  }
};
