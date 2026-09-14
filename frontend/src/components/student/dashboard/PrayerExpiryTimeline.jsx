import {
  PRAYER_EVENT_LABELS,
  PRAYER_EVENT_STATUS,
  formatDashboardDate,
  getRemainingDaysLabel,
} from '@/lib/student/dashboard';

const STATUS_STYLES = {
  [PRAYER_EVENT_STATUS.LATE]: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    bar: 'bg-amber-500',
  },
  [PRAYER_EVENT_STATUS.ABSENT]: {
    badge: 'bg-error/10 text-error border-error/30',
    bar: 'bg-error',
  },
};

function EventCard({ event }) {
  const status = event.status === PRAYER_EVENT_STATUS.ABSENT
    ? PRAYER_EVENT_STATUS.ABSENT
    : PRAYER_EVENT_STATUS.LATE;
  const styles = STATUS_STYLES[status];
  const progress = Math.min(100, Math.max(0, Number(event.progressPercent) || 0));

  return (
    <article className="relative rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}>
              {PRAYER_EVENT_LABELS[status]}
            </span>
            {event.waiting ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                בהמתנה
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted">{formatDashboardDate(event.date)}</p>
        </div>
        <p className="text-sm font-semibold text-foreground">{getRemainingDaysLabel(event.remainingDays)}</p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={getRemainingDaysLabel(event.remainingDays)}
      >
        <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${progress}%` }} />
      </div>
      {event.waiting ? (
        <p className="mt-2 text-xs text-muted">ספירת המחיקה תתחיל לאחר שהאירוע הקודם יימחק.</p>
      ) : null}
    </article>
  );
}

export default function PrayerExpiryTimeline({ events }) {
  const items = Array.isArray(events) ? events : [];

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-success/30 bg-success/5 px-4 py-8 text-center">
        <p className="text-sm font-medium text-success">אין איחורים או חיסורים פעילים.</p>
      </div>
    );
  }

  return (
    <ol className="flex max-h-72 flex-1 flex-col gap-3 overflow-y-auto pe-1">
      {items.map((event, index) => (
        <li key={event.id || `${event.date}-${index}`} className="relative ps-5">
          <span className="absolute start-0 top-4 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
          {index < items.length - 1 ? (
            <span className="absolute start-[3px] top-7 bottom-[-12px] w-px bg-border" aria-hidden="true" />
          ) : null}
          <EventCard event={event} />
        </li>
      ))}
    </ol>
  );
}
