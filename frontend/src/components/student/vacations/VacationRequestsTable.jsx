import {
  VACATION_STATUS_LABELS,
  formatVacationDate,
  getVacationId,
} from '@/lib/student/vacations';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Approved: 'bg-success/10 text-success',
  Rejected: 'bg-error/10 text-error',
};

function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] || 'bg-background text-muted';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {VACATION_STATUS_LABELS[status] || status || '—'}
    </span>
  );
}

export default function VacationRequestsTable({ vacations = [], emptyMessage }) {
  if (vacations.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="min-w-full text-start text-sm">
        <thead className="border-b border-border bg-background text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">תאריכים</th>
            <th className="px-4 py-3 font-semibold">ימים</th>
            <th className="px-4 py-3 font-semibold">סיבה</th>
            <th className="px-4 py-3 font-semibold">סטטוס</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vacations.map((vacation) => (
            <tr key={getVacationId(vacation)}>
              <td className="px-4 py-3 font-medium text-foreground">
                <span dir="ltr" className="inline-block tabular-nums">
                  {formatVacationDate(vacation.startDate)} – {formatVacationDate(vacation.endDate)}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums text-foreground">{vacation.daysCount || '—'}</td>
              <td className="px-4 py-3 text-foreground">{vacation.reason || '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={vacation.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
