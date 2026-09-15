'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ManagementDashboardSkeleton from '@/components/admin/dashboard/ManagementDashboardSkeleton';
import VacationsTodayWidget from '@/components/admin/dashboard/VacationsTodayWidget';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getVacationsToday, EMPTY_VACATIONS_TODAY } from '@/lib/admin/managementDashboard';
import { getDailyVacations } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

function ManagementDashboardView() {
  const user = useSession()?.user;
  const [vacations, setVacations] = useState(EMPTY_VACATIONS_TODAY);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getDailyVacations();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setVacations(getVacationsToday(data));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setVacations(EMPTY_VACATIONS_TODAY);
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

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">לוח בקרה</h1>
          <p className="mt-1 text-sm text-muted">
            {user?.firstName
              ? `שלום ${user.firstName}, כאן מוצגת תמונת מצב כלל-ישיבתית של חופשות ונוכחות.`
              : 'תמונת מצב כלל-ישיבתית של חופשות ונוכחות.'}
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

        {isLoading ? <ManagementDashboardSkeleton /> : null}

        {!isLoading && !loadError ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <VacationsTodayWidget stats={vacations} />

            <section className="min-h-[320px] rounded-2xl border border-dashed border-border bg-card p-5 shadow-sm lg:col-span-3">
              <h2 className="text-base font-semibold text-foreground">נוכחות תפילות</h2>
              <p className="mt-1 text-sm text-muted">גרף קווי לפי שבוע, חודש ושנה.</p>
            </section>

            <section className="min-h-[320px] rounded-2xl border border-dashed border-border bg-card p-5 shadow-sm lg:col-span-3">
              <h2 className="text-base font-semibold text-foreground">נוכחות שיעורים</h2>
              <p className="mt-1 text-sm text-muted">גרף קווי לכלל השיעורים בישיבה.</p>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <ManagementDashboardView />
    </RequireAuth>
  );
}
