import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/lib/locale';
import { SourceResult } from '@/types/analysis';

interface SourceTableProps {
  sources: SourceResult[];
}

const sentimentClass = (sentiment: string) =>
  sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
  sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' :
  'bg-muted text-muted-foreground';

/**
 * The evidence behind every score above — what each model actually said
 * about the brand. This is the landing page's single strongest claim
 * ("raw model answers behind every metric", the one row competitors don't
 * have a checkmark for), so it can't read as a generic locked data table
 * buried at the bottom of the page.
 *
 * A plain <table> hid the association column entirely on mobile
 * (`hidden sm:table-cell`) — exactly the column that carries the quote,
 * gone on the one surface most people open a shared link on. Stacked cards
 * below `sm` keep every field visible instead of hiding one.
 */
export const SourceTable = ({ sources }: SourceTableProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 pb-0 sm:p-6 sm:pb-0 flex items-start gap-2">
        <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">What each model actually said</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The raw evidence behind the score above — not just a number, the actual answer.
          </p>
        </div>
      </div>

      {/* Stacked cards on mobile — nothing hidden */}
      <div className="sm:hidden divide-y divide-[hsl(45,100%,50%,0.05)] mt-4">
        {sources.map((row) => (
          <div key={row.model} className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-data text-primary text-sm">{row.model}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-xs ${sentimentClass(row.sentiment)}`}>
                  {t(`sentiment_${String(row.sentiment || '').toLowerCase()}`) || row.sentiment}
                </span>
                <span className="text-xs font-data text-muted-foreground">{row.confidence}%</span>
              </div>
            </div>
            {row.association && (
              <p className="text-sm text-foreground/80 leading-relaxed">{row.association}</p>
            )}
          </div>
        ))}
      </div>

      {/* Table from sm up */}
      <table className="hidden sm:table w-full text-left text-sm mt-4">
        <thead>
          <tr className="border-b border-[hsl(45,100%,50%,0.05)]">
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('table_source_model')}</th>
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('table_perception')}</th>
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('table_top_association')}</th>
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">{t('table_confidence')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(45,100%,50%,0.05)]">
          {sources.map((row) => (
            <tr key={row.model} className="transition-colors hover:bg-surface-hover/30">
              <td className="p-4 font-data text-primary">{row.model}</td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-xs ${sentimentClass(row.sentiment)}`}>
                  {t(`sentiment_${String(row.sentiment || '').toLowerCase()}`) || row.sentiment}
                </span>
              </td>
              <td className="p-4 text-muted-foreground">{row.association}</td>
              <td className="p-4 text-right font-data">{row.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
