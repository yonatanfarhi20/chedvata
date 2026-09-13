import Button from '@/components/ui/Button';
import { getPhonePenaltyStudentId } from '@/lib/admin/phonePenalties';
import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';

export default function ReadyForReturnList({
  students = [],
  busyStudentId = '',
  onConfirmReturn,
}) {
  if (students.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
        אין כרגע תלמידים הזכאים להחזרת המכשיר.
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
            <th className="px-4 py-3 text-start text-sm font-semibold text-foreground">פעולה</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => {
            const studentId = getPhonePenaltyStudentId(student);
            const isBusy = busyStudentId === studentId;

            return (
              <tr key={studentId}>
                <td className="px-4 py-3 font-medium text-foreground">{getUserFullName(student)}</td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatClassAffiliation(student?.classId)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    fullWidth={false}
                    disabled={isBusy}
                    onClick={() => onConfirmReturn?.(student)}
                  >
                    {isBusy ? 'מחזיר...' : 'הוחזר לתלמיד'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
