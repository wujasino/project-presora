import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useSessionUser } from '@/hooks/useAccountInfo';
import { dedupeAnalyses } from '@/lib/analyses';

interface FlaggedReport {
  id: string;
  brand_name: string;
  trust_score: number;
  created_at: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * /action-plan — a single place to see every past scan that got an AI
 * remediation checklist (score < 60, same threshold as the red alert on
 * the results screen and generate-action-plan.js's trigger). Each row links
 * straight to that report, where AiActionPlan already renders the real
 * plan — this page doesn't regenerate or duplicate that content, it's just
 * an index over brands that need it.
 */
const ActionPlanHub = () => {
  const navigate = useNavigate();
  const { data: sessionUser, isLoading: userLoading } = useSessionUser();
  const userId = sessionUser?.id ?? null;
  const [reports, setReports] = useState<FlaggedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!userId) { navigate('/login'); return; }
    (async () => {
      const { data } = await supabase
        .from('analyses')
        .select('id, brand_name, trust_score, created_at')
        .eq('user_id', userId)
        .lt('trust_score', 60)
        .order('created_at', { ascending: false });
      setReports(dedupeAnalyses((data as FlaggedReport[]) ?? []));
      setLoading(false);
    })();
  }, [userId, userLoading, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">Action Plan</h1>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          Beta
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Every brand where AI models currently recommend your competitors instead of you — open a report to see its AI-generated remediation checklist.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
          <p className="text-sm font-medium text-foreground mb-1">No red flags right now</p>
          <p className="text-xs text-muted-foreground">
            Every scanned brand is currently above the low-visibility threshold. Nice.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.button
              key={r.id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              onClick={() => navigate(`/brand-visibility?id=${r.id}`)}
              className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 hover:bg-accent/50 px-4 py-3 text-left transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.brand_name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={cn('text-sm font-data font-semibold', 'text-red-600 dark:text-red-400')}>
                  {Math.round(r.trust_score)}%
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionPlanHub;
