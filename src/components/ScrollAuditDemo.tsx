import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
import { Search, Sparkles, BarChart3, ShieldCheck, Smile, Target, AtSign, Clock } from 'lucide-react';
import { bandOf, BAND_STYLE } from '@/lib/dimensionBands';
import { cn } from '@/lib/utils';

/**
 * Scroll-driven "watch an audit run" demo for the Landing page's "How it
 * works" section, replacing what used to be three static numbered circles.
 *
 * The scrub is the point: the progress bar and the three steps advance from
 * the reader's own scroll position, so the ~15s scan is *shown* happening
 * rather than described, and the three explanations arrive one at a time as
 * the eye travels down instead of landing as one wall of text.
 *
 * The sample figures below are the same Tesla-scored-78 numbers the rest of
 * the page already uses for its sample report (ScanResultPreview.tsx and the
 * hero's proof teaser), so a visitor comparing the two sees one consistent
 * example rather than two different invented ones. Labelled "Sample" in the
 * UI for the same reason the before/after figures elsewhere are.
 */

const STEPS = [
  {
    Icon: Search,
    title: 'Enter your brand',
    desc: 'Type a brand name or URL — any niche, any language.',
  },
  {
    Icon: Sparkles,
    title: 'We ask the AI',
    desc: 'ChatGPT, Claude, Gemini and others all get asked about you at the same time.',
  },
  {
    Icon: BarChart3,
    title: 'Get your score',
    desc: 'See your score out of 100, what each assistant said, and what to fix first.',
  },
] as const;

// Same dimension set/order as HomeHub, ScanResultPreview and GuestScanWidget.
const SAMPLE_DIMENSIONS = [
  { key: 'authority', label: 'Authority', value: 84, Icon: ShieldCheck },
  { key: 'recency', label: 'Recency', value: 88, Icon: Clock },
  { key: 'sentiment', label: 'Sentiment', value: 72, Icon: Smile },
  { key: 'accuracy', label: 'Accuracy', value: 66, Icon: Target },
  { key: 'mentions', label: 'Mentions', value: 61, Icon: AtSign },
] as const;

const SAMPLE_SCORE = 78;

/** One step card, lit as the scrub passes its slice of the timeline. */
const Step = ({
  step,
  index,
  progress,
  reduced,
}: {
  step: (typeof STEPS)[number];
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) => {
  // Each step owns a third of the first ~70% of the scrub; the tail is left
  // to the results card so it isn't still animating in as the reader arrives.
  const start = index * 0.22;
  const opacity = useTransform(progress, [start, start + 0.12], [0.35, 1]);
  const y = useTransform(progress, [start, start + 0.12], [12, 0]);
  const ringOpacity = useTransform(progress, [start, start + 0.12], [0, 1]);

  return (
    <motion.div
      style={reduced ? undefined : { opacity, y }}
      className="flex flex-col items-center text-center p-2 sm:p-4"
    >
      <div className="relative w-9 h-9 sm:w-14 sm:h-14 mb-2 sm:mb-3">
        <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center">
          <step.Icon className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
        </div>
        {/* Filled state fades in over the muted one — no layout shift. */}
        <motion.div
          style={reduced ? undefined : { opacity: ringOpacity }}
          className="absolute inset-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <step.Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </motion.div>
      </div>
      <div className="text-xs sm:text-base font-medium text-foreground">{step.title}</div>
      <div className="hidden sm:block text-xs text-muted-foreground mt-1">{step.desc}</div>
    </motion.div>
  );
};

/** One dimension meter, filling as the scrub enters the results phase. */
const DimensionRow = ({
  dim,
  index,
  progress,
  reduced,
}: {
  dim: (typeof SAMPLE_DIMENSIONS)[number];
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) => {
  const band = bandOf(dim.value);
  // Meters fill after the three steps have lit (0.66 onward), staggered so
  // they read as results arriving one by one rather than all at once.
  const start = 0.66 + index * 0.05;
  const width = useTransform(progress, [start, start + 0.14], ['0%', `${dim.value}%`]);
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-24 shrink-0">
        <dim.Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{dim.label}</span>
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', BAND_STYLE[band].meter)}
          style={reduced ? { width: `${dim.value}%` } : { width }}
        />
      </div>
      <motion.span
        style={reduced ? undefined : { opacity }}
        className={cn('w-9 text-right text-xs font-data font-semibold tabular-nums', BAND_STYLE[band].text)}
      >
        {dim.value}%
      </motion.span>
    </div>
  );
};

export const ScrollAuditDemo = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Scrub across the section's own travel through the viewport, so the demo
  // is driven entirely by scroll position and never by a timer the reader
  // can't control.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'end 0.55'],
  });

  const barWidth = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%']);
  const scoreOpacity = useTransform(scrollYProgress, [0.62, 0.74], [0, 1]);
  const scoreY = useTransform(scrollYProgress, [0.62, 0.74], [10, 0]);
  const doneOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);

  return (
    <div ref={sectionRef}>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {STEPS.map((step, idx) => (
          <Step key={step.title} step={step} index={idx} progress={scrollYProgress} reduced={reduced} />
        ))}
      </div>

      {/* Scan progress — the "~15 seconds" claim, shown rather than asserted */}
      <div className="mt-6 sm:mt-8 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Scanning</span>
          <motion.span style={reduced ? undefined : { opacity: doneOpacity }} className="text-emerald-600 dark:text-emerald-400">
            Complete
          </motion.span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={reduced ? { width: '100%' } : { width: barWidth }}
          />
        </div>
      </div>

      {/* Result card — emerges once the bar is most of the way across */}
      <motion.div
        style={reduced ? undefined : { opacity: scoreOpacity, y: scoreY }}
        className="mt-6 max-w-xl mx-auto rounded-2xl border border-[hsl(var(--glass-border))] bg-card/60 backdrop-blur-xl p-5 sm:p-6 text-left"
      >
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[hsl(var(--glass-border))]">
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Tesla</span> / AI visibility scan
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary border border-primary/20">
            Sample
          </span>
        </div>

        <div className="flex items-baseline gap-3 mb-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground shrink-0">AI Trust Score</div>
          <div className="flex items-baseline gap-1 font-display">
            <span className="text-4xl font-light text-primary tabular-nums">{SAMPLE_SCORE}</span>
            <span className="text-lg text-primary/60">%</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {SAMPLE_DIMENSIONS.map((dim, idx) => (
            <DimensionRow key={dim.key} dim={dim} index={idx} progress={scrollYProgress} reduced={reduced} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ScrollAuditDemo;
