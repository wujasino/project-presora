/**
 * Shared status bands for the five 0-100 dimension scores (authority,
 * sentiment, accuracy, mentions, recency).
 *
 * Previously every screen invented its own thresholds and words —
 * ResultsBreakdown used 70/50 ("Strong"/"Needs work"/"Critical"), HomeHub
 * used 75/60 (same three words), AuditReport used 75/50
 * ("Strong"/"Developing"/"Needs attention"). A dimension scoring 71 could
 * read "Strong" in one place and something implying trouble in another, on
 * the exact same report. One function, one set of words, used everywhere a
 * dimension score becomes a status word, a bar colour, or a chart fill.
 *
 * Plain-English labels, not run through t() — keeping the word identical
 * everywhere it appears matters more than translating it, and a translated
 * copy would need to be kept in sync across 6 locale files by hand or it
 * would silently drift back into the exact bug this module exists to fix.
 */
export type Band = 'strong' | 'good' | 'weak' | 'critical';

export const bandOf = (score: number): Band =>
  score >= 90 ? 'strong' : score >= 75 ? 'good' : score >= 60 ? 'weak' : 'critical';

/** Bands that genuinely warrant a recommendation — "good" is fine as-is. */
export const needsAction = (score: number): boolean => {
  const b = bandOf(score);
  return b === 'weak' || b === 'critical';
};

export const BAND_LABEL: Record<Band, string> = {
  strong: 'Strong',
  good: 'Good',
  weak: 'Weak',
  critical: 'Critical',
};

/** Tailwind classes for card/badge-style UI (ResultsBreakdown, HomeHub). */
export const BAND_STYLE: Record<Band, { meter: string; text: string; chip: string }> = {
  strong:   { meter: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
  good:     { meter: 'bg-sky-500',     text: 'text-sky-600 dark:text-sky-400',         chip: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20' },
  weak:     { meter: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
  critical: { meter: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',         chip: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20' },
};

/** Hex fills for chart/donut usage (HomeHub's dimension-health ring). */
export const BAND_HEX: Record<Band, string> = {
  strong: '#10b981',
  good: '#0ea5e9',
  weak: '#f59e0b',
  critical: '#ef4444',
};
