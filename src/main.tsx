import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { LocaleProvider } from './lib/locale';
import { ThemeProvider } from 'next-themes';
import * as Sentry from '@sentry/react';

// Off until VITE_SENTRY_DSN is set — no account exists for this project yet,
// so this stays a no-op rather than shipping a broken/empty DSN. Add the env
// var (Sentry project settings → Client Keys) to turn on error monitoring.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

// Same pattern as Sentry above — off until VITE_PLAUSIBLE_DOMAIN is set (no
// account exists yet). Plausible over GA4: cookieless, no consent banner
// required under GDPR, one <script> tag, no vendor SDK to bundle.
if (import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

// Self-XSS protection
if (typeof console !== 'undefined') {
  const stop = [
    '%cSTOP!',
    'color:#FF0000;font-size:48px;font-weight:bold;-webkit-text-stroke:2px black',
  ];
  const warn = [
    '%cTo jest funkcja przeglądarki przeznaczona dla deweloperów.\nJeśli ktoś kazał Ci tu coś wkleić, aby uzyskać dostęp do Twojego konta — jest to atak (Self-XSS).\nNIE wklejaj żadnego kodu.',
    'font-size:14px;color:#333;',
  ];
  console.log(...stop);
  console.log(...warn);
}

const root = createRoot(document.getElementById("root")!);

// App.tsx (and everything it renders) pulls in ./lib/supabase, which throws
// at module-evaluation time if VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY
// aren't set — e.g. a deploy whose environment variables weren't configured
// for this context. A static `import App from "./App.tsx"` would let that
// throw happen before React ever mounts, producing a blank page and an
// "Uncaught Error" in the console instead of anything a visitor (or a
// screenshot sent to support) could act on. Importing it dynamically here
// lets us catch that and render an actual error screen instead.
import("./App.tsx")
  .then(({ default: App }) => {
    // Belt-and-suspenders session refresh: supabase-js already auto-refreshes
    // the access token on a timer, but that timer is paused while the tab is
    // hidden/frozen (mobile browsers routinely discard background tabs for
    // hours). Without this, a user who reopens a long-dormant tab can hit the
    // first API call with an already-expired token before the timer catches
    // up, which looks exactly like "I got logged out for no reason".
    // getSession() transparently refreshes if the stored token is stale, so
    // this is a no-op most of the time and cheap either way.
    import("./lib/supabase").then(({ supabase }) => {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          supabase.auth.getSession();
        }
      });
    });

    root.render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="bb_theme">
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>
    );
  })
  .catch((err) => {
    console.error('Failed to start the app:', err);
    root.render(
      createElement('div', {
        style: {
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0B0F19', color: '#F8FAFC', fontFamily: 'system-ui, sans-serif', padding: '2rem',
        },
      },
        createElement('div', { style: { maxWidth: '28rem', textAlign: 'center' } },
          createElement('h1', { style: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' } }, 'Configuration error'),
          createElement('p', { style: { fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6 } },
            err instanceof Error ? err.message : String(err)),
        ),
      )
    );
  });
