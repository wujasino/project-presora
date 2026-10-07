// reCAPTCHA v3 — invisible, no user interaction. Loads Google's script once
// (lazily, only when a form that needs it actually mounts) and exposes a
// single getRecaptchaToken(action) that resolves a fresh token per call, as
// Google requires — tokens are single-use and expire after ~2 minutes.
//
// Guards specific abuse-prone public forms (contact, forgot-password,
// registration) — the same class of targeted abuse the rate limits already
// in these functions address, not a defense against raw traffic floods
// (that's an infrastructure-layer concern, not something a browser widget
// can stop).
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

let loadPromise: Promise<void> | null = null;

const loadScript = (): Promise<void> => {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (!SITE_KEY) {
      reject(new Error('VITE_RECAPTCHA_SITE_KEY is not configured'));
      return;
    }
    if (document.querySelector('script[data-recaptcha-v3]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.dataset.recaptchaV3 = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
  return loadPromise;
};

/**
 * Resolves a fresh reCAPTCHA v3 token for the given action name (must match
 * what the verifying function passes to Google's siteverify call, or the
 * action-mismatch check there rejects a legitimate token).
 *
 * Fails open by returning null rather than throwing, on purpose: a
 * misconfigured or blocked (ad-blocker) reCAPTCHA script must never lock
 * real users out of contacting support or resetting a forgotten password.
 * The verifying function on the backend decides what an absent token means
 * for that specific endpoint.
 */
export const getRecaptchaToken = async (action: string): Promise<string | null> => {
  if (!SITE_KEY) return null;
  try {
    await loadScript();
    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(SITE_KEY, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  } catch {
    return null;
  }
};

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
