'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AttendanceFilters from '@/components/admin/attendance/AttendanceFilters';
import AttendanceSaveBar from '@/components/admin/attendance/AttendanceSaveBar';
import AttendanceTable from '@/components/admin/attendance/AttendanceTable';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
  ACTIVITY_TYPE,
  ATTENDANCE_STATUS,
  buildAttendanceStatusMap,
  getTodayDateInputValue,
} from '@/lib/admin/attendance';
import { getUserFullName } from '@/lib/admin/users';
import { getAttendance, getUsers, saveAttendance } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { USER_ROLE, USER_STATUS } from '@/lib/auth/constants';

function isActiveStudent(user) {
  return user?.role === USER_ROLE.STUDENT && user?.status === USER_STATUS.ACTIVE;
}

export default function AttendanceManagementPanel() {
  const [date, setDate] = useState(getTodayDateInputValue);
  const [activityType, setActivityType] = useState(ACTIVITY_TYPE.LESSON);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });
  const loadRequestIdRef = useRef(0);
  const studentsRequestIdRef = useRef(0);

  const loadAttendance = useCallback(async (selectedDate, selectedActivityType) => {
    if (!selectedDate || !selectedActivityType) {
      return;
    }

    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getAttendance({
        date: selectedDate,
        activityType: selectedActivityType,
      });

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setRecords(Array.isArray(data?.records) ? data.records : []);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setRecords([]);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נתוני הנוכחות.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const requestId = studentsRequestIdRef.current + 1;
    studentsRequestIdRef.current = requestId;

    async function loadStudents() {
      try {
        const data = await getUsers();

        if (requestId !== studentsRequestIdRef.current) {
          return;
        }

        const users = Array.isArray(data?.users) ? data.users : [];
        setStudents(users.filter(isActiveStudent));
      } catch (error) {
        if (requestId !== studentsRequestIdRef.current) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          return;
        }

        setLoadError(getErrorMessage(error, 'לא ניתן לטעון את רשימת התלמידים.'));
      }
    }

    loadStudents();

    return () => {
      studentsRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    loadAttendance(date, activityType);

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [date, activityType, loadAttendance]);

  useEffect(() => {
    setStatuses(buildAttendanceStatusMap(students, records));
  }, [students, records]);

  const sortedStudents = useMemo(
    () =>
      [...students].sort((left, right) =>
        getUserFullName(left).localeCompare(getUserFullName(right), 'he'),
      ),
    [students],
  );

  function handleStatusChange(studentId, status) {
    setStatuses((current) => ({
      ...current,
      [studentId]: status,
    }));
  }

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  async function handleSave() {
    if (isSubmitting || isLoading || sortedStudents.length === 0) {
      return;
    }

    setIsSubmitting(true);
    handleCloseToast();

    const payload = {
      date,
      activityType,
      records: sortedStudents.map((student) => ({
        studentId: student._id,
        status: statuses[student._id] || ATTENDANCE_STATUS.PRESENT,
      })),
    };

    try {
      const data = await saveAttendance(payload);
      setRecords((current) => (Array.isArray(data?.records) ? data.records : current));
      setToast({
        open: true,
        message: data?.message || 'הנוכחות נשמרה בהצלחה',
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setToast({
        open: true,
        message: getErrorMessage(error, 'שמירת הנוכחות נכשלה. נסו שוב.'),
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSave = !isLoading && !loadError && sortedStudents.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col" aria-busy={isSubmitting}>
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">ניהול נוכחות</h1>
          <p className="mt-1 text-sm text-muted">
            בחרו תאריך וסוג פעילות כדי לדווח נוכחות לשיעור או לתפילה. תלמיד ללא דיווח מסומן כנוכח.
          </p>
        </header>

        <div className="shrink-0">
          <AttendanceFilters
            date={date}
            activityType={activityType}
            onDateChange={setDate}
            onActivityTypeChange={setActivityType}
            disabled={isSubmitting}
          />
        </div>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={() => loadAttendance(date, activityType)}
            >
              נסה שוב
            </Button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? <p className="text-sm text-muted">טוען נתוני נוכחות...</p> : null}

          {!isLoading && !loadError ? (
            <AttendanceTable
              students={sortedStudents}
              statuses={statuses}
              disabled={isSubmitting}
              onStatusChange={handleStatusChange}
            />
          ) : null}
        </div>

        {canSave ? (
          <AttendanceSaveBar
            isSubmitting={isSubmitting}
            disabled={isSubmitting}
            onSave={handleSave}
          />
        ) : null}
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
