import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

type CheckStatus = 'operational' | 'degraded' | 'down';
type HealthResponse = {
  status: CheckStatus;
  timestamp: string;
  checks: Record<string, { status: CheckStatus; latencyMs?: number | null }>;
};

const STATUS_META: Record<CheckStatus, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  operational: { label: 'Operational', color: 'text-emerald-400', Icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: 'text-amber-400', Icon: AlertTriangle },
  down: { label: 'Down', color: 'text-red-500', Icon: XCircle },
};

const CHECK_LABEL: Record<string, string> = {
  app: 'Application',
  database: 'Database & Auth (Supabase)',
};

const Status = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch {
      setError('Could not reach the health check endpoint right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const overall = data?.status ?? null;
  const overallMeta = overall ? STATUS_META[overall] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-wider uppercase text-primary mb-3">Status</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
          System status
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-xl">
          A live check of Presora's core dependencies, run each time you load this page. We don't
          yet publish historical uptime — what you see below reflects this moment, not a rolling average.
        </p>

        <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/60 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[hsl(var(--glass-border))]">
            <div className="flex items-center gap-2.5">
              {loading ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : overallMeta ? (
                <overallMeta.Icon className={`w-5 h-5 ${overallMeta.color}`} />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium text-foreground">
                {loading ? 'Checking…' : error ? 'Unable to check status' : overallMeta?.label}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <p className="px-6 py-4 text-sm text-red-400">{error}</p>
          )}

          {data && (
            <div className="divide-y divide-[hsl(var(--glass-border))]">
              {Object.entries(data.checks).map(([key, check]) => {
                const meta = STATUS_META[check.status];
                return (
                  <div key={key} className="flex items-center justify-between gap-3 px-6 py-3.5">
                    <span className="text-sm text-foreground">{CHECK_LABEL[key] ?? key}</span>
                    <div className="flex items-center gap-2">
                      {typeof check.latencyMs === 'number' && (
                        <span className="text-xs text-muted-foreground tabular-nums">{check.latencyMs}ms</span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.color}`}>
                        <meta.Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {data && (
          <p className="text-xs text-muted-foreground/60 mt-4">
            Last checked {new Date(data.timestamp).toLocaleString()}
          </p>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed mt-10">
          Found a problem this page doesn't show? <a href="mailto:contact.presora@gmail.com" className="text-primary hover:underline">Let us know</a>.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Status;
