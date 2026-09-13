const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getCronTimezone } = require('../config/cron');
const { ACTIVITY_TYPE } = require('../constants/attendance');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { getTodayUtcDate } = require('../utils/time');
const { getUserClassId } = require('../utils/userClass');

function getLessonAttendanceDate() {
  return getTodayUtcDate(getCronTimezone());
}

function resolveRabbiClassId(actor) {
  const classId = getUserClassId(actor);

  if (!classId) {
    throw new AppError(ERROR_MESSAGES.INVALID_CLASS_ID, 400, {
      errors: { classId: ERROR_MESSAGES.INVALID_CLASS_ID },
    });
  }

  return classId;
}

function buildRabbiClassStudentFilter(actor) {
  return {
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
    classId: resolveRabbiClassId(actor),
  };
}

async function listRabbiClassStudents(actor) {
  const classId = resolveRabbiClassId(actor);
  const students = await User.find(buildRabbiClassStudentFilter(actor))
    .select('firstName lastName classId status role')
    .sort({ lastName: 1, firstName: 1 });

  return {
    classId,
    students,
  };
}

async function getRabbiLessonAttendanceToday(actor) {
  const date = getLessonAttendanceDate();
  const records = await Attendance.find({
    rabbiId: actor._id,
    date,
    activityType: ACTIVITY_TYPE.LESSON,
  }).sort({ createdAt: 1 });

  return {
    date,
    alreadyReported: records.length > 0,
    records,
  };
}

module.exports = {
  buildRabbiClassStudentFilter,
  getLessonAttendanceDate,
  getRabbiLessonAttendanceToday,
  listRabbiClassStudents,
  resolveRabbiClassId,
};
