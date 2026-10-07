import * as Sentry from '@sentry/node';

// Lazy, once-only init — most functions never call this, so there's no
// reason to pay Sentry's init cost on every cold start of every function.
// No-ops entirely when SENTRY_DSN isn't set: this must never throw or block
// the caller's own error handling (e.g. stripe-webhook.js still has to
// return its 500 to Stripe regardless of whether Sentry itself is reachable).
let initialized = false;
const ensureInit = () => {
  if (initialized) return;
  initialized = true;
  if (!process.env.SENTRY_DSN) return;
  try {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
  } catch (err) {
    console.error('sentry init failed:', err.message);
  }
};

/**
 * For failures worth paging on, not routine error logging — e.g. Supabase
 * being unreachable mid Stripe-webhook, where a plain console.error would
 * sit unread in Netlify's function logs until someone happens to look.
 * Never throws itself.
 */
export const captureCriticalError = (error, extra) => {
  console.error('CRITICAL:', extra?.context || '', error?.message || error);
  try {
    ensureInit();
    if (!process.env.SENTRY_DSN) return;
    Sentry.captureException(error, extra ? { extra } : undefined);
  } catch (err) {
    console.error('sentry captureException failed:', err.message);
  }
};
