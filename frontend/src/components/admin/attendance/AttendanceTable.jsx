import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_OPTIONS,
} from '@/lib/admin/attendance';
import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';

function AttendanceStatusRadios({ studentId, value, disabled, onChange }) {
  return (
    <fieldset className="min-w-[22rem]">
      <legend className="sr-only">סטטוס נוכחות</legend>
      <div className="flex flex-wrap gap-2">
        {ATTENDANCE_STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isSelected ? option.selectedClass : 'border-border bg-card text-foreground'
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/40'}`}
            >
              <input
                type="radio"
                name={`attendance-status-${studentId}`}
                value={option.value}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange?.(studentId, option.value)}
                className={`h-4 w-4 ${option.inputClass}`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function AttendanceTable({
  students,
  statuses,
  disabled = false,
  onStatusChange,
}) {
  if (students.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
        אין תלמידים פעילים להצגה במערכת.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[48rem] border-collapse text-start text-sm">
        <thead className="bg-background text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">שם התלמיד</th>
            <th className="px-4 py-3 font-semibold">כיתה/שיעור</th>
            <th className="px-4 py-3 font-semibold">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const status = statuses[student._id] || ATTENDANCE_STATUS.PRESENT;

            return (
              <tr key={student._id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{getUserFullName(student)}</td>
                <td className="px-4 py-3 text-foreground">
                  {formatClassAffiliation(student.classId)}
                </td>
                <td className="px-4 py-3">
                  <AttendanceStatusRadios
                    studentId={student._id}
                    value={status}
                    disabled={disabled}
                    onChange={onStatusChange}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
