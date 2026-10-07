/**
 * POST /.netlify/functions/generate-audit-summary
 * Body: { analysisId: string }
 *
 * Turns the numeric scan result into a business-framed narrative — headline,
 * business impact, competitive read, and 3-5 prioritized recommendations —
 * so the report at /audit/:id is something a consultant can hand to a
 * prospect, not just a scoreboard. Generated once per analysis via Claude
 * and cached on analyses.audit_summary; re-opening the report is a plain
 * read, no repeat LLM call.
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// createClient() throws synchronously on a missing/malformed URL — guarded
// the same way as newsletter-preference.js, so a bad env var degrades to a
// clean 500 instead of crashing at module load, before the handler's own
// try/catch can run.
let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('generate-audit-summary: Supabase client init failed:', err.message);
}

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

const EXTERNAL_TIMEOUT_MS = 25_000;
const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestStore = new Map();
const shouldRateLimit = (key) => {
  const current = Date.now();
  const entry = requestStore.get(key) || { count: 0, windowStart: current };
  if (current - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = current;
    entry.count = 0;
  }
  entry.count += 1;
  requestStore.set(key, entry);
  return entry.count > MAX_REQUESTS_PER_WINDOW;
};

const dimensionLabel = { authority: 'authority', sentiment: 'sentiment', recency: 'recency', mentions: 'mention rate', accuracy: 'accuracy' };

const rankedDimensions = (analysis) =>
  ['authority', 'sentiment', 'recency', 'mentions', 'accuracy']
    .map((key) => ({ key, value: analysis[key] }))
    .sort((a, b) => a.value - b.value);

/**
 * Template fallback for when ANTHROPIC_API_KEY isn't configured (local dev,
 * this sandbox, or a transient outage) — same role as runScan.js's
 * deterministicResult(): the feature stays usable and testable without a
 * live model call, just with generic instead of brand-specific language.
 */
const deterministicSummary = (analysis) => {
  const ranked = rankedDimensions(analysis);
  const weak = ranked.slice(0, 2);
  const strongest = ranked[ranked.length - 1];
  const score = analysis.trust_score;
  const tier = score >= 75 ? 'strong' : score >= 50 ? 'developing' : 'weak';
  return {
    headline: `${analysis.brand_name}'s AI visibility is ${tier} — trust score ${score}/100`,
    businessImpact: `Buyers increasingly ask ChatGPT, Claude and Gemini for recommendations before they search or ask a person. A ${tier} score means ${analysis.brand_name} is ${score >= 75 ? 'showing up when it counts' : 'losing ground to competitors AI assistants recommend instead'} in exactly those conversations.`,
    narrative: `Across the five dimensions this audit measures, ${analysis.brand_name} scores strongest on ${dimensionLabel[strongest.key]} and weakest on ${weak.map(d => dimensionLabel[d.key]).join(' and ')}. That gap is where a competitor is most likely being recommended instead.`,
    competitivePosition: score >= 75
      ? 'This brand is in a defensible position — the priority is protecting it as AI models update.'
      : 'There is a clear, closeable gap versus brands AI models currently favor in this category.',
    recommendations: weak.map((d, i) => ({
      title: `Improve ${dimensionLabel[d.key]}`,
      description: `${dimensionLabel[d.key]} is the lowest-scoring dimension at ${d.value}/100 — targeted content and third-party mentions addressing this directly are the fastest lever to move the overall score.`,
      priority: i === 0 ? 'high' : 'medium',
    })),
  };
};

const buildPrompt = (analysis) => {
  const sources = Array.isArray(analysis.sources) ? analysis.sources : [];
  const sourceLines = sources.map(s => `- ${s.model}: sentiment ${s.sentiment}, confidence ${s.confidence}`).join('\n');
  return `You are writing the executive summary section of a paid brand-visibility audit, for a consultant to hand directly to their client. Be specific, business-framed, and confident — not generic marketing filler.

Brand: ${analysis.brand_name}
Trust score: ${analysis.trust_score}/100
Dimension scores (0-100): authority ${analysis.authority}, sentiment ${analysis.sentiment}, recency ${analysis.recency}, mentions ${analysis.mentions}, accuracy ${analysis.accuracy}
Per-model AI results:
${sourceLines || '(no per-model breakdown available)'}

Respond with ONLY a JSON object, no markdown fences, matching exactly:
{
  "headline": "one sentence, the single most important finding",
  "businessImpact": "2-3 sentences on why this matters commercially, written for a business owner not a marketer",
  "narrative": "2-3 sentences interpreting the dimension scores — where this brand is strong, where it's weak, and why",
  "competitivePosition": "1-2 sentences on what this implies versus competitors AI models might recommend instead",
  "recommendations": [
    { "title": "short action title", "description": "1-2 sentences, specific and actionable", "priority": "high" | "medium" | "low" }
  ]
}
Include 3 to 5 recommendations, ordered highest priority first.`;
};

const callClaude = async (prompt) => {
  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const data = await res.json();
  // Was `data.content?.[0]?.text` — wrong whenever the first content block
  // isn't type "text" (e.g. a "thinking" block ahead of it on models with
  // extended thinking). A successful call then silently produced an empty
  // string, which fell straight through to the deterministic template below
  // — every audit read as generic, with no error anywhere to explain why.
  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks.find((b) => typeof b?.text === 'string' && b.text.length > 0)?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON object found in model response (stop_reason: ${data?.stop_reason ?? 'unknown'})`);
  return JSON.parse(jsonMatch[0]);
};

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    if (!supabaseAdmin) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
    }

    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // Client-ready audit export is an Agency-plan feature — enforced here too,
    // not just by hiding the button, so a direct call can't bypass it.
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    const plan = (profile?.plan || '').toLowerCase();
    if (plan !== 'agency' && plan !== 'enterprise') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'The client-ready audit report is available on the Agency plan.' }) };
    }

    if (shouldRateLimit(user.id)) {
      return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
    }

    let analysisId;
    try {
      ({ analysisId } = JSON.parse(event.body || '{}'));
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
    if (!analysisId || typeof analysisId !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '"analysisId" is required' }) };
    }

    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from('analyses')
      .select('id, user_id, brand_name, trust_score, authority, sentiment, recency, mentions, accuracy, sources, audit_summary')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Analysis not found' }) };
    }
    // Ownership check server-side — never trust the client-supplied id alone.
    if (analysis.user_id !== user.id) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Analysis not found' }) };
    }

    if (analysis.audit_summary) {
      return { statusCode: 200, headers, body: JSON.stringify({ summary: analysis.audit_summary, cached: true }) };
    }

    let summary;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        summary = await callClaude(buildPrompt(analysis));
      } catch (err) {
        console.error('generate-audit-summary: Claude call failed, falling back:', err.message);
        summary = deterministicSummary(analysis);
      }
    } else {
      summary = deterministicSummary(analysis);
    }

    const { error: saveError } = await supabaseAdmin
      .from('analyses')
      .update({ audit_summary: summary })
      .eq('id', analysisId);
    if (saveError) {
      console.error('generate-audit-summary: failed to cache summary:', saveError.message);
      // Non-fatal — still return the generated summary even if caching failed.
    }

    return { statusCode: 200, headers, body: JSON.stringify({ summary, cached: false }) };
  } catch (err) {
    console.error('generate-audit-summary handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
