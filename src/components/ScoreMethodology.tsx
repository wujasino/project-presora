import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { SourceResult } from '@/types/analysis';

interface ScoreMethodologyProps {
  sources: SourceResult[];
}

/**
 * Answers "how is this number calculated?" directly on the results screen.
 *
 * AuditReport (the exported client PDF) already has a "How this was
 * measured" section — this is the same explanation, condensed, for the live
 * in-app screen, where the question actually gets asked before anyone
 * exports anything. Collapsed by default (same pattern as
 * BrandKnowledgeForm's empty state) so it doesn't compete with the score
 * itself for space.
 */
export const ScoreMethodology = ({ sources }: ScoreMethodologyProps) => {
  const [expanded, setExpanded] = useState(false);
  const modelsQueried = (sources ?? []).map(s => s.model);

  return (
    <div className="rounded-xl border border-[hsl(var(--glass-border))] bg-muted/10 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/20 transition-colors text-left"
      >
        <Calculator className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground flex-1">How is this score calculated?</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 text-xs text-muted-foreground leading-relaxed border-t border-[hsl(var(--glass-border))]">
              <p className="pt-3">
                {modelsQueried.length > 0
                  ? <>Each model above — {modelsQueried.join(', ')} — was asked the same question about this brand, independently and at the same time. Every model rates it 0–100 on all 5 dimensions and gives its own overall score; nothing is copied between them.</>
                  : <>Each AI model queried is asked the same question about this brand, independently. Every model rates it 0–100 on all 5 dimensions and gives its own overall score; nothing is copied between them.</>}
              </p>
              <p>
                The score shown above is the <span className="text-foreground/80 font-medium">average</span> across every model that answered — for the overall score, and separately for each of the 5 dimensions. No single answer is dropped or weighted higher, so one unusual reply can't move the headline number on its own; it just pulls the average a little.
              </p>
              <p>
                Each row in the table above is one model's own answer, not the average — that's why the sentiment label (Positive / Neutral / Negative) can look inconsistent with the overall score: it's set per model (≥60 Positive, ≤40 Negative, in between Neutral) using that model's own rating, before any averaging happens.
              </p>
              <p>
                A model that doesn't recognise the brand still answers — usually with a low confidence and a cautious, low score — and that answer is averaged in like any other. When models disagree a lot, the average confidence banner above says so; treat a low-confidence score as a starting estimate, not a verdict.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
