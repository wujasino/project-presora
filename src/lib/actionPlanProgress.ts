/**
 * Persists the AI Action Plan's per-step checkboxes to localStorage.
 *
 * The checkboxes were originally spec'd as purely decorative/visual (never
 * sent anywhere) — but Home's "Tasks Status" tile needs a real completed
 * count to show next to the dimension-health pie chart, and a real count
 * needs real, remembered state. localStorage keeps this a lightweight,
 * per-browser preference rather than a backend feature: no migration, no
 * sync across devices, same trade-off already accepted for voice/model
 * preferences elsewhere in this app (loadVoicePrefs, loadModelPrefs).
 */
const STORAGE_KEY = 'presora_action_plan_progress';

type ProgressMap = Record<string, true>;

const readAll = (): ProgressMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const stepKey = (analysisId: string, stepIndex: number) => `${analysisId}:${stepIndex}`;

export const isStepDone = (analysisId: string, stepIndex: number): boolean => {
  try {
    return !!readAll()[stepKey(analysisId, stepIndex)];
  } catch {
    return false;
  }
};

export const setStepDone = (analysisId: string, stepIndex: number, done: boolean): void => {
  try {
    const all = readAll();
    const key = stepKey(analysisId, stepIndex);
    if (done) all[key] = true;
    else delete all[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable (private mode, quota) — the checkbox still works
    // for the current page view, it just won't be remembered. Non-fatal.
  }
};

/** Summed completed/total steps across a set of analyses that each have an action plan. */
export const countActionPlanProgress = (
  analyses: { id: string; totalSteps: number }[],
): { done: number; total: number } => {
  const all = readAll();
  let done = 0;
  let total = 0;
  for (const a of analyses) {
    total += a.totalSteps;
    for (let i = 0; i < a.totalSteps; i++) {
      if (all[stepKey(a.id, i)]) done += 1;
    }
  }
  return { done, total };
};
