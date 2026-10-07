// Public embeddable SVG badge: /.netlify/functions/badge?brand=Tesla
// Renders a brand's AI-visibility score. Deterministic — same brand, same badge.

const FAMOUS_BRANDS = new Set([
  'tesla', 'apple', 'google', 'amazon', 'microsoft', 'meta', 'facebook',
  'netflix', 'nvidia', 'samsung', 'sony', 'nike', 'adidas', 'coca-cola',
  'cocacola', 'pepsi', 'mcdonalds', 'starbucks', 'spotify', 'openai',
  'anthropic', 'ibm', 'intel', 'oracle', 'salesforce',
]);

function scoreBrand(brandName) {
  const seed = String(brandName || 'unknown').toLowerCase().trim();
  const seedKey = seed.replace(/[^a-z0-9]/g, '');

  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  const next = () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return Math.round(((h % 66) + 66) % 66) + 30;
  };

  const dims = {
    authority: next(), sentiment: next(), recency: next(), mentions: next(), accuracy: next(),
  };

  if (FAMOUS_BRANDS.has(seedKey)) {
    let fh = 2166136261 >>> 0;
    for (let i = 0; i < seedKey.length; i++) {
      fh = Math.imul(fh ^ seedKey.charCodeAt(i), 16777619) >>> 0;
    }
    const off = () => ((fh = Math.imul(fh ^ (fh >>> 13), 1274126177) >>> 0) % 21);
    const BASE = 70;
    dims.authority = Math.max(dims.authority, BASE + off());
    dims.sentiment = Math.max(dims.sentiment, BASE + off());
    dims.recency = Math.max(dims.recency, BASE + off());
    dims.mentions = Math.max(dims.mentions, BASE + off());
    dims.accuracy = Math.max(dims.accuracy, BASE + off());
  }

  return Math.round((dims.authority + dims.sentiment + dims.recency + dims.mentions + dims.accuracy) / 5);
}

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));

function scoreColor(score) {
  if (score >= 75) return '#34D399';
  if (score >= 50) return '#8B79F6';
  return '#F87171';
}

export const handler = async (event) => {
  const brandRaw = (event.queryStringParameters && event.queryStringParameters.brand) || 'Your Brand';
  const brand = escapeXml(brandRaw.slice(0, 28));
  const score = scoreBrand(brandRaw);
  const color = scoreColor(score);

  const labelW = 168;
  const scoreW = 54;
  const totalW = labelW + scoreW;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="36" role="img" aria-label="Presora AI Visibility: ${score} of 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c1c1f"/>
      <stop offset="1" stop-color="#111113"/>
    </linearGradient>
  </defs>
  <rect rx="6" width="${totalW}" height="36" fill="url(#bg)"/>
  <rect rx="6" x="${labelW}" width="${scoreW}" height="36" fill="${color}"/>
  <rect x="${labelW}" width="8" height="36" fill="${color}"/>
  <g font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="11">
    <circle cx="16" cy="18" r="6" fill="none" stroke="#8B79F6" stroke-width="2"/>
    <text x="30" y="15" fill="#8B79F6" font-weight="700" font-size="10">PRESORA</text>
    <text x="30" y="27" fill="#9b9ba1" font-size="9">AI Visibility · ${brand}</text>
    <text x="${labelW + scoreW / 2}" y="23" fill="#0b0b0c" font-weight="800" font-size="14" text-anchor="middle">${score}</text>
  </g>
</svg>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
    body: svg,
  };
};
