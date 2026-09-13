export const PHONE_DEPOSIT_STATUS = Object.freeze({
  NONE: 'none',
  PENDING_DEPOSIT: 'pending_deposit',
  DEPOSITED: 'deposited',
  READY_FOR_RETURN: 'ready_for_return',
});

export const PHONE_PENALTY_TABS = Object.freeze([
  { id: PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT, label: 'למסירה' },
  { id: PHONE_DEPOSIT_STATUS.DEPOSITED, label: 'בהפקדה' },
  { id: PHONE_DEPOSIT_STATUS.READY_FOR_RETURN, label: 'להחזרה' },
]);

export function getPhonePenaltyStudentId(student) {
  if (!student) {
    return '';
  }

  return String(student.studentId || student._id || '');
}

export function formatRemainingDepositTime(remainingMs) {
  const safeRemaining = Math.max(0, Number(remainingMs) || 0);
  const totalHours = Math.ceil(safeRemaining / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (safeRemaining === 0) {
    return 'התקופה הסתיימה';
  }

  if (days > 0 && hours > 0) {
    return `${days} ימים ו-${hours} שעות`;
  }

  if (days > 0) {
    return `${days} ימים`;
  }

  return `${hours} שעות`;
}
