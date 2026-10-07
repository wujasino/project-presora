#!/usr/bin/env node
/**
 * Runs after `vite build`. This app is a client-rendered SPA — every route
 * is served the same static dist/index.html, and only useSeo.ts's
 * applySeo() (which needs React to have mounted) ever swaps in the
 * per-route <title>/description/canonical. Googlebot executes JS and sees
 * the corrected tags fine, but most AI crawlers relevant to a GEO product
 * (GPTBot, ClaudeBot, PerplexityBot, etc. — see public/robots.txt) fetch
 * raw HTML and never run that script, so every indexable page on the site
 * would otherwise look identical to them: same homepage title, same
 * description, same canonical URL, regardless of which URL they requested.
 *
 * This writes a real dist/<route>/index.html per indexable route (same
 * SEO_CONFIG used by useSeo.ts, see seo-config.json) with the correct meta
 * tags baked in. Netlify serves a matching static file before falling back
 * to the SPA catch-all redirect in netlify.toml, so this doesn't change
 * anything for real browsers (React Router mounts and renders normally) —
 * it only fixes what non-JS crawlers see.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://www.presora.app';

const seoConfig = JSON.parse(await readFile(path.join(ROOT, 'seo-config.json'), 'utf8'));

const setTagAttr = (html, selector, attr, value) => {
  // selector is a simple `tag[attr="match"]` matcher — enough for the fixed
  // set of tags index.html actually has, no need for a real HTML parser.
  const m = selector.match(/^(\w+)\[([\w-]+)="([^"]+)"\]$/);
  const [, tag, matchAttr, matchValue] = m;
  const re = new RegExp(`(<${tag}[^>]*\\b${matchAttr}="${matchValue}"[^>]*\\b${attr}=")[^"]*(")`, 'i');
  if (!re.test(html)) return html;
  return html.replace(re, `$1${value.replace(/\$/g, '$$$$')}$2`);
};

if (!existsSync(DIST)) {
  console.error('prerender-seo: dist/ not found — run `vite build` first.');
  process.exit(1);
}

const baseHtml = await readFile(path.join(DIST, 'index.html'), 'utf8');

let written = 0;
for (const [route, config] of Object.entries(seoConfig)) {
  if (route === '/' || config.noindex) continue; // '/' IS dist/index.html already

  const url = `${SITE_URL}${route}`;
  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${config.title}</title>`);
  html = setTagAttr(html, 'meta[name="description"]', 'content', config.description);
  html = setTagAttr(html, 'meta[property="og:title"]', 'content', config.title);
  html = setTagAttr(html, 'meta[property="og:description"]', 'content', config.description);
  html = setTagAttr(html, 'meta[property="og:url"]', 'content', url);
  html = setTagAttr(html, 'meta[name="twitter:title"]', 'content', config.title);
  html = setTagAttr(html, 'meta[name="twitter:description"]', 'content', config.description);
  html = setTagAttr(html, 'link[rel="canonical"]', 'href', url);
  // Three pages (regulamin, polityka-prywatnosci, regulamin-newslettera) are
  // written in Polish but were served inside index.html's `<html lang="en">`.
  // Google reads that attribute for language targeting, so a Polish page
  // declaring itself English is a real mismatch — useSeo.ts applies the same
  // value client-side for the SPA navigation case.
  if (config.lang) {
    html = html.replace(/(<html\b[^>]*\blang=")[^"]*(")/i, `$1${config.lang}$2`);
  }

  const outDir = path.join(DIST, route.replace(/^\//, ''));
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html);
  written += 1;
}

console.log(`prerender-seo: wrote ${written} per-route index.html file(s) into dist/`);
