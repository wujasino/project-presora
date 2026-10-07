/**
 * Full AI model roster queried during a brand scan. `tier` is the minimum
 * plan tier (see PLAN_TIER / tierOf in useAccountInfo.ts) required to have
 * this model included — keep the `id`s in sync with the OPENROUTER_MODELS
 * allow-list in netlify/functions/analyze.js.
 */
export interface ModelDef {
  id: string;
  label: string;
  tier: 0 | 1 | 2;
}

export const MODEL_CATALOG: ModelDef[] = [
  { id: 'openai/gpt-4o', label: 'GPT-4o', tier: 0 },
  { id: 'anthropic/claude-sonnet-5', label: 'Claude', tier: 1 },
  { id: 'google/gemini-3.5-flash', label: 'Gemini', tier: 1 },
  { id: 'perplexity/sonar-pro', label: 'Perplexity', tier: 2 },
  { id: 'mistralai/mistral-large', label: 'Mistral', tier: 2 },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3', tier: 2 },
];

export const DEFAULT_MODEL_IDS = MODEL_CATALOG.map(m => m.id);

const MODEL_PREFS_KEY = 'bb_model_prefs';

export interface ModelPrefs {
  /** Model ids the user wants queried, subject to their plan's tier cap. */
  selected: string[];
}

export function loadModelPrefs(): ModelPrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(MODEL_PREFS_KEY) || '{}');
    return {
      selected: Array.isArray(raw.selected) && raw.selected.length > 0 ? raw.selected : DEFAULT_MODEL_IDS,
    };
  } catch {
    return { selected: DEFAULT_MODEL_IDS };
  }
}

export function saveModelPrefs(prefs: ModelPrefs) {
  localStorage.setItem(MODEL_PREFS_KEY, JSON.stringify(prefs));
}
