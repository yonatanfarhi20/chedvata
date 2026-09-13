const ACTIVITY_TYPE = Object.freeze({
  LESSON: 'lesson',
  PRAYER: 'prayer',
});

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  ON_LEAVE: 'on_leave',
});

const LESSON_ATTENDANCE_STATUSES = Object.freeze([
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.LATE,
]);

module.exports = {
  ACTIVITY_TYPE,
  ATTENDANCE_STATUS,
  LESSON_ATTENDANCE_STATUSES,
};
