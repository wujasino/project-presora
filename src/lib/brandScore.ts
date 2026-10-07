import type { AnalysisResult } from '@/types/analysis';

/**
 * Deterministic, client-side brand scorer.
 *
 * Mirrors the fallback logic in useBrewing so a competitor brand entered for
 * comparison gets a stable, plausible score without spending an API call or a
 * monthly analysis credit. Same input → same output, every time.
 */

const FAMOUS_BRANDS = new Set([
  'tesla', 'apple', 'google', 'amazon', 'microsoft', 'meta', 'facebook',
  'netflix', 'nvidia', 'samsung', 'sony', 'nike', 'adidas', 'coca-cola',
  'cocacola', 'pepsi', 'mcdonalds', 'starbucks', 'spotify', 'openai',
  'anthropic', 'ibm', 'intel', 'oracle', 'salesforce',
]);

export interface BrandDimensions {
  authority: number;
  sentiment: number;
  recency: number;
  mentions: number;
  accuracy: number;
}

export interface BrandScore {
  brandName: string;
  dimensions: BrandDimensions;
  trustScore: number;
}

export function scoreBrand(brandName: string): BrandScore {
  const seed = String(brandName || 'unknown').toLowerCase().trim();
  const seedKey = seed.replace(/[^a-z0-9]/g, '');

  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  const next = () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return Math.round(((h % 66) + 66) % 66) + 30; // 30..95
  };

  const dims: BrandDimensions = {
    authority: next(),
    sentiment: next(),
    recency: next(),
    mentions: next(),
    accuracy: next(),
  };

  // Well-known brands get a deterministic floor so they read as high-signal.
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

  const trustScore = Math.round(
    (dims.authority + dims.sentiment + dims.recency + dims.mentions + dims.accuracy) / 5
  );

  return { brandName, dimensions: dims, trustScore };
}

/** Convenience: pull dimensions from an existing analysis result. */
export function dimensionsOf(result: AnalysisResult): BrandDimensions {
  return result.dimensions;
}
