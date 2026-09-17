import Button from '@/components/ui/Button';
import { getPhonePenaltyStudentId } from '@/lib/admin/phonePenalties';
import { getUserFullName } from '@/lib/admin/users';

export default function PendingDepositList({
  students = [],
  busyStudentId = '',
  onConfirmDeposit,
}) {
  if (students.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
        אין כרגע תלמידים שמחויבים במסירת מכשיר.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="min-w-full divide-y divide-border text-start">
        <thead className="bg-background">
          <tr>
            <th className="px-4 py-3 text-start text-sm font-semibold text-foreground">תלמיד</th>
            <th className="px-4 py-3 text-start text-sm font-semibold text-foreground">חיסורים</th>
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
                <td className="px-4 py-3 text-sm text-foreground">{student.absenceCount ?? 5}</td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    disabled={isBusy}
                    onClick={() => onConfirmDeposit?.(student)}
                  >
                    {isBusy ? 'מאשר...' : 'אישור הפקדה'}
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
