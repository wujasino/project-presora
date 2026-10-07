#!/usr/bin/env node
/**
 * Syncs which events Stripe sends to the stripe-webhook.js endpoint with
 * the list this script maintains below — so adding a new event type later
 * is "add it to BASE_EVENTS (or pass it as an extra CLI arg) and re-run
 * this", not a manual click-through in the Stripe Dashboard every time.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_... node scripts/update-stripe-webhook-events.mjs
 *   STRIPE_SECRET_KEY=sk_... node scripts/update-stripe-webhook-events.mjs invoice.paid customer.updated
 *
 * Extra args are additional event names appended to BASE_EVENTS for this
 * run (handy for testing one new event before adding it permanently below).
 *
 * If more than one webhook endpoint's URL contains "stripe-webhook", set
 * STRIPE_WEBHOOK_ENDPOINT_ID=we_... to disambiguate — the script lists all
 * matches with their ids when that happens.
 *
 * Never commit a real STRIPE_SECRET_KEY — pass it as an env var on the
 * command line so it never ends up in shell history files or source control.
 */
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('Set STRIPE_SECRET_KEY in your environment first.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Keep this list in sync with the `switch (stripeEvent.type)` cases actually
// handled in netlify/functions/stripe-webhook.js — anything else Stripe
// sends just falls through that switch's `default: break;` (harmless, but
// it still pays for a webhook_events dedupe-table insert for nothing).
const BASE_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
  'charge.dispute.created',
];

const extraEvents = process.argv.slice(2);
const enabledEvents = [...new Set([...BASE_EVENTS, ...extraEvents])];

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const matches = endpoints.data.filter(e => e.url.includes('stripe-webhook'));

let endpoint;
if (process.env.STRIPE_WEBHOOK_ENDPOINT_ID) {
  endpoint = matches.find(e => e.id === process.env.STRIPE_WEBHOOK_ENDPOINT_ID);
  if (!endpoint) {
    console.error(`No endpoint with id ${process.env.STRIPE_WEBHOOK_ENDPOINT_ID} found among stripe-webhook URLs.`);
    process.exit(1);
  }
} else if (matches.length === 1) {
  endpoint = matches[0];
} else if (matches.length === 0) {
  console.error('No webhook endpoint with a URL containing "stripe-webhook" found on this Stripe account.');
  process.exit(1);
} else {
  console.error('Multiple matching endpoints found — set STRIPE_WEBHOOK_ENDPOINT_ID to pick one:');
  matches.forEach(e => console.error(`  ${e.id}  ${e.url}`));
  process.exit(1);
}

const updated = await stripe.webhookEndpoints.update(endpoint.id, { enabled_events: enabledEvents });
console.log(`Updated ${updated.url} (${updated.id}) to send:`);
updated.enabled_events.forEach(evt => console.log(`  - ${evt}`));
