import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns/promises';
import net from 'node:net';
import { JSDOM } from 'jsdom';
import ws from 'ws';

// supabase-js reaches for a global WebSocket (realtime) that Node doesn't
// provide — see the same guard in analyze.js.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

// === Rate limiting (per user, in-memory — same trade-off as analyze.js:
// resets on cold start, good enough to stop accidental hammering of a
// feature that fetches arbitrary third-party pages on our behalf) ===
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const requestStore = new Map();
const shouldRateLimit = (key) => {
  const now = Date.now();
  const entry = requestStore.get(key) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  requestStore.set(key, entry);
  return entry.count > MAX_REQUESTS_PER_WINDOW;
};

// === SSRF guard ===
// This endpoint fetches whatever URL the caller supplies, server-side, using
// our own network egress — the textbook SSRF setup. Every hostname (and every
// redirect target) is resolved and checked against private/internal ranges
// before a request is made, including the 169.254.169.254 cloud metadata
// address, which a bare "block localhost" check would miss.
const isPrivateIp = (ip) => {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 169 && parts[1] === 254) return true; // link-local + cloud metadata
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // CGNAT
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
    if (lower.startsWith('fe80')) return true; // link-local
    if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice(7)); // IPv4-mapped
    return false;
  }
  return false;
};

const assertPublicUrl = async (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('That is not a valid URL.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported.');
  }
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '0.0.0.0') {
    throw new Error('That host is not allowed.');
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('That host is not allowed.');
  } else {
    let records;
    try {
      records = await dns.lookup(hostname, { all: true });
    } catch {
      throw new Error('Could not resolve that host.');
    }
    if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
      throw new Error('That host is not allowed.');
    }
  }
  return parsed;
};

const EXTERNAL_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 3 * 1024 * 1024;
const MAX_REDIRECTS = 5;

/** Fetches `url`, re-validating every redirect hop through assertPublicUrl —
 *  fetch's own `redirect: 'follow'` would happily land on a private address
 *  reached only via a 3xx from an initially-public one. */
const fetchPageSafely = async (startUrl) => {
  let current = await assertPublicUrl(startUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(current.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PresoraSeoAudit/1.0; +https://www.presora.app)' },
      });
    } finally {
      clearTimeout(timer);
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), current);
      current = await assertPublicUrl(next.toString());
      continue;
    }
    if (!res.ok) {
      throw new Error(`The page responded with HTTP ${res.status}.`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`That URL did not return an HTML page (got "${contentType || 'unknown content type'}").`);
    }

    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > MAX_RESPONSE_BYTES) {
        reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks).toString('utf-8');
    return { html, finalUrl: current.toString() };
  }
  throw new Error('Too many redirects.');
};

// === Checks ===
const textOf = (el) => (el?.textContent || '').trim();
const attr = (el, name) => el?.getAttribute(name) || '';

const check = (id, label, status, detail) => ({ id, label, status, detail });

const runChecks = (html, finalUrl) => {
  const dom = new JSDOM(html, { url: finalUrl });
  const doc = dom.window.document;
  const results = [];

  // Title
  const title = textOf(doc.querySelector('title'));
  if (!title) {
    results.push(check('title', 'Page title', 'fail', 'No <title> tag found. This is the headline Google shows in search results.'));
  } else if (title.length > 60) {
    results.push(check('title', 'Page title', 'warn', `"${title}" is ${title.length} characters — Google typically truncates titles past ~60.`));
  } else if (title.length < 15) {
    results.push(check('title', 'Page title', 'warn', `"${title}" is only ${title.length} characters — likely too short to be descriptive.`));
  } else {
    results.push(check('title', 'Page title', 'pass', `"${title}" (${title.length} characters).`));
  }

  // Meta description
  const description = attr(doc.querySelector('meta[name="description"]'), 'content').trim();
  if (!description) {
    results.push(check('description', 'Meta description', 'fail', 'No meta description — Google will generate its own snippet, which you don\'t control.'));
  } else if (description.length > 160) {
    results.push(check('description', 'Meta description', 'warn', `${description.length} characters — likely truncated past ~155-160 in search results.`));
  } else if (description.length < 50) {
    results.push(check('description', 'Meta description', 'warn', `Only ${description.length} characters — probably too thin to be a useful snippet.`));
  } else {
    results.push(check('description', 'Meta description', 'pass', `${description.length} characters — in the recommended range.`));
  }

  // Canonical
  const canonical = attr(doc.querySelector('link[rel="canonical"]'), 'href');
  results.push(canonical
    ? check('canonical', 'Canonical URL', 'pass', canonical)
    : check('canonical', 'Canonical URL', 'warn', 'No canonical link — recommended when the same content can be reached at more than one URL.'));

  // H1
  const h1s = Array.from(doc.querySelectorAll('h1'));
  if (h1s.length === 0) {
    results.push(check('h1', 'H1 heading', 'fail', 'No <h1> found — every page should have exactly one main heading.'));
  } else if (h1s.length > 1) {
    results.push(check('h1', 'H1 heading', 'warn', `${h1s.length} <h1> tags found — search engines prefer a single, clear main heading.`));
  } else {
    results.push(check('h1', 'H1 heading', 'pass', `"${textOf(h1s[0]).slice(0, 80)}"`));
  }

  // lang attribute
  const lang = attr(doc.querySelector('html'), 'lang');
  results.push(lang
    ? check('lang', 'Language declared', 'pass', `lang="${lang}"`)
    : check('lang', 'Language declared', 'warn', 'No lang attribute on <html> — helps search engines and screen readers match content to language.'));

  // Viewport (mobile-friendliness signal)
  const viewport = attr(doc.querySelector('meta[name="viewport"]'), 'content');
  results.push(viewport
    ? check('viewport', 'Mobile viewport', 'pass', viewport)
    : check('viewport', 'Mobile viewport', 'fail', 'No viewport meta tag — the page likely won\'t render correctly on mobile, which affects mobile search ranking.'));

  // Robots
  const robotsMeta = attr(doc.querySelector('meta[name="robots"]'), 'content').toLowerCase();
  if (robotsMeta.includes('noindex')) {
    results.push(check('robots', 'Indexing allowed', 'fail', `meta robots is "${robotsMeta}" — this page is telling Google NOT to index it.`));
  } else {
    results.push(check('robots', 'Indexing allowed', 'pass', 'No noindex directive found.'));
  }

  // Open Graph
  const ogTitle = attr(doc.querySelector('meta[property="og:title"]'), 'content');
  const ogImage = attr(doc.querySelector('meta[property="og:image"]'), 'content');
  const ogDescription = attr(doc.querySelector('meta[property="og:description"]'), 'content');
  if (ogTitle && ogImage) {
    results.push(check('og', 'Open Graph tags', 'pass', 'og:title and og:image are present — links shared on social/chat apps will show a proper preview card.'));
  } else {
    results.push(check('og', 'Open Graph tags', 'warn', `Missing ${[!ogTitle && 'og:title', !ogImage && 'og:image', !ogDescription && 'og:description'].filter(Boolean).join(', ')} — shared links may show a blank or generic preview.`));
  }

  // Structured data (JSON-LD)
  const ldScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  let ldTypes = [];
  for (const s of ldScripts) {
    try {
      const parsed = JSON.parse(s.textContent || '{}');
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && item['@type']) ldTypes.push(item['@type']);
      }
    } catch {
      // malformed JSON-LD block — counted below, not fatal
    }
  }
  if (ldScripts.length === 0) {
    results.push(check('structured-data', 'Structured data (schema.org)', 'warn', 'No JSON-LD found — adding an Organization/Product schema helps Google show rich results (ratings, breadcrumbs, sitelinks).'));
  } else {
    results.push(check('structured-data', 'Structured data (schema.org)', 'pass', `Found ${ldScripts.length} JSON-LD block(s)${ldTypes.length ? `: ${ldTypes.join(', ')}` : ''}.`));
  }

  // Images without alt text
  const images = Array.from(doc.querySelectorAll('img'));
  const missingAlt = images.filter((img) => !attr(img, 'alt').trim()).length;
  if (images.length === 0) {
    results.push(check('img-alt', 'Image alt text', 'pass', 'No images on this page.'));
  } else if (missingAlt === 0) {
    results.push(check('img-alt', 'Image alt text', 'pass', `All ${images.length} images have alt text.`));
  } else {
    results.push(check('img-alt', 'Image alt text', missingAlt === images.length ? 'fail' : 'warn', `${missingAlt} of ${images.length} images are missing alt text — alt text is one of the signals Google uses for image search.`));
  }

  // Thin content
  const bodyText = textOf(doc.body).replace(/\s+/g, ' ');
  const wordCount = bodyText ? bodyText.split(' ').filter(Boolean).length : 0;
  if (wordCount < 150) {
    results.push(check('content', 'Content length', 'warn', `~${wordCount} words of visible text — thin pages tend to rank worse for competitive terms.`));
  } else {
    results.push(check('content', 'Content length', 'pass', `~${wordCount} words of visible text.`));
  }

  // HTTPS
  results.push(finalUrl.startsWith('https://')
    ? check('https', 'HTTPS', 'pass', 'Served over HTTPS.')
    : check('https', 'HTTPS', 'fail', 'Not served over HTTPS — Google treats this as a ranking and trust signal.'));

  const score = Math.round(
    (results.filter((r) => r.status === 'pass').length / results.length) * 100
  );

  return { checks: results, score, finalUrl };
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const declaredLength = Number(event.headers?.['content-length'] || 0);
  const actualLength = event.body ? Buffer.byteLength(event.body) : 0;
  if (declaredLength > 4 * 1024 || actualLength > 4 * 1024) {
    return jsonResponse(413, { error: 'Payload too large' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(500, { error: 'Server misconfiguration.' });
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
  if (!token) {
    return jsonResponse(401, { error: 'You must be signed in to run an SEO audit.' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  if (shouldRateLimit(`user:${user.id}`)) {
    return jsonResponse(429, { error: 'Too many audits — please wait a minute and try again.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const rawUrl = String(body?.url || '').trim();
  if (!rawUrl) {
    return jsonResponse(400, { error: 'A URL is required.' });
  }
  // A bare domain like "example.com" is the common thing people type —
  // default to https rather than making that a 400.
  const withScheme = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    const { html, finalUrl } = await fetchPageSafely(withScheme);
    const result = runChecks(html, finalUrl);
    return jsonResponse(200, result);
  } catch (err) {
    return jsonResponse(422, { error: err instanceof Error ? err.message : 'Could not audit that URL.' });
  }
};
