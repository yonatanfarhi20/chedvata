const LESSON_DAY_STATUS = Object.freeze({
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  NONE: 'none',
});

const LESSON_DAY_REASON = Object.freeze({
  SHABBAT: 'shabbat',
  LEAVE: 'leave',
  NO_LESSON: 'no_lesson',
});

module.exports = {
  LESSON_DAY_STATUS,
  LESSON_DAY_REASON,
};
