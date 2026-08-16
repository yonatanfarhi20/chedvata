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

module.exports = {
  ACTIVITY_TYPE,
  ATTENDANCE_STATUS,
};
