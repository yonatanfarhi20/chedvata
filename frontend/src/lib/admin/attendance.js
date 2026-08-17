export const ACTIVITY_TYPE = Object.freeze({
  LESSON: 'lesson',
  PRAYER: 'prayer',
});

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  ON_LEAVE: 'on_leave',
});

export const ACTIVITY_TYPE_LABELS = Object.freeze({
  [ACTIVITY_TYPE.LESSON]: 'שיעור',
  [ACTIVITY_TYPE.PRAYER]: 'תפילה',
});

export const ATTENDANCE_STATUS_LABELS = Object.freeze({
  [ATTENDANCE_STATUS.PRESENT]: 'נוכח',
  [ATTENDANCE_STATUS.ABSENT]: 'נעדר',
  [ATTENDANCE_STATUS.LATE]: 'איחור',
  [ATTENDANCE_STATUS.ON_LEAVE]: 'חופשה',
});

export function getTodayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAttendanceRecordStudentId(record) {
  if (!record?.studentId) {
    return '';
  }

  if (typeof record.studentId === 'object') {
    return String(record.studentId._id || '');
  }

  return String(record.studentId);
}
