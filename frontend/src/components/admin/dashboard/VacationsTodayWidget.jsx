import { LeavesKpiIcon } from '@/components/admin/dashboard/KPIIcons';
import { formatLeavePercentage } from '@/lib/admin/managementDashboard';

export default function VacationsTodayWidget({ stats }) {
  const onLeaveCount = stats?.onLeaveCount || 0;
  const activeStudentCount = stats?.activeStudentCount || 0;
  const percentageLabel = formatLeavePercentage(stats?.percentage);

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">חופשות היום</h2>
          <p className="mt-1 text-sm text-muted">סטטוס תלמידים בחופשה ביום הנוכחי.</p>
        </div>
        <div className="rounded-xl bg-background p-2 text-primary">
          <LeavesKpiIcon />
        </div>
      </header>

      <p className="mt-6 text-4xl font-bold tabular-nums text-foreground">{onLeaveCount}</p>
      <p className="mt-1 text-sm font-medium text-muted">
        {onLeaveCount === 1 ? 'תלמיד בחופשה' : 'תלמידים בחופשה'}
      </p>
      <p className="mt-4 text-sm text-muted">
        {activeStudentCount === 0
          ? 'אין תלמידים פעילים לחישוב אחוז.'
          : `${percentageLabel} מתוך ${activeStudentCount} תלמידים פעילים בישיבה.`}
      </p>
    </article>
  );
}
