import Link from 'next/link';
import { ChevronLeftIcon } from '@/components/admin/dashboard/AlertIcons';
import { getUserFullName } from '@/lib/admin/users';

export default function LeavesTodayList({ students = [], count = 0 }) {
  const remaining = Math.max(count - students.length, 0);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">בחופשה היום</h2>
          <p className="mt-0.5 text-xs text-muted">רשימה מקוצרת של היעדרויות מתוכננות</p>
        </div>
        <Link
          href="/admin/leaves"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"
        >
          לניהול
          <ChevronLeftIcon />
        </Link>
      </header>

      {students.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted">אין תלמידים בחופשה מאושרת היום.</p>
      ) : (
        <ul className="divide-y divide-border">
          {students.map((student) => (
            <li
              key={student.studentId || getUserFullName(student)}
              className="px-4 py-3 text-sm font-medium text-foreground"
            >
              {getUserFullName(student) || 'תלמיד'}
            </li>
          ))}
          {remaining > 0 ? (
            <li className="px-4 py-3 text-xs text-muted">ועוד {remaining} תלמידים</li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
