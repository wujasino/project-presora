import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Lock, ArrowRight, Plus, X, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { usePlan, tierOf, useSessionUser } from '@/hooks/useAccountInfo';
import { brandKey, dedupeAnalyses } from '@/lib/analyses';

interface AnalysisRow {
  id: string;
  brand_name: string;
  trust_score: number;
  created_at: string;
  sources: { model: string; sentiment: string; association: string; confidence: number }[] | null;
}

interface TrackedCompetitor {
  id: string;
  brand_key: string;
  competitor_name: string;
  last_score: number | null;
  last_scanned_at: string | null;
  last_scan_error: string | null;
}

const formatScanDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const MAX_COMPETITORS_PER_BRAND = 10;

/**
 * /competitor-tracker — Growth/Agency feature (`tierOf(plan) >= 2`, same
 * threshold as "Competitor comparison" in plans.ts). Lets a user name
 * competitors for one of their tracked brands and see how often AI models
 * actually mentioned that competitor by name in that brand's own scans.
 *
 * The percentage is a literal, case-insensitive substring count over
 * analyses.sources[].association — the only per-model text this app has —
 * across every saved scan of the selected brand. It's a real, if narrow,
 * signal (does the model's own sentence about YOUR brand happen to name
 * this rival), not a synthetic "AI recommends X over Y" statistic; there is
 * no infrastructure anywhere in this codebase that asks a model to compare
 * two brands directly; see CLAUDE.md's provider notes.
 */
const CompetitorTracker = () => {
  const { data: plan = 'Free' } = usePlan();
  const canTrack = tierOf(plan) >= 2;
  const { data: sessionUser, isLoading: userLoading } = useSessionUser();
  const userId = sessionUser?.id ?? null;

  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [competitors, setCompetitors] = useState<TrackedCompetitor[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !canTrack || !userId) { setLoading(false); return; }
    (async () => {
      const [{ data: analysisData }, { data: competitorData, error: compError }] = await Promise.all([
        supabase
          .from('analyses')
          .select('id, brand_name, trust_score, created_at, sources')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('tracked_competitors')
          .select('id, brand_key, competitor_name, last_score, last_scanned_at, last_scan_error')
          .eq('user_id', userId),
      ]);
      if (compError) {
        setError(compError.code === '42P01' ? 'Competitor tracking isn’t set up yet — run the 20240140_tracked_competitors.sql migration.' : 'Could not load tracked competitors.');
      }
      const deduped = dedupeAnalyses((analysisData as AnalysisRow[]) ?? []);
      setAnalyses(deduped);
      setCompetitors((competitorData as TrackedCompetitor[]) ?? []);
      if (deduped.length > 0) setSelectedBrand(brandKey(deduped[0].brand_name));
      setLoading(false);
    })();
  }, [userId, userLoading, canTrack]);

  // Distinct brands the user has actually scanned, most recent first.
  const brandOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of analyses) {
      const key = brandKey(a.brand_name);
      if (!seen.has(key)) seen.set(key, a.brand_name);
    }
    return Array.from(seen.entries());
  }, [analyses]);

  const brandScans = useMemo(
    () => analyses.filter((a) => brandKey(a.brand_name) === selectedBrand),
    [analyses, selectedBrand],
  );

  const brandCompetitors = useMemo(
    () => competitors.filter((c) => c.brand_key === selectedBrand),
    [competitors, selectedBrand],
  );

  // Most recent scan of the selected brand — the "you" side of the
  // head-to-head. brandScans is already sorted newest-first (the query
  // orders by created_at desc).
  const yourScore = brandScans[0]?.trust_score ?? null;

  const mentionStats = useMemo(() => {
    return brandCompetitors.map((c) => {
      const needle = c.competitor_name.toLowerCase();
      const mentionedIn = brandScans.filter((a) =>
        (a.sources ?? []).some((s) => (s.association || '').toLowerCase().includes(needle))
      ).length;
      return {
        ...c,
        mentionedIn,
        total: brandScans.length,
        pct: brandScans.length > 0 ? Math.round((mentionedIn / brandScans.length) * 100) : 0,
      };
    });
  }, [brandCompetitors, brandScans]);

  const addCompetitor = async () => {
    const name = newCompetitor.trim();
    if (!name || !userId || !selectedBrand) return;
    if (brandCompetitors.length >= MAX_COMPETITORS_PER_BRAND) {
      setError(`Up to ${MAX_COMPETITORS_PER_BRAND} competitors per brand.`);
      return;
    }
    setSaving(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from('tracked_competitors')
      .insert({ user_id: userId, brand_key: selectedBrand, competitor_name: name })
      .select('id, brand_key, competitor_name, last_score, last_scanned_at, last_scan_error')
      .single();
    if (insertError) {
      setError(insertError.code === '23505' ? 'Already tracking that competitor for this brand.' : 'Could not save competitor.');
    } else if (data) {
      setCompetitors((prev) => [...prev, data as TrackedCompetitor]);
      setNewCompetitor('');
    }
    setSaving(false);
  };

  const removeCompetitor = async (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('tracked_competitors').delete().eq('id', id);
  };

  const [scanningId, setScanningId] = useState<string | null>(null);

  // Runs the real scan pipeline (same one analyze.js uses) against this
  // competitor's name via scan-competitor.js — a real, freshly-measured
  // score, not an invented one. Costs actual model calls, so it's an
  // explicit click, never triggered automatically on page load.
  const scanCompetitor = async (id: string) => {
    setScanningId(id);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setScanningId(null); return; }
    try {
      const res = await fetch('/.netlify/functions/scan-competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ competitorId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, last_scan_error: data.error || 'Scan failed.' } : c)));
      } else {
        setCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, last_score: data.score, last_scanned_at: data.scannedAt, last_scan_error: null } : c)));
      }
    } catch {
      setCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, last_scan_error: 'Scan failed. Please try again.' } : c)));
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Competitor Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Name the competitors AI models keep bringing up next to you, and see how often each one is actually
            mentioned by name across your own scans of this brand.
          </p>
        </div>
      </div>

      {!canTrack ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Available on the Business plan and above</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            Competitor comparison is part of the Business and Agency plans.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            See plans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : brandOptions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">No scanned brands yet</p>
          <p className="text-sm text-muted-foreground mt-1">Run a brand scan first, then come back here to track competitors for it.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {brandOptions.map(([key, display]) => (
                <option key={key} value={key}>{display}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Based on {brandScans.length} saved scan{brandScans.length === 1 ? '' : 's'} of this brand.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Tracked competitors</label>
            {mentionStats.length === 0 && (
              <p className="text-xs text-muted-foreground">No competitors tracked for this brand yet.</p>
            )}
            <div className="space-y-2">
              {mentionStats.map((c) => {
                const isScanning = scanningId === c.id;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-background/40 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{c.competitor_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Mentioned by name in {c.mentionedIn} of {c.total} scan{c.total === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${c.pct}%` }} />
                        </div>
                        <span className="text-sm font-data font-semibold text-foreground w-10 text-right">{c.pct}%</span>
                        <button
                          type="button"
                          onClick={() => removeCompetitor(c.id)}
                          aria-label={`Stop tracking ${c.competitor_name}`}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Head-to-head: a real, freshly-scanned score for the
                        competitor (scan-competitor.js runs the same pipeline
                        analyze.js uses), never an invented number. */}
                    <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-data font-semibold text-foreground">{yourScore ?? '—'}</span>
                        <span className="text-muted-foreground">you vs</span>
                        <span className={cn(
                          'font-data font-semibold',
                          c.last_score === null ? 'text-muted-foreground' :
                            yourScore !== null && c.last_score > yourScore ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        )}>
                          {c.last_score ?? '—'}
                        </span>
                        <span className="text-muted-foreground truncate">{c.competitor_name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => scanCompetitor(c.id)}
                        disabled={isScanning}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        {c.last_score !== null ? 'Rescan' : 'Scan now'}
                      </button>
                    </div>
                    {c.last_scanned_at && !c.last_scan_error && (
                      <p className="mt-1 text-[11px] text-muted-foreground">Last checked {formatScanDate(c.last_scanned_at)}</p>
                    )}
                    {c.last_scan_error && (
                      <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{c.last_scan_error}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {brandCompetitors.length < MAX_COMPETITORS_PER_BRAND && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCompetitor(); }}
                  placeholder="Competitor name"
                  maxLength={60}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={addCompetitor}
                  disabled={saving || !newCompetitor.trim()}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                    'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 disabled:opacity-50'
                  )}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Add
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorTracker;
