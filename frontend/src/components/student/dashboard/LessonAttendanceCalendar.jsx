import {
  HEBREW_WEEKDAYS,
  LESSON_DAY_LABELS,
  LESSON_DAY_STATUS,
  buildLessonCalendarCells,
  formatLessonMonthTitle,
} from '@/lib/student/dashboard';

const STATUS_STYLES = {
  [LESSON_DAY_STATUS.PRESENT]: 'bg-success text-white',
  [LESSON_DAY_STATUS.LATE]: 'bg-amber-500 text-white',
  [LESSON_DAY_STATUS.ABSENT]: 'bg-error text-white',
  [LESSON_DAY_STATUS.NONE]: 'bg-stone-200 text-muted',
};

const LEGEND_ITEMS = [
  { status: LESSON_DAY_STATUS.PRESENT, label: LESSON_DAY_LABELS[LESSON_DAY_STATUS.PRESENT] },
  { status: LESSON_DAY_STATUS.LATE, label: LESSON_DAY_LABELS[LESSON_DAY_STATUS.LATE] },
  { status: LESSON_DAY_STATUS.ABSENT, label: LESSON_DAY_LABELS[LESSON_DAY_STATUS.ABSENT] },
  { status: LESSON_DAY_STATUS.NONE, label: LESSON_DAY_LABELS[LESSON_DAY_STATUS.NONE] },
];

function DayCell({ day }) {
  if (!day) {
    return <div className="min-h-11 rounded-lg" aria-hidden="true" />;
  }

  const status = Object.values(LESSON_DAY_STATUS).includes(day.status)
    ? day.status
    : LESSON_DAY_STATUS.NONE;
  const label = LESSON_DAY_LABELS[status];

  return (
    <div
      className={`flex min-h-11 items-center justify-center rounded-lg text-sm font-semibold tabular-nums ${STATUS_STYLES[status]}`}
      title={`${day.day} · ${label}`}
      aria-label={`${day.day}, ${label}`}
    >
      {day.day}
    </div>
  );
}

export default function LessonAttendanceCalendar({ lessons }) {
  const year = lessons?.year;
  const month = lessons?.month;
  const cells = buildLessonCalendarCells(year, month, lessons?.days);
  const title = formatLessonMonthTitle(year, month);

  if (cells.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-4 py-8 text-center">
        <p className="text-sm text-muted">אין נתוני נוכחות שיעורים להצגה.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="mb-3 text-sm font-medium text-muted">{title}</p>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {HEBREW_WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-1 text-center text-xs font-semibold text-muted">
            {weekday}
          </div>
        ))}
        {cells.map((day, index) => (
          <DayCell key={day?.date || `pad-${index}`} day={day} />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-3" aria-label="מקרא נוכחות">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.status} className="flex items-center gap-2 text-xs text-muted">
            <span className={`h-3 w-3 rounded-sm ${STATUS_STYLES[item.status]}`} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
