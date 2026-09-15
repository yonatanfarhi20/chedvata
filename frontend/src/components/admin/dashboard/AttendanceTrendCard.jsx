import ClassAttendanceChart from '@/components/rabbi/dashboard/ClassAttendanceChart';
import PeriodToggle from '@/components/rabbi/dashboard/PeriodToggle';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { formatAttendancePercent } from '@/lib/rabbi/dashboard';

export default function AttendanceTrendCard({
  title,
  description,
  period,
  onPeriodChange,
  overview,
  isLoading = false,
  loadError = '',
  onRetry,
  periodAriaLabel,
}) {
  const averageLabel =
    overview?.averagePercent == null ? '' : ` · ממוצע התקופה ${formatAttendancePercent(overview.averagePercent)}`;
  const titleLabel = overview?.title ? ` · ${overview.title}` : '';

  return (
    <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
      <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            {description}
            {titleLabel}
            {averageLabel}
          </p>
        </div>
        <PeriodToggle
          value={period}
          onChange={onPeriodChange}
          disabled={isLoading}
          ariaLabel={periodAriaLabel}
        />
      </header>

      {loadError ? (
        <div className="mb-4 flex flex-col items-start gap-3">
          <Alert>{loadError}</Alert>
          {onRetry ? (
            <Button type="button" variant="secondary" fullWidth={false} onClick={onRetry}>
              נסה שוב
            </Button>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="h-[320px] animate-pulse rounded-xl bg-border" aria-hidden="true" />
      ) : loadError ? null : (
        <ClassAttendanceChart points={overview?.points} period={overview?.period || period} />
      )}
    </section>
  );
}
