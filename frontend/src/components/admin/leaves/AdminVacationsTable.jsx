'use client';

import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import {
  formatVacationDate,
  getVacationId,
  getVacationStudentName,
} from '@/lib/admin/leaves';

function VacationRow({ vacation, showActions, busyVacationId, onApprove, onReject }) {
  const vacationId = getVacationId(vacation);
  const isBusy = busyVacationId === vacationId;

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-foreground">{getVacationStudentName(vacation)}</td>
      <td className="px-4 py-3 text-foreground">
        <span dir="ltr" className="inline-block tabular-nums">
          {formatVacationDate(vacation.startDate)} – {formatVacationDate(vacation.endDate)}
        </span>
      </td>
      <td className="px-4 py-3 tabular-nums text-foreground">{vacation.daysCount || '—'}</td>
      <td className="px-4 py-3 text-foreground">{vacation.reason || '—'}</td>
      {showActions ? (
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="success"
              size="sm"
              fullWidth={false}
              disabled={Boolean(busyVacationId)}
              onClick={() => onApprove?.(vacation)}
              className="inline-flex items-center justify-center gap-2"
            >
              {isBusy ? <Spinner /> : null}
              אישור
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              fullWidth={false}
              disabled={Boolean(busyVacationId)}
              onClick={() => onReject?.(vacation)}
            >
              דחייה
            </Button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}

export default function AdminVacationsTable({
  vacations = [],
  emptyMessage,
  showActions = false,
  busyVacationId = '',
  onApprove,
  onReject,
}) {
  if (vacations.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="min-w-full text-start text-sm">
        <thead className="border-b border-border bg-background text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">תלמיד</th>
            <th className="px-4 py-3 font-semibold">תאריכים</th>
            <th className="px-4 py-3 font-semibold">ימים</th>
            <th className="px-4 py-3 font-semibold">סיבה</th>
            {showActions ? <th className="px-4 py-3 font-semibold">פעולות</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vacations.map((vacation) => (
            <VacationRow
              key={getVacationId(vacation)}
              vacation={vacation}
              showActions={showActions}
              busyVacationId={busyVacationId}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
