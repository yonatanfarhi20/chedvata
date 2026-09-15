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
      {point.counted > 0 ? (
        <p className="mt-1 text-xs text-muted">
          נוכחים {point.present} · מאחרים {point.late} · חסרים {point.absent}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">אין דיווח ליום זה</p>
      )}
    </div>
  );
}

export default function ClassAttendanceChart({ points, period }) {
  const data = getChartPoints(points);
  const hasReportedPoints = data.some((point) => point.percentage != null);
  const isDense = period === DASHBOARD_PERIOD.MONTH;

  if (!hasReportedPoints) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-4 py-8 text-center">
        <p className="text-sm text-muted">אין דיווחי נוכחות בטווח שנבחר.</p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 20, left: 12, bottom: isDense ? 32 : 16 }}>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#57534e', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            interval={isDense ? 1 : 0}
            minTickGap={isDense ? 8 : 12}
            angle={isDense ? -35 : 0}
            textAnchor={isDense ? 'end' : 'middle'}
            height={isDense ? 50 : 30}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: '#57534e', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<AttendanceTooltip />} />
          <Line
            type="monotone"
            dataKey="percentage"
            name="נוכחות"
            stroke={LINE_COLOR}
            strokeWidth={2.5}
            dot={{ r: 4, fill: LINE_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: LINE_COLOR, strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
