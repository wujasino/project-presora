/**
 * POST /.netlify/functions/generate-action-plan
 * Body: { analysisId: string }
 *
 * Turns a LOW-scoring scan into a short, concrete remediation checklist —
 * why the AI models are passing this brand over, three prioritized fixes,
 * and one quick win — rendered under the red "AI recommends your
 * competitors" alert on the results screen. Same mechanism as
 * generate-audit-summary.js (auth, ownership check, rate limit, Claude call
 * with a deterministic fallback, cached on the analyses row) but a
 * different, more literal output shape and — unlike that Agency/Enterprise
 * feature — available to any signed-in user, since this is framed as a
 * "(Beta)" freebie rather than a paid deliverable.
 *
 * There is no crawled-page or citation data anywhere in this codebase (see
 * runScan.js: each model only ever returns dimension scores + one
 * "association" sentence, never a URL or a named competitor) — so the
 * prompt is built to ground every claim in that association text and the
 * dimension scores only, and explicitly forbids inventing a specific
 * competitor, publication, or page that isn't actually named in the data.
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} catch (err) {
  console.error('generate-action-plan: Supabase client init failed:', err.message);
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

const DIMENSION_LABEL_PL = {
  authority: 'autorytet',
  sentiment: 'sentyment',
  recency: 'świeżość informacji',
  mentions: 'liczbę wzmianek',
  accuracy: 'dokładność informacji',
};

// Short category tag shown as a badge next to each step — one per dimension,
// so the deterministic fallback can label a step without inventing one.
const DIMENSION_CATEGORY_PL = {
  authority: 'Autorytet / PR',
  sentiment: 'Opinie / Social proof',
  recency: 'Świeżość treści',
  mentions: 'Wzmianki / PR',
  accuracy: 'SEO / Treść',
};

const PRIORITY_BY_RANK = ['high', 'medium', 'low'];

const rankedDimensions = (analysis) =>
  ['authority', 'sentiment', 'recency', 'mentions', 'accuracy']
    .map((key) => ({ key, value: analysis[key] }))
    .sort((a, b) => a.value - b.value);

/** Template fallback for when ANTHROPIC_API_KEY isn't configured — same role
 * as deterministicSummary() in generate-audit-summary.js. Never names a
 * competitor or a page, since none is real data here. */
const deterministicPlan = (analysis) => {
  const weak = rankedDimensions(analysis).slice(0, 3);
  const label = (k) => DIMENSION_LABEL_PL[k];
  return {
    whyIgnored: `Modele AI oceniają ${analysis.brand_name} najniżej w obszarach: ${weak.map((d) => label(d.key)).join(', ')} — to właśnie na tych sygnałach AI opiera rekomendacje w Twojej kategorii, a obecnie są one najsłabszym punktem audytu.`,
    steps: weak.map((d, i) => ({
      title: `Wzmocnij ${label(d.key)}`,
      description: `${label(d.key)} to jeden z najniżej ocenionych wymiarów (${d.value}/100). Skup się na konkretnych, sprawdzalnych treściach i wzmiankach dotyczących ${analysis.brand_name}, które bezpośrednio adresują ten obszar.`,
      priority: PRIORITY_BY_RANK[i] || 'low',
      category: DIMENSION_CATEGORY_PL[d.key],
    })),
    quickWin: `Dodaj do strony głównej i sekcji „O nas” jedno jasne zdanie opisujące, czym dokładnie zajmuje się ${analysis.brand_name} — to najprostszy sygnał, po którym modele AI łączą markę z właściwą kategorią.`,
  };
};

const buildPrompt = (analysis) => {
  const sources = Array.isArray(analysis.sources) ? analysis.sources : [];
  const sourceLines = sources
    .map((s) => `- ${s.model}: sentiment ${s.sentiment}, confidence ${s.confidence}, note: "${s.association}"`)
    .join('\n');
  const weakest = rankedDimensions(analysis).slice(0, 2).map((d) => DIMENSION_LABEL_PL[d.key]).join(' i ');

  return `Jesteś ekspertem ds. GEO (Generative Engine Optimization) i marketingu cyfrowego. Przeanalizuj poniższy, niski wynik audytu widoczności marki w AI i przygotuj krótką, konkretną listę kroków naprawczych.

Marka: ${analysis.brand_name}
Wynik zaufania: ${analysis.trust_score}/100 (to NISKI wynik — marka jest pomijana)
Wyniki wymiarów (0-100): autorytet ${analysis.authority}, sentyment ${analysis.sentiment}, świeżość ${analysis.recency}, wzmianki ${analysis.mentions}, dokładność ${analysis.accuracy}
Najsłabsze wymiary: ${weakest}
Co realnie odpowiedziały poszczególne modele AI o tej marce:
${sourceLines || '(brak danych per-model)'}

Opieraj każde stwierdzenie WYŁĄCZNIE na powyższych danych. Nigdy nie wymyślaj konkretnej nazwy konkurenta, konkretnego portalu ani konkretnej strony internetowej, chyba że jest ona wprost wymieniona w notatkach modeli powyżej — jeśli żadna nie jest wymieniona, odnoś się do konkurencji/źródeł ogólnie (np. "inne firmy z tej branży", "portale branżowe"), nie zmyślając nazw.

Odpowiedz WYŁĄCZNIE obiektem JSON, bez znaczników markdown, dokładnie w tym kształcie:
{
  "whyIgnored": "2-3 zdania po polsku wyjaśniające, dlaczego AI pomija tę markę — oparte wyłącznie na powyższych danych",
  "steps": [
    {
      "title": "krótki, konkretny tytuł kroku po polsku",
      "description": "1-2 zdania po polsku, co dokładnie zrobić",
      "priority": "high" | "medium" | "low",
      "category": "krótki tag kategorii po polsku, np. 'SEO / Treść', 'Autorytet / PR', 'Opinie / Social proof'"
    }
  ],
  "quickWin": "jedno bardzo proste zadanie do zrobienia od razu, po polsku"
}
Pole "steps" musi zawierać dokładnie 3 elementy, uporządkowane od najważniejszego (pierwszy = "high"). Nie każdy krok musi mieć inny priorytet, ale kolejność ma odzwierciedlać realny wpływ.`;
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
  // Never assume content[0] is the text block — see generate-audit-summary.js.
  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks.find((b) => typeof b?.text === 'string' && b.text.length > 0)?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON object found in model response (stop_reason: ${data?.stop_reason ?? 'unknown'})`);
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.whyIgnored || !Array.isArray(parsed.steps) || !parsed.quickWin) {
    throw new Error('Model response missing required fields');
  }
  return parsed;
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
      .select('id, user_id, brand_name, trust_score, authority, sentiment, recency, mentions, accuracy, sources, action_plan')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Analysis not found' }) };
    }
    if (analysis.user_id !== user.id) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Analysis not found' }) };
    }

    if (analysis.action_plan) {
      return { statusCode: 200, headers, body: JSON.stringify({ plan: analysis.action_plan, cached: true }) };
    }

    let plan;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        plan = await callClaude(buildPrompt(analysis));
      } catch (err) {
        console.error('generate-action-plan: Claude call failed, falling back:', err.message);
        plan = deterministicPlan(analysis);
      }
    } else {
      plan = deterministicPlan(analysis);
    }

    const { error: saveError } = await supabaseAdmin
      .from('analyses')
      .update({ action_plan: plan })
      .eq('id', analysisId);
    if (saveError) {
      console.error('generate-action-plan: failed to cache plan:', saveError.message);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ plan, cached: false }) };
  } catch (err) {
    console.error('generate-action-plan handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
