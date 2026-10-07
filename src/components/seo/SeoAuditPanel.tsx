import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type CheckStatus = 'pass' | 'warn' | 'fail';

interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

interface AuditResult {
  checks: SeoCheck[];
  score: number;
  finalUrl: string;
}

const STATUS_META: Record<CheckStatus, { Icon: typeof CheckCircle2; className: string }> = {
  pass: { Icon: CheckCircle2, className: 'text-emerald-500' },
  warn: { Icon: AlertTriangle, className: 'text-amber-500' },
  fail: { Icon: XCircle, className: 'text-red-500' },
};

const scoreBand = (score: number) =>
  score >= 80 ? { label: 'Good', className: 'text-emerald-500' }
  : score >= 50 ? { label: 'Needs work', className: 'text-amber-500' }
  : { label: 'Poor', className: 'text-red-500' };

/**
 * On-page SEO audit: fetches the given page server-side (seo-audit.js) and
 * checks the same signals Google actually reads — title/description length,
 * H1, canonical, robots, viewport, structured data, image alt text, HTTPS.
 * No Google account or API key involved; this is about what's on the page
 * itself, which is the part a site owner directly controls.
 */
export const SeoAuditPanel = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be signed in to run an audit.');
      const res = await fetch('/.netlify/functions/seo-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not audit that page.');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com or https://example.com/page"
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !url.trim()} className="gap-1.5 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Auditing…' : 'Run audit'}
        </Button>
      </form>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-5 flex items-center gap-4">
            <div className={cn('text-3xl font-bold tabular-nums', scoreBand(result.score).className)}>
              {result.score}
            </div>
            <div className="flex-1">
              <p className={cn('text-sm font-semibold', scoreBand(result.score).className)}>
                {scoreBand(result.score).label}
              </p>
              <a
                href={result.finalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-0.5"
              >
                {result.finalUrl} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="glass-card divide-y divide-[hsl(45,100%,50%,0.05)]">
            {result.checks.map((c) => {
              const { Icon, className } = STATUS_META[c.status];
              return (
                <div key={c.id} className="p-4 flex items-start gap-3">
                  <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', className)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
