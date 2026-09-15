'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ClassAttendanceChart from '@/components/rabbi/dashboard/ClassAttendanceChart';
import PeriodToggle from '@/components/rabbi/dashboard/PeriodToggle';
import RabbiDashboardSkeleton from '@/components/rabbi/dashboard/RabbiDashboardSkeleton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getRabbiDashboard } from '@/lib/api/rabbi';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { useSession } from '@/lib/auth/session';
import {
  DASHBOARD_PERIOD,
  EMPTY_CLASS_ATTENDANCE,
  formatAttendancePercent,
  getClassAttendanceOverview,
} from '@/lib/rabbi/dashboard';

export default function RabbiDashboard() {
  const user = useSession()?.user;
  const [period, setPeriod] = useState(DASHBOARD_PERIOD.WEEK);
  const [overview, setOverview] = useState(EMPTY_CLASS_ATTENDANCE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  const loadDashboard = useCallback(async (selectedPeriod) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getRabbiDashboard(selectedPeriod);

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setOverview(getClassAttendanceOverview(data));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setOverview(EMPTY_CLASS_ATTENDANCE);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נוכחות הכיתה.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard(period);

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadDashboard, period]);

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">לוח בקרה</h1>
          <p className="mt-1 text-sm text-muted">
            {user?.firstName
              ? `שלום ${user.firstName}, כאן מוצגת נוכחות השיעורים של הכיתה.`
              : 'תמונת מצב של נוכחות השיעורים בכיתה.'}
          </p>
        </header>

        {loadError ? (
          <div className="mb-4 flex flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={() => loadDashboard(period)}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {isLoading && !overview.from ? <RabbiDashboardSkeleton /> : null}

        {overview.from && !loadError ? (
          <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">נוכחות הכיתה</h2>
                <p className="mt-1 text-sm text-muted">
                  אחוז הנוכחות בשיעורים
                  {overview.title ? ` · ${overview.title}` : ''}
                  {overview.averagePercent != null
                    ? ` · ממוצע התקופה ${formatAttendancePercent(overview.averagePercent)}`
                    : ''}
                </p>
              </div>
              <PeriodToggle value={period} onChange={setPeriod} disabled={isLoading} />
            </header>
            {isLoading ? (
              <div className="h-[320px] animate-pulse rounded-xl bg-border" aria-hidden="true" />
            ) : (
              <ClassAttendanceChart points={overview.points} period={overview.period} />
            )}
          </section>
        ) : null}
      </section>
    </div>
  );
}
