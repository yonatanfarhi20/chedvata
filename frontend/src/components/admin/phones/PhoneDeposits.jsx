'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PhoneDepositSummaryBar from '@/components/admin/phones/PhoneDepositSummaryBar';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import {
  getPhoneDepositSummary,
  getPhoneStudentId,
  matchesPhoneStudentSearch,
} from '@/lib/admin/phones';
import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';
import { getPhoneDepositStatus } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

export default function PhoneDeposits() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

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
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setStudents([]);
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
                  <li
                    key={studentId}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <p className="font-semibold text-foreground">{getUserFullName(student)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatClassAffiliation(student.classId)}
                    </p>
                    <p
                      className={`mt-3 text-sm font-medium ${
                        student.isDeposited ? 'text-success' : 'text-muted'
                      }`}
                    >
                      {student.isDeposited ? 'הופקד' : 'לא הופקד'}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
