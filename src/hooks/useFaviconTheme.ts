import { useEffect } from 'react';

// Mirrors Wordmark's light/dark mark swap for the browser-tab favicon: a
// dark glyph on white for the light landing page, a cream glyph on navy
// everywhere else (dashboard, login, etc. default to dark).
const ICON_PAIRS: [string, string][] = [
  ['/presora-favicon-512.png', '/presora-favicon-512-dark.png'],
  ['/android-chrome-192.png', '/android-chrome-192-dark.png'],
  ['/favicon-64.png', '/favicon-64-dark.png'],
  ['/favicon-32.png', '/favicon-32-dark.png'],
  ['/favicon-16.png', '/favicon-16-dark.png'],
  ['/favicon.ico', '/favicon-dark.ico'],
];

const LIGHT_TO_DARK = new Map(ICON_PAIRS);
const DARK_TO_LIGHT = new Map(ICON_PAIRS.map(([light, dark]) => [dark, light]));

const applyFaviconTheme = (isDark: boolean) => {
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((link) => {
    const current = link.getAttribute('href');
    if (!current) return;
    const next = isDark ? LIGHT_TO_DARK.get(current) : DARK_TO_LIGHT.get(current);
    if (next) link.setAttribute('href', next);
  });
};

/** Keeps the favicon in sync with the app's light/dark class on <html>. */
export const useFaviconTheme = () => {
  useEffect(() => {
    const root = document.documentElement;
    applyFaviconTheme(root.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      applyFaviconTheme(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
};
