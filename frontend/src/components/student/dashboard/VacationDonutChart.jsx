'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  VACATION_USAGE_TONE,
  getVacationUsageRatio,
  getVacationUsageTone,
} from '@/lib/student/dashboard';

const TONE_COLORS = {
  [VACATION_USAGE_TONE.SAFE]: '#15803d',
  [VACATION_USAGE_TONE.WARNING]: '#d97706',
  [VACATION_USAGE_TONE.DANGER]: '#dc2626',
};

const TRACK_COLOR = '#e7e5e4';

export default function VacationDonutChart({ stats }) {
  const annualQuota = Number(stats?.annualQuota) || 0;
  const usedDays = Number(stats?.usedDays) || 0;
  const remainingDays = Number(stats?.remainingDays) || 0;
  const usage = getVacationUsageRatio({ usedDays, annualQuota });
  const tone = getVacationUsageTone({ usedDays, annualQuota });
  const fillColor = TONE_COLORS[tone];
  const progressData = [
    { name: 'used', value: usage },
    { name: 'remaining', value: Math.max(0, 1 - usage) },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div
        className="relative h-52 w-52"
        role="img"
        aria-label={`נותרו ${remainingDays} ימי חופשה מתוך מכסה של ${annualQuota}. נוצלו ${usedDays} ימים.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ name: 'track', value: 1 }]}
              dataKey="value"
              innerRadius="68%"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
              stroke="none"
            >
              <Cell fill={TRACK_COLOR} />
            </Pie>
            <Pie
              data={progressData}
              dataKey="value"
              innerRadius="68%"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              stroke="none"
            >
              <Cell fill={fillColor} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-4xl font-bold tabular-nums text-foreground">{remainingDays}</p>
          <p className="mt-1 text-sm font-medium text-muted">ימים שנותרו</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        נוצלו {usedDays} מתוך {annualQuota}
        {stats?.year ? ` לשנת ${stats.year}` : ''}
      </p>
    </div>
  );
}
