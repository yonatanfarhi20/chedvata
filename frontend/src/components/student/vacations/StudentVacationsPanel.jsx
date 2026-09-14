'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VacationRequestModal from '@/components/student/vacations/VacationRequestModal';
import VacationRequestsTable from '@/components/student/vacations/VacationRequestsTable';
import VacationStatsCards from '@/components/student/vacations/VacationStatsCards';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { getMyVacationRequests } from '@/lib/api/vacations';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import {
  VACATION_TAB,
  filterVacationsByTab,
  getVacationList,
  getVacationStats,
} from '@/lib/student/vacations';

const VACATION_TABS = [
  { id: VACATION_TAB.PENDING, label: 'ממתינות', emptyMessage: 'אין בקשות ממתינות לאישור.' },
  { id: VACATION_TAB.UPCOMING, label: 'מאושרות עתידיות', emptyMessage: 'אין חופשות מאושרות עתידיות.' },
  { id: VACATION_TAB.HISTORY, label: 'היסטוריה', emptyMessage: 'אין היסטוריית חופשות להצגה.' },
];

const EMPTY_STATS = {
  year: null,
  annualQuota: 0,
  usedDays: 0,
  remainingDays: 0,
};

export default function StudentVacationsPanel() {
  const loadRequestIdRef = useRef(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [vacations, setVacations] = useState([]);
  const [activeTab, setActiveTab] = useState(VACATION_TAB.PENDING);
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
      setVacations(getVacationList(data));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setStats(EMPTY_STATS);
      setVacations([]);
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

  const visibleVacations = useMemo(
    () => filterVacationsByTab(vacations, activeTab),
    [activeTab, vacations],
  );
  const activeTabMeta = VACATION_TABS.find((tab) => tab.id === activeTab) || VACATION_TABS[0];

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
          <>
            <VacationStatsCards stats={stats} />

            <div
              className="mt-8 mb-4 flex shrink-0 gap-2 border-b border-border"
              role="tablist"
              aria-label="בקשות חופשה"
            >
              {VACATION_TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                const count = filterVacationsByTab(vacations, tab.id).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`vacation-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`vacation-panel-${tab.id}`}
                    className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border border-b-0 border-border bg-card text-foreground'
                        : 'text-muted hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            <div
              id={`vacation-panel-${activeTabMeta.id}`}
              role="tabpanel"
              aria-labelledby={`vacation-tab-${activeTabMeta.id}`}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <VacationRequestsTable
                vacations={visibleVacations}
                emptyMessage={activeTabMeta.emptyMessage}
              />
            </div>
          </>
        )}
      </section>

      <VacationRequestModal
        open={isRequestOpen}
        remainingDays={stats.remainingDays}
        vacations={vacations}
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
