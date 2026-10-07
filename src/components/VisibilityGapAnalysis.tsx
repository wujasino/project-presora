import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import { bandOf, BAND_LABEL, BAND_STYLE } from '@/lib/dimensionBands';
import { useTranslation } from '@/lib/locale';
import { cn } from '@/lib/utils';

type DimKey = keyof AnalysisResult['dimensions'];

const DIM_ORDER: DimKey[] = ['authority', 'sentiment', 'accuracy', 'mentions', 'recency'];

/** Same "Strong" floor ResultsBreakdown/HomeHub/AuditReport all use (>=90) —
 *  the gap is measured against that, not an arbitrary round number. */
const TARGET = 90;

const normalize = (v: number) => {
  if (typeof v !== 'number' || isNaN(v)) return 50;
  const num = v <= 1 ? v * 100 : v;
  return Math.round(Math.max(0, Math.min(100, num)));
};

interface VisibilityGapAnalysisProps {
  result: AnalysisResult;
}

/**
 * ResultsBreakdown's Action Plan already tells you *what to do* about the
 * weakest dimensions in plain English. This answers a different, more
 * literal question — "how far, in points, is each dimension from Strong" —
 * ranked so the biggest gap sorts first. Same five real scores, same bands,
 * just read as a distance instead of a verdict.
 */
export const VisibilityGapAnalysis = ({ result }: VisibilityGapAnalysisProps) => {
  const { t } = useTranslation();

  const gaps = useMemo(() => {
    return DIM_ORDER
      .map(dim => {
        const score = normalize(result.dimensions[dim]);
        return { dim, score, gap: Math.max(0, TARGET - score) };
      })
      .sort((a, b) => b.gap - a.gap);
  }, [result.dimensions]);

  const totalGap = gaps.reduce((acc, g) => acc + g.gap, 0);

  if (totalGap === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Visibility gap analysis</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Every dimension is already at or above {TARGET}% — no gap to close right now.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Visibility gap analysis</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Distance from each dimension's current score to a {TARGET}% "Strong" benchmark, largest gap first.
      </p>

      <div className="space-y-2.5">
        {gaps.map((g, i) => {
          const band = bandOf(g.score);
          const style = BAND_STYLE[band];
          return (
            <motion.div
              key={g.dim}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-medium text-foreground w-20 shrink-0 truncate">{t(`dim_${g.dim}`)}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden relative">
                <div
                  className={cn('h-full rounded-full', style.meter)}
                  style={{ width: `${g.score}%` }}
                />
                {g.gap > 0 && (
                  <div
                    className="absolute inset-y-0 rounded-full border border-dashed border-muted-foreground/40"
                    style={{ left: `${g.score}%`, right: 0 }}
                  />
                )}
              </div>
              <span className={cn('text-xs font-data tabular-nums w-16 shrink-0 text-right', g.gap > 0 ? style.text : 'text-muted-foreground')}>
                {g.gap > 0 ? `-${g.gap} pts` : BAND_LABEL[band]}
              </span>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/70 leading-relaxed mt-4 pt-4 border-t border-border">
        Points needed to reach {TARGET}%, computed directly from this scan's five dimension scores — not a
        prediction of how fast that gap can close.
      </p>
    </div>
  );
};

export default VisibilityGapAnalysis;
