'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminVacationsTable from '@/components/admin/leaves/AdminVacationsTable';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
  VACATION_STATUS,
  getApprovedVacations,
  getPendingVacations,
  getVacationId,
} from '@/lib/admin/leaves';
import { getAdminVacations, updateVacationStatus } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';

function LeavesManagementContent() {
  const loadRequestIdRef = useRef(0);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyVacationId, setBusyVacationId] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

  const applyData = useCallback((data) => {
    setPending(getPendingVacations(data));
    setApproved(getApprovedVacations(data));
  }, []);

  const loadVacations = useCallback(async ({ silent = false } = {}) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (!silent) {
      setIsLoading(true);
    }

    setLoadError('');

    try {
      const data = await getAdminVacations();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      applyData(data);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      applyData({});
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את בקשות החופשה.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [applyData]);

  useEffect(() => {
    loadVacations();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadVacations]);

  async function handleStatusChange(vacation, status) {
    const vacationId = getVacationId(vacation);

    if (!vacationId || busyVacationId) {
      return;
    }

    setBusyVacationId(vacationId);

    try {
      const data = await updateVacationStatus(vacationId, status);
      await loadVacations({ silent: true });
      setToast({
        open: true,
        message: data?.message || 'סטטוס החופשה עודכן בהצלחה',
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setToast({
        open: true,
        message: getErrorMessage(error, 'עדכון סטטוס החופשה נכשל. נסו שוב.'),
        variant: 'error',
      });
    } finally {
      setBusyVacationId('');
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">חופשות</h1>
          <p className="mt-1 text-sm text-muted">
            אישור ודחייה של בקשות תלמידים ומעקב אחר חופשות מאושרות.
          </p>
        </header>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={() => loadVacations()}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted">טוען את בקשות החופשה...</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto">
            <section>
              <h2 className="mb-3 text-base font-semibold text-foreground">
                ממתינות לאישור ({pending.length})
              </h2>
              <AdminVacationsTable
                vacations={pending}
                emptyMessage="אין בקשות ממתינות לאישור."
                showActions
                busyVacationId={busyVacationId}
                onApprove={(vacation) => handleStatusChange(vacation, VACATION_STATUS.APPROVED)}
                onReject={(vacation) => handleStatusChange(vacation, VACATION_STATUS.REJECTED)}
              />
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-foreground">
                חופשות מאושרות ({approved.length})
              </h2>
              <AdminVacationsTable
                vacations={approved}
                emptyMessage="אין חופשות מאושרות במערכת."
              />
            </section>
          </div>
        )}
      </section>

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ open: false, message: '', variant: 'success' })}
      />
    </div>
  );
}

export default function LeavesManagementPanel() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <LeavesManagementContent />
    </RequireAuth>
  );
}
