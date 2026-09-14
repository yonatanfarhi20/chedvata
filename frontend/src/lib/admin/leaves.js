import { getUserFullName } from '@/lib/admin/users';
import {
  VACATION_STATUS,
  formatVacationDate,
  getVacationId,
} from '@/lib/student/vacations';

export function getTodayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateLeaveForm({ studentId, startDate, endDate }) {
  const errors = {};

  if (!studentId) {
    errors.studentId = 'יש לבחור תלמיד';
  }

  if (!startDate) {
    errors.startDate = 'שדה זה הוא חובה';
  }

  if (!endDate) {
    errors.endDate = 'שדה זה הוא חובה';
  } else if (startDate && endDate < startDate) {
    errors.endDate = 'תאריך הסיום חייב להיות באותו יום או אחרי תאריך ההתחלה';
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

export { VACATION_STATUS, formatVacationDate, getVacationId };
