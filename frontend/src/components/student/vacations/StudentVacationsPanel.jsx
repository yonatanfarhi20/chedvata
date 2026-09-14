'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import VacationRequestModal from '@/components/student/vacations/VacationRequestModal';
import VacationStatsCards from '@/components/student/vacations/VacationStatsCards';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
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
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

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

  function handleRequestSuccess(message) {
    setToast({ open: true, message, variant: 'success' });
    loadRequests({ silent: true });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">בקשת חופשה</h1>
            <p className="mt-1 text-sm text-muted">
              צפייה במכסת החופשות השנתית והגשת בקשות במסגרת הימים שנותרו.
            </p>
          </div>
          <Button
            type="button"
            fullWidth={false}
            onClick={() => setIsRequestOpen(true)}
            disabled={isLoading}
            className="sm:w-auto"
          >
            הגש בקשה חדשה
          </Button>
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

      <VacationRequestModal
        open={isRequestOpen}
        remainingDays={stats.remainingDays}
        onClose={() => setIsRequestOpen(false)}
        onSuccess={handleRequestSuccess}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ open: false, message: '', variant: 'success' })}
      />
    </div>
  );
}
