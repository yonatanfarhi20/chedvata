'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DashboardSectionCard from '@/components/student/dashboard/DashboardSectionCard';
import PrayerDangerGauge from '@/components/student/dashboard/PrayerDangerGauge';
import PrayerExpiryTimeline from '@/components/student/dashboard/PrayerExpiryTimeline';
import StudentDashboardSkeleton from '@/components/student/dashboard/StudentDashboardSkeleton';
import VacationDonutChart from '@/components/student/dashboard/VacationDonutChart';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getStudentDashboard } from '@/lib/api/studentDashboard';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { useSession } from '@/lib/auth/session';
import {
  EMPTY_DASHBOARD,
  getLessonOverview,
  getPrayerOverview,
  getVacationOverview,
} from '@/lib/student/dashboard';

function SectionPlaceholder({ label }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-4 py-10 text-center">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const user = useSession()?.user;
  const [overview, setOverview] = useState(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getStudentDashboard();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setOverview({
        vacations: getVacationOverview(data),
        prayers: getPrayerOverview(data),
        lessons: getLessonOverview(data),
      });
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setOverview(EMPTY_DASHBOARD);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את לוח הבקרה האישי.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadDashboard]);

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">לוח בקרה אישי</h1>
          <p className="mt-1 text-sm text-muted">
            {user?.firstName
              ? `שלום ${user.firstName}, כאן מוצג מצב החופשות, התפילות והשיעורים שלך.`
              : 'תמונת מצב אישית של חופשות, נוכחות בתפילות ונוכחות בשיעורים.'}
          </p>
        </header>

        {loadError ? (
          <div className="mb-4 flex flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadDashboard}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {isLoading ? <StudentDashboardSkeleton /> : null}

        {!isLoading && !loadError ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <DashboardSectionCard
              title="חופשות"
              description="יתרת ימי החופשה השנתית מול הימים שכבר נוצלו."
            >
              <VacationDonutChart stats={overview.vacations} />
            </DashboardSectionCard>

            <DashboardSectionCard
              className="xl:col-span-2"
              title="נוכחות תפילות"
              description="מעקב חיסורים פעילים וסטטוס המחיקה לפי כללי ההתיישנות."
            >
              <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
                <PrayerDangerGauge
                  activeAbsences={overview.prayers.activeAbsences}
                  maxAbsences={overview.prayers.maxAbsences}
                />
                <PrayerExpiryTimeline events={overview.prayers.events} />
              </div>
            </DashboardSectionCard>

            <DashboardSectionCard
              className="xl:col-span-3 min-h-[320px]"
              title="נוכחות שיעורים"
              description="יומן חודשי לפי סטטוס הנוכחות בכל יום."
            >
              <SectionPlaceholder label="גריד נוכחות השיעורים יתווסף בהמשך." />
            </DashboardSectionCard>
          </div>
        ) : null}
      </section>
    </div>
  );
}
