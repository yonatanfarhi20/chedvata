'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AttendanceFilters from '@/components/admin/attendance/AttendanceFilters';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
  ACTIVITY_TYPE,
  ATTENDANCE_STATUS_LABELS,
  getAttendanceRecordStudentId,
  getTodayDateInputValue,
} from '@/lib/admin/attendance';
import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';
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

  const studentsById = new Map(students.map((student) => [student._id, student]));

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">ניהול נוכחות</h1>
          <p className="mt-1 text-sm text-muted">
            בחרו תאריך וסוג פעילות כדי לדווח נוכחות לשיעור או לתפילה.
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
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[40rem] border-collapse text-start text-sm">
              <thead className="bg-background text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">שם התלמיד</th>
                  <th className="px-4 py-3 font-semibold">כיתה/שיעור</th>
                  <th className="px-4 py-3 font-semibold">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted" colSpan={3}>
                      אין דיווחי נוכחות שמורים לחתך זה.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const studentId = getAttendanceRecordStudentId(record);
                    const student = studentsById.get(studentId);

                    return (
                      <tr key={record._id || studentId} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {student ? getUserFullName(student) : 'תלמיד'}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {formatClassAffiliation(student?.classId)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {ATTENDANCE_STATUS_LABELS[record.status] || record.status}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
