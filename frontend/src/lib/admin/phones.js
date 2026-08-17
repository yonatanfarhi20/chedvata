import { getUserFullName } from '@/lib/admin/users';

export function getPhoneStudentId(student) {
  if (!student) {
    return '';
  }

  if (student.studentId && typeof student.studentId === 'object') {
    return String(student.studentId._id || '');
  }

  return String(student.studentId || student._id || '');
}

export function matchesPhoneStudentSearch(student, query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return getUserFullName(student).toLowerCase().includes(normalized);
}

export function getPhoneDepositSummary(students) {
  return students.reduce(
    (summary, student) => {
      summary.total += 1;

      if (student?.isDeposited) {
        summary.deposited += 1;
      }

      if (student?.isAlertRequired) {
        summary.alerts += 1;
      }

      return summary;
    },
    { total: 0, deposited: 0, alerts: 0 },
  );
}
