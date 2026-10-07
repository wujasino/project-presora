import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/locale';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SentimentChartProps {
  data: { date: string; score: number }[];
}

export const SentimentChart = memo(function SentimentChart({ data }: SentimentChartProps) {
  const { t } = useTranslation();

  /* Auto-fit Y axis with 10pt padding so the line fills the chart */
  const [yMin, yMax] = useMemo(() => {
    if (!data?.length) return [0, 100];
    const scores = data.map(d => d.score);
    const min = Math.floor(Math.min(...scores));
    const max = Math.ceil(Math.max(...scores));
    const pad = Math.max(5, Math.round((max - min) * 0.2));
    return [Math.max(0, min - pad), Math.min(100, max + pad)];
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-8"
    >
      <h3 className="text-sm font-medium mb-6 text-muted-foreground">{t('sentiment_trend')}</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B79F6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8B79F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(240, 5%, 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: 'hsl(240, 5%, 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 4%, 14%)',
                border: '1px solid rgba(139,121,246,0.2)',
                borderRadius: '8px',
                color: 'hsl(240, 5%, 96%)',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#8B79F6"
              strokeWidth={2}
              fill="url(#violetGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});
