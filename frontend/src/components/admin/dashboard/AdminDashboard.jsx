'use client';

import { useEffect, useRef, useState } from 'react';
import KPICard from '@/components/admin/dashboard/KPICard';
import LeavesTodayList from '@/components/admin/dashboard/LeavesTodayList';
import OpenTasksList from '@/components/admin/dashboard/OpenTasksList';
import Alert from '@/components/ui/Alert';
import {
  formatDashboardDate,
  getDashboardAlerts,
  getDashboardKpiCards,
  getStudentsOnLeaveToday,
} from '@/lib/admin/dashboard';
import { getDashboard } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    getDashboard()
      .then((data) => {
        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        setOverview(data && typeof data === 'object' ? data : null);
      })
      .catch((error) => {
        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          return;
        }

        setOverview(null);
        setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נתוני לוח הבקרה.'));
      })
      .finally(() => {
        if (requestId === loadRequestIdRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, []);

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
          <div className="mb-4">
            <Alert>{loadError}</Alert>
          </div>
        ) : null}

        {isLoading ? <p className="text-sm text-muted">טוען נתוני לוח בקרה...</p> : null}

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
