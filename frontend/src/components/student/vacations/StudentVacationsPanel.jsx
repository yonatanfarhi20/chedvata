'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import VacationStatsCards from '@/components/student/vacations/VacationStatsCards';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getMyVacationRequests } from '@/lib/api/vacations';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { getVacationStats } from '@/lib/student/vacations';

const EMPTY_STATS = {
  year: null,
  annualQuota: 0,
  usedDays: 0,
  remainingDays: 0,
};

export default function StudentVacationsPanel() {
  const loadRequestIdRef = useRef(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadRequests = useCallback(async ({ silent = false } = {}) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (!silent) {
      setIsLoading(true);
    }

    setLoadError('');

    try {
      const data = await getMyVacationRequests();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setStats(getVacationStats(data));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setStats(EMPTY_STATS);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נתוני החופשות.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadRequests();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadRequests]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">בקשת חופשה</h1>
          <p className="mt-1 text-sm text-muted">
            צפייה במכסת החופשות השנתית והגשת בקשות במסגרת הימים שנותרו.
          </p>
        </header>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={() => loadRequests()}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted">טוען את נתוני החופשות...</p>
        ) : (
          <VacationStatsCards stats={stats} />
        )}
      </section>
    </div>
  );
}
