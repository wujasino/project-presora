import { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SourceDonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export const SourceDonutChart = memo(function SourceDonutChart({ data }: SourceDonutChartProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-8"
    >
      <h3 className="text-sm font-medium mb-6 text-muted-foreground">{t('source_breakdown')}</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 4%, 14%)',
                border: '1px solid rgba(139,121,246,0.2)',
                borderRadius: '8px',
                color: 'hsl(240, 5%, 96%)',
              }}
              formatter={(value: number) => [`${value}%`, t('share_label')]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {t(`source_${item.name.toLowerCase()}`) || item.name}
          </div>
        ))}
      </div>
    </motion.div>
  );
});
