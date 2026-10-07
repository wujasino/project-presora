import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Referral program backend: reports a user's own referral link + progress
// (GET-style, action 'status'), and lets them claim a reward once they've
// crossed a 10-referral milestone (action 'claim'). See
// supabase/migrations/20240117_referrals.sql for the schema and how
// referrals get recorded (via handle_new_user(), not this endpoint — a
// referral is only ever counted when the referred account is actually
// created, ruling out claims for signups that never happened).

const MILESTONE_SIZE = 10;
const DISCOUNT_COUPON_ID = 'referral-10-20off'; // Stripe coupon: 20% off, duration 'once'
const FREE_PLAN_CREDIT_REWARD = 50; // matches the $55 "50 extra analyses" pack — sensible free-tier equivalent

// Per-user throttle on the 'claim' action only — 'status' is a cheap read
// and doesn't need one. Without this, one authenticated account could spam
// claim attempts and hammer the Stripe API (subscriptions.retrieve/update)
// on every call, same class of cost-abuse risk the other functions in this
// codebase already guard against. Same in-memory-per-instance pattern used
// elsewhere here (contact.js, newsletter.js) — good enough for a single
// user's own account, not meant to survive a cold start or span instances.
const CLAIM_RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_CLAIMS_PER_WINDOW = 3;
const claimAttempts = new Map();
const shouldThrottleClaim = (userId) => {
  const now = Date.now();
  const entry = claimAttempts.get(userId) || { count: 0, windowStart: now };
  if (now - entry.windowStart > CLAIM_RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = now;
    entry.count = 0;
  }
  entry.count += 1;
  claimAttempts.set(userId, entry);
  return entry.count > MAX_CLAIMS_PER_WINDOW;
};

const createAdminClient = () => createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Coupons are shared across all users (one Stripe object, reused), so
// create it once and treat "already exists" as success rather than
// re-creating per claim.
const ensureCoupon = async (stripe) => {
  try {
    await stripe.coupons.retrieve(DISCOUNT_COUPON_ID);
  } catch {
    await stripe.coupons.create({
      id: DISCOUNT_COUPON_ID,
      percent_off: 20,
      duration: 'once',
      name: 'Referral reward — 20% off',
    });
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (event.body && event.body.length > 1024) {
    return { statusCode: 413, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const supabase = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let action = 'status';
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.action === 'claim') action = 'claim';
  } catch {
    // no body / invalid JSON — default to 'status'
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code, referral_rewards_claimed, plan, stripe_subscription_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load referral status.' }) };
  }

  const { count, error: countError } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', user.id);

  if (countError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load referral status.' }) };
  }

  const totalReferrals = count || 0;
  const claimed = profile.referral_rewards_claimed || 0;
  const milestonesAvailable = Math.floor(totalReferrals / MILESTONE_SIZE) - claimed;
  const siteUrl = process.env.URL || 'https://www.presora.app';

  const baseStatus = {
    referralCode: profile.referral_code,
    referralLink: `${siteUrl}/register?ref=${profile.referral_code}`,
    totalReferrals,
    progressInCurrentMilestone: totalReferrals % MILESTONE_SIZE,
    milestoneSize: MILESTONE_SIZE,
    rewardsClaimed: claimed,
    milestonesAvailable: Math.max(0, milestonesAvailable),
  };

  if (action === 'status') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(baseStatus) };
  }

  // action === 'claim'
  if (shouldThrottleClaim(user.id)) {
    return { statusCode: 429, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Too many attempts. Try again in a minute.' }) };
  }
  if (milestonesAvailable <= 0) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No reward available yet.' }) };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server misconfiguration.' }) };
  }

  try {
    let rewardType;
    if (profile.stripe_subscription_id) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      await ensureCoupon(stripe);
      const existing = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
      if (existing.metadata?.userId && existing.metadata.userId !== user.id) {
        return { statusCode: 403, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Subscription does not belong to this account.' }) };
      }
      await stripe.subscriptions.update(profile.stripe_subscription_id, { coupon: DISCOUNT_COUPON_ID });
      rewardType = 'discount_20_off_next_invoice';
    } else {
      const { error: creditError } = await supabase.rpc('increment_credits', {
        p_user_id: user.id,
        p_amount: FREE_PLAN_CREDIT_REWARD,
      });
      if (creditError) throw creditError;
      rewardType = `credits_${FREE_PLAN_CREDIT_REWARD}`;
    }

    // Only one milestone claimed per call, even if the user somehow has
    // several available at once — keeps each claim a single, auditable action.
    await supabase.from('profiles').update({ referral_rewards_claimed: claimed + 1 }).eq('id', user.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...baseStatus, rewardsClaimed: claimed + 1, milestonesAvailable: milestonesAvailable - 1, rewardType }),
    };
  } catch (error) {
    console.error('referral claim error:', error.message);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Could not process your reward. Please try again.' }) };
  }
};
