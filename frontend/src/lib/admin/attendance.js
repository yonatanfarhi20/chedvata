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

export const ATTENDANCE_STATUS_OPTIONS = Object.freeze([
  {
    value: ATTENDANCE_STATUS.PRESENT,
    label: ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.PRESENT],
    inputClass: 'accent-green-500',
    selectedClass: 'border-green-500 bg-green-50 text-green-800',
  },
  {
    value: ATTENDANCE_STATUS.ABSENT,
    label: ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.ABSENT],
    inputClass: 'accent-red-500',
    selectedClass: 'border-red-500 bg-red-50 text-red-800',
  },
  {
    value: ATTENDANCE_STATUS.LATE,
    label: ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.LATE],
    inputClass: 'accent-orange-500',
    selectedClass: 'border-orange-400 bg-orange-50 text-orange-800',
  },
  {
    value: ATTENDANCE_STATUS.ON_LEAVE,
    label: ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.ON_LEAVE],
    inputClass: 'accent-gray-500',
    selectedClass: 'border-gray-400 bg-gray-100 text-gray-700',
  },
]);

export const PRAYER_ATTENDANCE_STATUS_OPTIONS = Object.freeze(
  ATTENDANCE_STATUS_OPTIONS.filter((option) => option.value !== ATTENDANCE_STATUS.ON_LEAVE).map(
    (option) =>
      option.value === ATTENDANCE_STATUS.LATE ? { ...option, label: 'איחר' } : option,
  ),
);

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

export function buildAttendanceStatusMap(students, records) {
  const recordsByStudentId = new Map(
    records.map((record) => [getAttendanceRecordStudentId(record), record.status]),
  );

  return Object.fromEntries(
    students.map((student) => [
      student._id,
      recordsByStudentId.get(student._id) || ATTENDANCE_STATUS.PRESENT,
    ]),
  );
}

export function createDefaultAttendanceList(students) {
  return students.map((student) => ({
    studentId: student._id,
    status: ATTENDANCE_STATUS.PRESENT,
    student,
  }));
}

export function applyExistingAttendanceRecords(attendanceList, records) {
  const recordsByStudentId = new Map(
    records.map((record) => [getAttendanceRecordStudentId(record), record.status]),
  );

  return attendanceList.map((item) => {
    const existingStatus = recordsByStudentId.get(item.studentId);

    if (!existingStatus) {
      return item;
    }

    return {
      ...item,
      status: existingStatus,
    };
  });
}
