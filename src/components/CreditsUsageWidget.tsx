import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS, PLAN_LABELS, usePlan, useAnalysesUsedThisMonth, useSessionUser } from '@/hooks/useAccountInfo';

/**
 * Account status shown on the pricing control bar: a credit-usage meter and the
 * current plan with a billing shortcut. Renders nothing for signed-out visitors.
 */
export const CreditsUsageWidget = () => {
  const { data: sessionUser, isLoading: userLoading } = useSessionUser();
  const { data: plan = 'Free' } = usePlan();
  const { data: used = 0 } = useAnalysesUsedThisMonth();

  if (userLoading || !sessionUser?.email) return null;

  const limit = PLAN_LIMITS[plan] ?? 3;
  const unlimited = limit >= 9999;
  // Only meaningful when there's a ceiling to measure against. This used to
  // be forced to 100 for unlimited plans, which then tripped the >= 90 "red"
  // branch below — an unlimited plan rendered a full red bar, i.e. the
  // universal signal for "you're out of credits".
  const pct = unlimited ? null : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="w-full max-w-[280px] rounded-xl border border-[hsl(var(--glass-border))] bg-card/60 divide-y divide-[hsl(var(--glass-border))] text-xs">
      {/* Credit usage meter */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{unlimited ? 'Analyses this month' : 'Credits used'}</span>
          <span className="font-medium text-foreground font-data whitespace-nowrap">
            {unlimited ? `${used} · unlimited` : `${used} / ${limit} (${pct}%)`}
          </span>
        </div>
        {/* No progress bar on an unlimited plan — a bar against infinity has
            nothing to fill. */}
        {!unlimited && (
          <div className="h-1 rounded-full bg-muted overflow-hidden mt-1.5">
            <div
              className={cn('h-full rounded-full transition-[width]', (pct ?? 0) >= 90 ? 'bg-red-500' : 'bg-primary')}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Current plan + billing shortcut */}
      <Link
        to="/settings?tab=billing"
        className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors rounded-b-xl"
      >
        <span className="text-muted-foreground">
          Plan · <span className="text-foreground font-medium">{PLAN_LABELS[plan] ?? plan}</span>
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </Link>
    </div>
  );
};

export default CreditsUsageWidget;
