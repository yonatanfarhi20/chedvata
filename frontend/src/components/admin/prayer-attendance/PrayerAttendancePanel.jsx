'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceSaveBar from '@/components/admin/attendance/AttendanceSaveBar';
import AttendanceTable from '@/components/admin/attendance/AttendanceTable';
import PrayerAttendanceEditAlertModal from '@/components/admin/prayer-attendance/PrayerAttendanceEditAlertModal';
import PrayerAttendanceSummaryModal from '@/components/admin/prayer-attendance/PrayerAttendanceSummaryModal';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
  ACTIVITY_TYPE,
  PRAYER_ATTENDANCE_STATUS_OPTIONS,
  applyExistingAttendanceRecords,
  buildPrayerAttendancePayload,
  createDefaultAttendanceList,
  getTodayDateInputValue,
  summarizePrayerAttendance,
} from '@/lib/admin/attendance';
import { getUserFullName } from '@/lib/admin/users';
import { getAttendance, getUsers, saveAttendance } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import {
  SENIOR_MANAGEMENT_ROLES,
  USER_ROLE,
  USER_STATUS,
  getDashboardPath,
} from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

function isActiveStudent(user) {
  return user?.role === USER_ROLE.STUDENT && user?.status === USER_STATUS.ACTIVE;
}

function PrayerAttendanceContent() {
  const router = useRouter();
  const session = useSession();
  const loadRequestIdRef = useRef(0);
  const [attendanceList, setAttendanceList] = useState([]);
  const [existingRecords, setExistingRecords] = useState([]);
  const [isEditAlertOpen, setIsEditAlertOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

  const loadPrayerAttendance = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');
    setIsEditAlertOpen(false);
    setExistingRecords([]);

    try {
      const today = getTodayDateInputValue();
      const [usersData, attendanceData] = await Promise.all([
        getUsers(),
        getAttendance({
          date: today,
          activityType: ACTIVITY_TYPE.PRAYER,
        }),
      ]);

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      const users = Array.isArray(usersData?.users) ? usersData.users : [];
      const records = Array.isArray(attendanceData?.records) ? attendanceData.records : [];
      const students = users
        .filter(isActiveStudent)
        .sort((left, right) => getUserFullName(left).localeCompare(getUserFullName(right), 'he'));

      setAttendanceList(createDefaultAttendanceList(students));
      setExistingRecords(records);
      setIsEditAlertOpen(records.length > 0);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setAttendanceList([]);
      setExistingRecords([]);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את נתוני נוכחות התפילה.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPrayerAttendance();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadPrayerAttendance]);

  const students = useMemo(
    () => attendanceList.map((item) => item.student),
    [attendanceList],
  );

  const statuses = useMemo(
    () => Object.fromEntries(attendanceList.map((item) => [item.studentId, item.status])),
    [attendanceList],
  );

  const summary = useMemo(() => summarizePrayerAttendance(attendanceList), [attendanceList]);
  const canSave = !isLoading && !loadError && !isEditAlertOpen && attendanceList.length > 0;
  const homePath = getDashboardPath(session?.user?.role);

  function handleStatusChange(studentId, status) {
    setAttendanceList((current) =>
      current.map((item) => (item.studentId === studentId ? { ...item, status } : item)),
    );
  }

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  function handleEditAlertBack() {
    router.replace(homePath);
  }

  function handleEditAlertContinue() {
    setAttendanceList((current) => applyExistingAttendanceRecords(current, existingRecords));
    setIsEditAlertOpen(false);
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
      await saveAttendance(buildPrayerAttendancePayload(attendanceList));
      setIsSummaryOpen(false);
      router.replace(homePath);
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
          <h1 className="text-center text-xl font-semibold text-foreground">נוכחות תפילה</h1>
        </header>

        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={loadPrayerAttendance}
            >
              נסה שוב
            </Button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? <p className="text-sm text-muted">טוען נתוני נוכחות...</p> : null}

          {!isLoading && !loadError ? (
            <AttendanceTable
              students={students}
              statuses={statuses}
              disabled={isEditAlertOpen || isSubmitting}
              statusOptions={PRAYER_ATTENDANCE_STATUS_OPTIONS}
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

      <PrayerAttendanceEditAlertModal
        open={isEditAlertOpen}
        onBack={handleEditAlertBack}
        onContinue={handleEditAlertContinue}
      />

      <PrayerAttendanceSummaryModal
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

export default function PrayerAttendancePanel() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <PrayerAttendanceContent />
    </RequireAuth>
  );
}
