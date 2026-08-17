import Link from 'next/link';
import {
  AlertBellIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
} from '@/components/admin/dashboard/AlertIcons';

const EMPTY_STATE_MESSAGE = 'אין משימות פתוחות להיום, הכל מסודר!';

const SEVERITY_STYLES = {
  danger: 'bg-error/10 text-error',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-background text-primary',
};

function getAlertKey(alert, index) {
  return alert?.id || alert?.type || `alert-${index}`;
}

export default function OpenTasksList({ alerts = [] }) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">משימות פתוחות</h2>
        <p className="mt-0.5 text-xs text-muted">פעולות שדורשות את תשומת הלב של ההנהלה</p>
      </header>

      {alerts.length === 0 ? (
        <div className="flex items-start gap-3 px-4 py-5 text-sm text-muted">
          <span className="rounded-full bg-success/10 p-2 text-success">
            <CheckCircleIcon />
          </span>
          <p>{EMPTY_STATE_MESSAGE}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {alerts.map((alert, index) => {
            const href = alert?.href || '/admin';
            const severityClass = SEVERITY_STYLES[alert?.severity] || SEVERITY_STYLES.warning;

            return (
              <li key={getAlertKey(alert, index)}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background focus-visible:bg-background focus-visible:outline-none"
                >
                  <span className={`rounded-full p-2 ${severityClass}`}>
                    <AlertBellIcon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {alert?.title || 'התראה ניהולית'}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{alert?.message}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                    לטפל
                    <ChevronLeftIcon />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
