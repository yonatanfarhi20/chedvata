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
