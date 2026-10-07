import { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/locale';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import { AnalysisResult } from '@/types/analysis';

interface RadarChartCardProps {
  dimensions: AnalysisResult['dimensions'];
  timestamp?: string;
  brandName?: string;
  competitorDimensions?: AnalysisResult['dimensions'];
  competitorName?: string;
}

export const RadarChartCard = memo(function RadarChartCard({
  dimensions,
  timestamp,
  brandName,
  competitorDimensions,
  competitorName,
}: RadarChartCardProps) {
  // Normalize values to 0-100 and round. Accept either 0-1 or 0-100 inputs.
  const normalize = (v: number) => {
    if (typeof v !== 'number' || isNaN(v)) return 50;
    const num = v <= 1 ? v * 100 : v;
    return Math.round(Math.max(0, Math.min(100, num)));
  };

  const { t } = useTranslation();
  const hasCompetitor = !!competitorDimensions;

  const data = [
    { key: 'authority', subject: t('dim_authority'), value: normalize(dimensions.authority), competitor: competitorDimensions ? normalize(competitorDimensions.authority) : undefined },
    { key: 'sentiment', subject: t('dim_sentiment'), value: normalize(dimensions.sentiment), competitor: competitorDimensions ? normalize(competitorDimensions.sentiment) : undefined },
    { key: 'accuracy', subject: t('dim_accuracy'), value: normalize(dimensions.accuracy), competitor: competitorDimensions ? normalize(competitorDimensions.accuracy) : undefined },
    { key: 'mentions', subject: t('dim_mentions'), value: normalize(dimensions.mentions), competitor: competitorDimensions ? normalize(competitorDimensions.mentions) : undefined },
    { key: 'recency', subject: t('dim_recency'), value: normalize(dimensions.recency), competitor: competitorDimensions ? normalize(competitorDimensions.recency) : undefined },
  ];

  const metaBySubject: Record<string, { key: string; value: number }> = data.reduce((acc, d) => {
    acc[d.subject] = { key: d.key, value: d.value };
    return acc;
  }, {} as Record<string, { key: string; value: number }>);

  type TickProps = {
    x: number;
    y: number;
    cx?: number;
    cy?: number;
    payload?: { value: string };
  };

  const renderTick = ({ x, y, cx, cy, payload }: TickProps) => {
    const label = payload?.value ?? '';
    const meta = metaBySubject[label];
    const key = meta?.key;
    const val = meta?.value;

    let tx = x;
    let ty = y;
    if (typeof cx === 'number' && typeof cy === 'number') {
      const factor = 0.94;
      tx = cx + (x - cx) * factor;
      ty = cy + (y - cy) * factor;
    }

    if (key === 'sentiment') {
      tx += 8;
    }

    return (
      <text
        x={tx}
        y={ty}
        fill="#E6E6E6"
        fontSize={12}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontWeight: 500 }}
      >
        {label}{val !== undefined ? ` ${Math.round(val)}%` : ''}
      </text>
    );
  };

  const formattedDate = timestamp ? new Date(timestamp).toLocaleDateString() : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-4 sm:p-8 overflow-x-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('aiPerceptionDimensions')}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('radar_chart_description')}</p>
        </div>
        {hasCompetitor ? (
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#8B79F6' }} />
              <span className="text-foreground font-medium">{brandName || t('radar_you')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#60A5FA' }} />
              <span className="text-muted-foreground">{competitorName}</span>
            </span>
          </div>
        ) : formattedDate && (
          <span className="text-xs text-muted-foreground">{t('analysis_date_collected')} {formattedDate}</span>
        )}
      </div>
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="78%"
            data={data}
            margin={{ top: 10, right: 24, bottom: 10, left: 24 }}
          >
            <PolarGrid stroke="hsl(240, 4%, 22%)" />
            <PolarAngleAxis dataKey="subject" tick={renderTick} />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: 'hsl(240, 5%, 40%)', fontSize: 9 }}
              tickFormatter={(v: number) => v > 0 ? `${v}%` : ''}
              angle={90}
              stroke="transparent"
            />
            <Radar
              name={brandName || 'Score'}
              dataKey="value"
              stroke="#8B79F6"
              fill="#8B79F6"
              fillOpacity={hasCompetitor ? 0.28 : 0.34}
              strokeWidth={3}
              strokeOpacity={1}
              dot={{ r: 4, fill: '#8B79F6' }}
              style={{ filter: 'drop-shadow(0 8px 20px rgba(139,121,246,0.18))' }}
            />
            {hasCompetitor && (
              <Radar
                name={competitorName || 'Competitor'}
                dataKey="competitor"
                stroke="#60A5FA"
                fill="#60A5FA"
                fillOpacity={0.18}
                strokeWidth={2.5}
                strokeOpacity={1}
                dot={{ r: 3, fill: '#60A5FA' }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});
