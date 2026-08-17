'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AttendanceFilters from '@/components/admin/attendance/AttendanceFilters';
import AttendanceTable from '@/components/admin/attendance/AttendanceTable';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
  ACTIVITY_TYPE,
  buildAttendanceStatusMap,
  getTodayDateInputValue,
} from '@/lib/admin/attendance';
import { getUserFullName } from '@/lib/admin/users';
import { getAttendance, getUsers } from '@/lib/api/admin';
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
  const [loadError, setLoadError] = useState('');
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

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">ניהול נוכחות</h1>
          <p className="mt-1 text-sm text-muted">
            בחרו תאריך וסוג פעילות כדי לדווח נוכחות לשיעור או לתפילה. תלמיד ללא דיווח מסומן כנוכח.
          </p>
        </header>

        <AttendanceFilters
          date={date}
          activityType={activityType}
          onDateChange={setDate}
          onActivityTypeChange={setActivityType}
        />

        {loadError ? (
          <div className="mb-4 flex flex-col items-start gap-3">
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

        {isLoading ? <p className="text-sm text-muted">טוען נתוני נוכחות...</p> : null}

        {!isLoading && !loadError ? (
          <AttendanceTable
            students={sortedStudents}
            statuses={statuses}
            onStatusChange={handleStatusChange}
          />
        ) : null}
      </section>
    </div>
  );
}
