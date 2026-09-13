'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LessonAttendanceTable from '@/components/rabbi/lesson-attendance/LessonAttendanceTable';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getUserFullName } from '@/lib/admin/users';
import { getRabbiClassStudents } from '@/lib/api/rabbi';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { USER_ROLE } from '@/lib/auth/constants';
import { createDefaultAttendanceList } from '@/lib/rabbi/lessonAttendance';

function LessonAttendanceContent() {
  const loadRequestIdRef = useRef(0);
  const [attendanceList, setAttendanceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadLessonAttendance = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const studentsData = await getRabbiClassStudents();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      const students = (Array.isArray(studentsData?.students) ? studentsData.students : [])
        .slice()
        .sort((left, right) => getUserFullName(left).localeCompare(getUserFullName(right), 'he'));

      setAttendanceList(createDefaultAttendanceList(students));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setAttendanceList([]);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נתוני נוכחות השיעור.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadLessonAttendance();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadLessonAttendance]);

  const students = useMemo(
    () => attendanceList.map((item) => item.student),
    [attendanceList],
  );

  const statuses = useMemo(
    () => Object.fromEntries(attendanceList.map((item) => [item.studentId, item.status])),
    [attendanceList],
  );

  function handleStatusChange(studentId, status) {
    setAttendanceList((current) =>
      current.map((item) => (item.studentId === studentId ? { ...item, status } : item)),
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col" aria-busy={isLoading}>
        <header className="mb-6 shrink-0">
          <h1 className="text-center text-xl font-semibold text-foreground">נוכחות שיעור</h1>
        </header>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={loadLessonAttendance}
            >
              נסה שוב
            </Button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? <p className="text-sm text-muted">טוען נתוני נוכחות...</p> : null}

          {!isLoading && !loadError ? (
            <LessonAttendanceTable
              students={students}
              statuses={statuses}
              onStatusChange={handleStatusChange}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function LessonAttendancePanel() {
  return (
    <RequireAuth allowedRoles={[USER_ROLE.RABBI]}>
      <LessonAttendanceContent />
    </RequireAuth>
  );
}
