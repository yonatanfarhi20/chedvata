import Badge from '@/components/ui/Badge';
import {
  ATTENDANCE_STATUS,
  LESSON_ATTENDANCE_STATUS_OPTIONS,
  ON_LEAVE_BADGE_LABEL,
  toStudentIdSet,
} from '@/lib/rabbi/lessonAttendance';
import { getUserFullName } from '@/lib/admin/users';

function LessonAttendanceStatusRadios({ studentId, value, disabled, onChange }) {
  return (
    <fieldset className="min-w-[18rem]">
      <legend className="sr-only">סטטוס נוכחות</legend>
      <div className="flex flex-wrap gap-2">
        {LESSON_ATTENDANCE_STATUS_OPTIONS.map((option) => {
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
                name={`lesson-attendance-status-${studentId}`}
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

export default function LessonAttendanceTable({
  students,
  statuses,
  leaveStudentIds = [],
  disabled = false,
  onStatusChange,
}) {
  const onLeave = toStudentIdSet(leaveStudentIds);

  if (students.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
        <thead className="bg-background text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">שם מלא</th>
            <th className="px-4 py-3 font-semibold">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const status = statuses[student._id] || ATTENDANCE_STATUS.PRESENT;

            return (
              <tr key={student._id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">
                  <span className="flex flex-wrap items-center gap-2">
                    {getUserFullName(student)}
                    {onLeave.has(String(student._id)) ? (
                      <Badge variant="info">{ON_LEAVE_BADGE_LABEL}</Badge>
                    ) : null}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <LessonAttendanceStatusRadios
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
