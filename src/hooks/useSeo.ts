import seoConfigJson from '../../seo-config.json';

const SITE_URL = 'https://www.presora.app';

interface SeoConfig {
  title: string;
  description: string;
  /** Set true for pages that must not be indexed (auth-gated app views, transactional flows). */
  noindex?: boolean;
  /** BCP-47 code when the page's content isn't in index.html's default `en`
   *  (the Polish legal pages). Also applied at build time by
   *  scripts/prerender-seo.mjs for the non-JS-crawler case. */
  lang?: string;
}

// Single source of truth, also read at build time by scripts/prerender-seo.mjs
// to generate per-route static HTML (see that file for why: non-JS crawlers —
// most AI bots, unlike Googlebot — never run this module, so without a static
// snapshot per route they'd see the same generic homepage title/description/
// canonical for every page on the site).
export const SEO_CONFIG: Record<string, SeoConfig> = seoConfigJson;

const DEFAULT_SEO: SeoConfig = { title: 'Presora', description: 'Presora — AI Brand Visibility Scanner.', noindex: true };

const setMeta = (selector: string, attr: string, value: string) => {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute(attr, value);
};

export const applySeo = (pathname: string) => {
  const config = SEO_CONFIG[pathname] ?? DEFAULT_SEO;
  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`;

  document.title = config.title;
  // Falls back to 'en' rather than being left alone, so navigating from a
  // Polish legal page to an English one doesn't leave lang="pl" behind.
  document.documentElement.lang = config.lang ?? 'en';
  setMeta('meta[name="description"]', 'content', config.description);
  setMeta('meta[property="og:title"]', 'content', config.title);
  setMeta('meta[property="og:description"]', 'content', config.description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', config.title);
  setMeta('meta[name="twitter:description"]', 'content', config.description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  let robotsTag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robotsTag) {
    robotsTag = document.createElement('meta');
    robotsTag.name = 'robots';
    document.head.appendChild(robotsTag);
  }
  robotsTag.content = config.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large';
};
