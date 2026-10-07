import { Presentation, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AgencyReportCalloutProps {
  resultId?: string;
  canCreateAudit: boolean;
}

/**
 * The "Client audit" toolbar button (top of this page) already builds the
 * white-labelled, client-ready report — this isn't a second implementation
 * of it, just a visible pointer to it down here among the other per-scan
 * cards, since that button is easy to miss above the fold.
 */
export const AgencyReportCallout = ({ resultId, canCreateAudit }: AgencyReportCalloutProps) => {
  const navigate = useNavigate();
  if (!resultId) return null;

  return (
    <div className="glass-card p-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Presentation className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Agency reports</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {canCreateAudit
              ? 'This scan can be sent as a white-labelled, client-ready PDF — your branding, no mention of Presora.'
              : 'White-labelled, client-ready PDF reports are an Agency-plan feature.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(canCreateAudit ? `/audit/${resultId}` : '/pricing')}
        className="inline-flex items-center gap-1.5 bg-card/40 backdrop-blur-xl border border-[hsl(var(--glass-border))] text-foreground px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-card/60 transition-colors shrink-0"
      >
        {canCreateAudit ? <Presentation className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
        <span className="text-xs">{canCreateAudit ? 'Open client audit' : 'See Agency plan'}</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export default AgencyReportCallout;
