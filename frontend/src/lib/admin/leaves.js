import { getUserFullName } from '@/lib/admin/users';
import {
  VACATION_STATUS,
  formatVacationDate,
  getTomorrowDateInputValue,
  getVacationId,
  hasOverlappingVacation,
} from '@/lib/student/vacations';

export function getVacationStudentId(vacation) {
  if (vacation?.student?._id) {
    return String(vacation.student._id);
  }

  if (vacation?.studentId) {
    return String(vacation.studentId);
  }

  return '';
}

export function getStudentVacations(vacations, studentId) {
  const id = studentId ? String(studentId) : '';

  if (!id) {
    return [];
  }

  return (Array.isArray(vacations) ? vacations : []).filter(
    (vacation) => getVacationStudentId(vacation) === id,
  );
}

export function validateLeaveForm({ studentId, startDate, endDate, vacations = [] }) {
  const errors = {};
  const minDate = getTomorrowDateInputValue();

  if (!studentId) {
    errors.studentId = 'יש לבחור תלמיד';
  }

  if (!startDate) {
    errors.startDate = 'שדה זה הוא חובה';
  } else if (startDate < minDate) {
    errors.startDate = 'ניתן לבקש חופשה רק החל ממחר';
  }

  if (!endDate) {
    errors.endDate = 'שדה זה הוא חובה';
  } else if (startDate && endDate < startDate) {
    errors.endDate = 'תאריך הסיום חייב להיות באותו יום או אחרי תאריך ההתחלה';
  } else if (endDate < minDate) {
    errors.endDate = 'ניתן לבקש חופשה רק החל ממחר';
  }

  if (
    !errors.startDate &&
    !errors.endDate &&
    studentId &&
    hasOverlappingVacation(getStudentVacations(vacations, studentId), startDate, endDate)
  ) {
    errors.overlap = 'כבר קיימת חופשה באחד מהתאריכים שנבחרו';
  }

  return errors;
}

export function getVacationStudentName(vacation) {
  return getUserFullName(vacation?.student) || 'תלמיד';
}

export function getPendingVacations(data) {
  return Array.isArray(data?.pending) ? data.pending : [];
}

export function getApprovedVacations(data) {
  return Array.isArray(data?.approved) ? data.approved : [];
}

export function getVacationSettings(data) {
  const days = Number(data?.settings?.defaultVacationDays);
  return {
    defaultVacationDays: Number.isInteger(days) ? days : 11,
  };
}

export function isVacationQuotaExceeded(error) {
  return Boolean(error && error.status === 400 && error.code === 'VACATION_QUOTA_EXCEEDED');
}

export { VACATION_STATUS, formatVacationDate, getTomorrowDateInputValue, getVacationId };
