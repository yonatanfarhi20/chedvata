import { formatRemainingDepositTime, getPhonePenaltyStudentId } from '@/lib/admin/phonePenalties';
import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';

export default function DepositedList({ students = [] }) {
  if (students.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
        אין כרגע טלפונים בהפקדה.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="min-w-full divide-y divide-border text-start">
        <thead className="bg-background">
          <tr>
            <th className="px-4 py-3 text-start text-sm font-semibold text-foreground">תלמיד</th>
            <th className="px-4 py-3 text-start text-sm font-semibold text-foreground">כיתה</th>
            <th className="px-4 py-3 text-start text-sm font-semibold text-foreground">זמן שנותר</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => {
            const studentId = getPhonePenaltyStudentId(student);

            return (
              <tr key={studentId}>
                <td className="px-4 py-3 font-medium text-foreground">{getUserFullName(student)}</td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatClassAffiliation(student?.classId)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatRemainingDepositTime(student.remainingMs)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
