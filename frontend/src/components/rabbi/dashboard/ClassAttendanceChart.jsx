import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DASHBOARD_PERIOD, formatAttendancePercent, getChartPoints } from '@/lib/rabbi/dashboard';

const LINE_COLOR = '#1e3a5f';
const GRID_COLOR = '#d6d3d1';

function AttendanceTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md" dir="rtl">
      <p className="font-semibold text-foreground">{point.label}</p>
      <p className="mt-1 text-muted">נוכחות: {formatAttendancePercent(point.percentage)}</p>
      <p className="mt-1 text-xs text-muted">
        נוכחים {point.present} · מאחרים {point.late} · חסרים {point.absent}
      </p>
    </div>
  );
}

export default function ClassAttendanceChart({ points, period }) {
  const data = getChartPoints(points, period);
  const isMonth = period === DASHBOARD_PERIOD.MONTH;
  const isYear = period === DASHBOARD_PERIOD.YEAR;

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-4 py-8 text-center sm:h-[320px]">
        <p className="text-sm text-muted">אין דיווחי נוכחות בטווח שנבחר.</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[320px]" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: isMonth ? 28 : 8 }}>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="tickLabel"
            tick={{ fill: '#57534e', fontSize: isYear ? 11 : 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            interval={isMonth ? 'preserveStartEnd' : 0}
            minTickGap={isMonth ? 8 : isYear ? 4 : 12}
            angle={isMonth ? -35 : 0}
            textAnchor={isMonth ? 'end' : 'middle'}
            height={isMonth ? 46 : 28}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: '#57534e', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<AttendanceTooltip />} />
          <Line
            type="linear"
            dataKey="percentage"
            name="נוכחות"
            stroke={LINE_COLOR}
            strokeWidth={2.5}
            dot={{ r: 4, fill: LINE_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: LINE_COLOR, strokeWidth: 0 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
