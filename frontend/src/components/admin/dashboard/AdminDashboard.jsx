'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AlertListSkeleton from '@/components/admin/dashboard/AlertListSkeleton';
import KPICard from '@/components/admin/dashboard/KPICard';
import KPICardSkeleton from '@/components/admin/dashboard/KPICardSkeleton';
import LeavesTodayList from '@/components/admin/dashboard/LeavesTodayList';
import OpenTasksList from '@/components/admin/dashboard/OpenTasksList';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
  formatDashboardDate,
  getDashboardAlerts,
  getDashboardKpiCards,
  getStudentsOnLeaveToday,
} from '@/lib/admin/dashboard';
import { getDashboard } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

const KPI_SKELETON_COUNT = 4;

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getDashboard();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setOverview(data && typeof data === 'object' ? data : null);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setOverview(null);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נתוני לוח הבקרה.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadDashboard]);

  const cards = getDashboardKpiCards(overview);
  const alerts = getDashboardAlerts(overview);
  const studentsOnLeave = getStudentsOnLeaveToday(overview);
  const formattedDate = formatDashboardDate(overview?.date);

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">לוח בקרה</h1>
          <p className="mt-1 text-sm text-muted">
            {formattedDate
              ? `תמונת מצב יומית ל${formattedDate}.`
              : 'תמונת מצב יומית לקבלת החלטות מהירה.'}
          </p>
        </header>

        {loadError ? (
          <div className="mb-4 flex flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadDashboard}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: KPI_SKELETON_COUNT }, (_, index) => (
                <KPICardSkeleton key={index} />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <AlertListSkeleton rows={3} />
              </div>
              <AlertListSkeleton rows={4} />
            </div>
          </>
        ) : null}

        {!isLoading && !loadError ? (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <KPICard
                  key={card.id}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  tone={card.tone}
                  hint={card.hint}
                />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <OpenTasksList alerts={alerts} />
              </div>
              <LeavesTodayList
                students={studentsOnLeave}
                count={Number(overview?.leaves?.count) || 0}
              />
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
