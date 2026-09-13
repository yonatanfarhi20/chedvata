'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceSaveBar from '@/components/admin/attendance/AttendanceSaveBar';
import LessonAttendanceSummaryModal from '@/components/rabbi/lesson-attendance/LessonAttendanceSummaryModal';
import LessonAttendanceTable from '@/components/rabbi/lesson-attendance/LessonAttendanceTable';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { getUserFullName } from '@/lib/admin/users';
import { getRabbiClassStudents, saveRabbiLessonAttendance } from '@/lib/api/rabbi';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { USER_ROLE, getDashboardPath } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';
import {
  buildLessonAttendancePayload,
  createDefaultAttendanceList,
  summarizeLessonAttendance,
} from '@/lib/rabbi/lessonAttendance';

function LessonAttendanceContent() {
  const router = useRouter();
  const session = useSession();
  const loadRequestIdRef = useRef(0);
  const redirectTimeoutRef = useRef(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

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
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
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

  const summary = useMemo(() => summarizeLessonAttendance(attendanceList), [attendanceList]);
  const canSave = !isLoading && !loadError && attendanceList.length > 0;
  const homePath = getDashboardPath(session?.user?.role);

  function handleStatusChange(studentId, status) {
    setAttendanceList((current) =>
      current.map((item) => (item.studentId === studentId ? { ...item, status } : item)),
    );
  }

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  function handleOpenSummary() {
    if (!canSave || isSubmitting) {
      return;
    }

    handleCloseToast();
    setIsSummaryOpen(true);
  }

  function handleCloseSummary() {
    if (isSubmitting) {
      return;
    }

    setIsSummaryOpen(false);
  }

  async function handleConfirmSave() {
    if (isSubmitting || attendanceList.length === 0) {
      return;
    }

    setIsSubmitting(true);
    handleCloseToast();

    try {
      await saveRabbiLessonAttendance(buildLessonAttendancePayload(attendanceList));
      setIsSummaryOpen(false);
      setToast({
        open: true,
        message: 'שמירה בוצעה בהצלחה',
        variant: 'success',
      });
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.replace(homePath);
      }, 1200);
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col" aria-busy={isLoading || isSubmitting}>
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
              disabled={isSubmitting}
              onStatusChange={handleStatusChange}
            />
          ) : null}
        </div>

        {canSave ? (
          <AttendanceSaveBar
            label="שמירה"
            align="center"
            isSubmitting={isSubmitting}
            disabled={isSubmitting}
            onSave={handleOpenSummary}
          />
        ) : null}
      </section>

      <LessonAttendanceSummaryModal
        open={isSummaryOpen}
        presentCount={summary.presentCount}
        absentCount={summary.absentCount}
        lateCount={summary.lateCount}
        isSubmitting={isSubmitting}
        onBack={handleCloseSummary}
        onSave={handleConfirmSave}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
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
