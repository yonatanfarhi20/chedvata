'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PhoneDepositSummaryBar from '@/components/admin/phones/PhoneDepositSummaryBar';
import StudentDepositCard from '@/components/admin/phones/StudentDepositCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import Toast from '@/components/ui/Toast';
import {
  getPhoneDepositSummary,
  getPhoneStudentId,
  matchesPhoneStudentSearch,
} from '@/lib/admin/phones';
import { getPhoneDepositStatus, togglePhoneDeposit } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

export default function PhoneDeposits() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', variant: 'error' });
  const loadRequestIdRef = useRef(0);
  const toggleRequestIdRef = useRef(new Map());

  const loadStatus = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getPhoneDepositStatus();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setStudents(Array.isArray(data?.students) ? data.students : []);
      setIsPastDeadline(Boolean(data?.isPastDeadline));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setStudents([]);
      setIsPastDeadline(false);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את סטטוס הפקדת הטלפונים.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStatus();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadStatus]);

  const summary = useMemo(() => getPhoneDepositSummary(students), [students]);

  const filteredStudents = useMemo(
    () => students.filter((student) => matchesPhoneStudentSearch(student, searchQuery)),
    [students, searchQuery],
  );

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'error' });
  }

  function updateStudent(studentId, updater) {
    setStudents((current) =>
      current.map((item) => (getPhoneStudentId(item) === studentId ? updater(item) : item)),
    );
  }

  async function handleToggle(student) {
    const studentId = getPhoneStudentId(student);

    if (!studentId) {
      return;
    }

    const previous = student;
    const nextDeposited = !student.isDeposited;
    const requestId = (toggleRequestIdRef.current.get(studentId) || 0) + 1;
    toggleRequestIdRef.current.set(studentId, requestId);

    updateStudent(studentId, (item) => ({
      ...item,
      isDeposited: nextDeposited,
      depositTime: nextDeposited ? new Date().toISOString() : null,
      isAlertRequired: nextDeposited ? false : isPastDeadline,
    }));

    try {
      const data = await togglePhoneDeposit({
        studentId,
        isDeposited: nextDeposited,
      });

      if (toggleRequestIdRef.current.get(studentId) !== requestId) {
        return;
      }

      if (data?.student) {
        updateStudent(studentId, (item) => ({ ...item, ...data.student }));
      }
    } catch (error) {
      if (toggleRequestIdRef.current.get(studentId) !== requestId) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      updateStudent(studentId, () => previous);
      setToast({
        open: true,
        message: getErrorMessage(error, 'עדכון סטטוס ההפקדה נכשל. נסו שוב.'),
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-4 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">הפקדת טלפונים</h1>
          <p className="mt-1 text-sm text-muted">
            מעקב יומי אחר הפקדת המכשירים. סמנו תלמידים שהפקידו, ושימו לב לחריגים שעברה שעת היעד.
          </p>
        </header>

        <div className="shrink-0">
          <PhoneDepositSummaryBar
            total={summary.total}
            deposited={summary.deposited}
            alerts={summary.alerts}
          />
        </div>

        <div className="my-4 shrink-0 sm:max-w-sm">
          <TextField
            id="phone-deposits-search"
            name="phoneDepositsSearch"
            label="חיפוש תלמיד"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            autoComplete="off"
          />
        </div>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadStatus}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? <p className="text-sm text-muted">טוען סטטוס הפקדות...</p> : null}

          {!isLoading && !loadError && filteredStudents.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
              {students.length === 0
                ? 'אין תלמידים פעילים להצגה במערכת.'
                : 'לא נמצאו תלמידים התואמים לחיפוש.'}
            </p>
          ) : null}

          {!isLoading && !loadError && filteredStudents.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredStudents.map((student) => {
                const studentId = getPhoneStudentId(student);

                return (
                  <li key={studentId}>
                    <StudentDepositCard student={student} onToggle={handleToggle} />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
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
