'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AttendanceTrendCard from '@/components/admin/dashboard/AttendanceTrendCard';
import VacationsTodayWidget from '@/components/admin/dashboard/VacationsTodayWidget';
import RequireAuth from '@/components/auth/RequireAuth';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
  EMPTY_ATTENDANCE_TREND,
  EMPTY_VACATIONS_TODAY,
  getAttendanceTrendOverview,
  getVacationsToday,
} from '@/lib/admin/managementDashboard';
import { getDailyVacations, getLessonAttendance, getPrayerAttendance } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';
import { DASHBOARD_PERIOD } from '@/lib/rabbi/dashboard';

function VacationWidgetSkeleton() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-hidden="true">
      <div className="h-4 w-28 animate-pulse rounded bg-border" />
      <div className="mt-2 h-3 w-48 animate-pulse rounded bg-border" />
      <div className="mt-6 h-12 w-20 animate-pulse rounded bg-border" />
      <div className="mt-3 h-3 w-36 animate-pulse rounded bg-border" />
    </section>
  );
}

function ManagementDashboardView() {
  const user = useSession()?.user;
  const [vacations, setVacations] = useState(EMPTY_VACATIONS_TODAY);
  const [isVacationsLoading, setIsVacationsLoading] = useState(true);
  const [vacationsError, setVacationsError] = useState('');
  const vacationsRequestIdRef = useRef(0);

  const [prayerPeriod, setPrayerPeriod] = useState(DASHBOARD_PERIOD.WEEK);
  const [prayers, setPrayers] = useState(EMPTY_ATTENDANCE_TREND);
  const [isPrayersLoading, setIsPrayersLoading] = useState(true);
  const [prayersError, setPrayersError] = useState('');
  const prayersRequestIdRef = useRef(0);

  const [lessonPeriod, setLessonPeriod] = useState(DASHBOARD_PERIOD.WEEK);
  const [lessons, setLessons] = useState(EMPTY_ATTENDANCE_TREND);
  const [isLessonsLoading, setIsLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState('');
  const lessonsRequestIdRef = useRef(0);

  const loadVacations = useCallback(async () => {
    const requestId = vacationsRequestIdRef.current + 1;
    vacationsRequestIdRef.current = requestId;
    setIsVacationsLoading(true);
    setVacationsError('');

    try {
      const data = await getDailyVacations();

      if (requestId !== vacationsRequestIdRef.current) {
        return;
      }

      setVacations(getVacationsToday(data));
    } catch (error) {
      if (requestId !== vacationsRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setVacations(EMPTY_VACATIONS_TODAY);
      setVacationsError(getErrorMessage(error, 'לא ניתן לטעון את נתוני החופשות.'));
    } finally {
      if (requestId === vacationsRequestIdRef.current) {
        setIsVacationsLoading(false);
      }
    }
  }, []);

  const loadPrayers = useCallback(async (selectedPeriod) => {
    const requestId = prayersRequestIdRef.current + 1;
    prayersRequestIdRef.current = requestId;
    setIsPrayersLoading(true);
    setPrayersError('');

    try {
      const data = await getPrayerAttendance(selectedPeriod);

      if (requestId !== prayersRequestIdRef.current) {
        return;
      }

      setPrayers(getAttendanceTrendOverview(data));
    } catch (error) {
      if (requestId !== prayersRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setPrayers(EMPTY_ATTENDANCE_TREND);
      setPrayersError(getErrorMessage(error, 'לא ניתן לטעון את נוכחות התפילות.'));
    } finally {
      if (requestId === prayersRequestIdRef.current) {
        setIsPrayersLoading(false);
      }
    }
  }, []);

  const loadLessons = useCallback(async (selectedPeriod) => {
    const requestId = lessonsRequestIdRef.current + 1;
    lessonsRequestIdRef.current = requestId;
    setIsLessonsLoading(true);
    setLessonsError('');

    try {
      const data = await getLessonAttendance(selectedPeriod);

      if (requestId !== lessonsRequestIdRef.current) {
        return;
      }

      setLessons(getAttendanceTrendOverview(data));
    } catch (error) {
      if (requestId !== lessonsRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setLessons(EMPTY_ATTENDANCE_TREND);
      setLessonsError(getErrorMessage(error, 'לא ניתן לטעון את נוכחות השיעורים.'));
    } finally {
      if (requestId === lessonsRequestIdRef.current) {
        setIsLessonsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadVacations();

    return () => {
      vacationsRequestIdRef.current += 1;
    };
  }, [loadVacations]);

  useEffect(() => {
    loadPrayers(prayerPeriod);

    return () => {
      prayersRequestIdRef.current += 1;
    };
  }, [loadPrayers, prayerPeriod]);

  useEffect(() => {
    loadLessons(lessonPeriod);

    return () => {
      lessonsRequestIdRef.current += 1;
    };
  }, [loadLessons, lessonPeriod]);

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">לוח בקרה</h1>
          <p className="mt-1 text-sm text-muted">
            {user?.firstName
              ? `שלום ${user.firstName}, כאן מוצגת תמונת מצב כלל-ישיבתית של חופשות ונוכחות.`
              : 'תמונת מצב כלל-ישיבתית של חופשות ונוכחות.'}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {vacationsError ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <Alert>{vacationsError}</Alert>
              <Button type="button" variant="secondary" fullWidth={false} onClick={loadVacations}>
                נסה שוב
              </Button>
            </div>
          ) : isVacationsLoading ? (
            <VacationWidgetSkeleton />
          ) : (
            <VacationsTodayWidget stats={vacations} />
          )}

          <AttendanceTrendCard
            title="נוכחות תפילות"
            description="אחוז נוכחות משוקלל בתפילות"
            period={prayerPeriod}
            onPeriodChange={setPrayerPeriod}
            overview={prayers}
            isLoading={isPrayersLoading}
            loadError={prayersError}
            onRetry={() => loadPrayers(prayerPeriod)}
            periodAriaLabel="טווח תצוגת נוכחות תפילות"
          />

          <AttendanceTrendCard
            title="נוכחות שיעורים"
            description="אחוז נוכחות משוקלל בכלל השיעורים בישיבה"
            period={lessonPeriod}
            onPeriodChange={setLessonPeriod}
            overview={lessons}
            isLoading={isLessonsLoading}
            loadError={lessonsError}
            onRetry={() => loadLessons(lessonPeriod)}
            periodAriaLabel="טווח תצוגת נוכחות שיעורים"
          />
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <ManagementDashboardView />
    </RequireAuth>
  );
}
