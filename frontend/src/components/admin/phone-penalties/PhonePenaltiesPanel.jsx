'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DepositedList from '@/components/admin/phone-penalties/DepositedList';
import PendingDepositList from '@/components/admin/phone-penalties/PendingDepositList';
import ReadyForReturnList from '@/components/admin/phone-penalties/ReadyForReturnList';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
  PHONE_DEPOSIT_STATUS,
  PHONE_PENALTY_TABS,
  getPhonePenaltyStudentId,
} from '@/lib/admin/phonePenalties';
import {
  confirmPhonePenaltyDeposit,
  confirmPhonePenaltyReturn,
  getPhonePenaltyQueues,
} from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';

function PhonePenaltiesContent() {
  const loadRequestIdRef = useRef(0);
  const [activeTab, setActiveTab] = useState(PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT);
  const [pendingDeposit, setPendingDeposit] = useState([]);
  const [deposited, setDeposited] = useState([]);
  const [readyForReturn, setReadyForReturn] = useState([]);
  const [busyStudentId, setBusyStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

  const applyQueues = useCallback((data) => {
    setPendingDeposit(Array.isArray(data?.pendingDeposit) ? data.pendingDeposit : []);
    setDeposited(Array.isArray(data?.deposited) ? data.deposited : []);
    setReadyForReturn(Array.isArray(data?.readyForReturn) ? data.readyForReturn : []);
  }, []);

  const loadQueues = useCallback(async ({ silent = false } = {}) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (!silent) {
      setIsLoading(true);
    }

    setLoadError('');

    try {
      const data = await getPhonePenaltyQueues();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      applyQueues(data);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      applyQueues({});
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את רשימות הפקדת הטלפונים.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [applyQueues]);

  useEffect(() => {
    loadQueues();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadQueues]);

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  async function handleStatusAction(student, action) {
    const studentId = getPhonePenaltyStudentId(student);

    if (!studentId || busyStudentId) {
      return;
    }

    setBusyStudentId(studentId);

    try {
      const data = await action(studentId);
      await loadQueues({ silent: true });
      setToast({
        open: true,
        message: data?.message || 'הסטטוס עודכן בהצלחה',
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setToast({
        open: true,
        message: getErrorMessage(error, 'עדכון סטטוס ההפקדה נכשל. נסו שוב.'),
        variant: 'error',
      });
    } finally {
      setBusyStudentId('');
    }
  }

  const tabCounts = {
    [PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT]: pendingDeposit.length,
    [PHONE_DEPOSIT_STATUS.DEPOSITED]: deposited.length,
    [PHONE_DEPOSIT_STATUS.READY_FOR_RETURN]: readyForReturn.length,
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">ניהול הפקדת טלפונים</h1>
          <p className="mt-1 text-sm text-muted">
            מעקב אחר תלמידים שחייבים בהפקדת מכשיר בעקבות חריגה מכללי הנוכחות בתפילות.
          </p>
        </header>

        <div
          className="mb-4 flex shrink-0 gap-2 border-b border-border"
          role="tablist"
          aria-label="רשימות הפקדת טלפונים"
        >
          {PHONE_PENALTY_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`phone-penalty-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`phone-penalty-panel-${tab.id}`}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border border-b-0 border-border bg-card text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tabCounts[tab.id]})
              </button>
            );
          })}
        </div>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadQueues}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {PHONE_PENALTY_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <div
              key={tab.id}
              id={`phone-penalty-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`phone-penalty-tab-${tab.id}`}
              hidden={!isActive}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {isActive && isLoading ? (
                <p className="text-sm text-muted">טוען את רשימות ההפקדה...</p>
              ) : null}

              {isActive && !isLoading && !loadError && tab.id === PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT ? (
                <PendingDepositList
                  students={pendingDeposit}
                  busyStudentId={busyStudentId}
                  onConfirmDeposit={(student) =>
                    handleStatusAction(student, confirmPhonePenaltyDeposit)
                  }
                />
              ) : null}

              {isActive && !isLoading && !loadError && tab.id === PHONE_DEPOSIT_STATUS.DEPOSITED ? (
                <DepositedList students={deposited} />
              ) : null}

              {isActive && !isLoading && !loadError && tab.id === PHONE_DEPOSIT_STATUS.READY_FOR_RETURN ? (
                <ReadyForReturnList
                  students={readyForReturn}
                  busyStudentId={busyStudentId}
                  onConfirmReturn={(student) =>
                    handleStatusAction(student, confirmPhonePenaltyReturn)
                  }
                />
              ) : null}
            </div>
          );
        })}
      </section>

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
    </div>
  );
}

export default function PhonePenaltiesPanel() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <PhonePenaltiesContent />
    </RequireAuth>
  );
}
