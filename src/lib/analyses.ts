/**
 * Brand-name normalisation and scan de-duplication.
 *
 * Lives in lib/ rather than in a component: `Reports.tsx` needs
 * `dedupeAnalyses` and used to import it from `HomeHub.tsx`, which dragged
 * recharts and the whole Home screen into the Reports chunk. Pure functions
 * with no React or Supabase imports, so they can be pulled in from anywhere
 * (including `useBrewing`) without moving UI code with them.
 */

/**
 * Comparison key for a brand name.
 *
 * "presora" and "Presora.app" were stored as two unrelated brands with
 * divergent scores, which reads as the product contradicting itself. Strips
 * protocol, `www.`, any path and the TLD, so "https://www.Presora.app/",
 * "Presora.app" and "presora" all key to "presora".
 *
 * Display casing is preserved separately by `canonicalBrandName` — this is
 * only for grouping.
 */
export const brandKey = (raw: string): string =>
  String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/\.(com|net|org|io|app|co|ai|dev|xyz|pl|eu|de|fr|es|it|uk)$/, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Title-cases a name ONLY if the whole thing was typed in lowercase (or
 * already has some capitalisation is left untouched).
 *
 * A blind "capitalize every word" would wreck names with intentional
 * internal casing — "eBay", "iPhone", "PayPal" — by producing "Ebay",
 * "Iphone", "Paypal". Restricting the fix to strings that are entirely
 * lowercase to begin with (someone typed "facebook" or "coca-cola" without
 * thinking about it) avoids ever touching a name that already has a
 * deliberate capital somewhere in it.
 */
export const titleCaseIfAllLower = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed || trimmed !== trimmed.toLowerCase()) return trimmed;
  // Capitalises after start-of-string, spaces or hyphens only — NOT after a
  // "." — so a bare-typed domain like "facebook.com" becomes "Facebook.com"
  // rather than "Facebook.Com".
  return trimmed.replace(/(^|[\s-])([a-z])/g, (_, sep, c) => sep + c.toUpperCase());
};

/**
 * What gets written to `analyses.brand_name`: host/name without protocol or
 * path, original casing kept so "Coca-Cola" doesn't become "coca-cola" —
 * and a bare-lowercase input like "facebook" becomes "Facebook" so it
 * doesn't read as a typo next to properly-cased brands on the same screen.
 * Falls back to the raw input if normalisation empties it.
 */
export const canonicalBrandName = (raw: string): string => {
  const cleaned = String(raw || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return titleCaseIfAllLower(cleaned) || String(raw || '').trim();
};

/** Rows written this close together are the same scan saved twice. */
const DUPLICATE_WINDOW_MS = 10_000;

/**
 * Collapses the duplicate rows the pre-guard double-submit left behind: same
 * brand, same score, written two or three times within ~2 seconds.
 *
 * Those rows are indistinguishable to a reader but made every delta below
 * them wrong — a scan compared against its own duplicate reads "No change",
 * and the one after it compares against the wrong baseline.
 *
 * Expects `rows` sorted newest-first; the first of each group is kept.
 */
export const dedupeAnalyses = <T extends { brand_name: string; trust_score: number; created_at: string }>(
  rows: T[],
): T[] => {
  const out: T[] = [];
  for (const row of rows) {
    const isDupe = out.some(kept =>
      brandKey(kept.brand_name) === brandKey(row.brand_name) &&
      kept.trust_score === row.trust_score &&
      Math.abs(new Date(kept.created_at).getTime() - new Date(row.created_at).getTime()) < DUPLICATE_WINDOW_MS
    );
    if (!isDupe) out.push(row);
  }
  return out;
};
