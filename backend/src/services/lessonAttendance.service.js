const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getCronTimezone } = require('../config/cron');
const { ACTIVITY_TYPE } = require('../constants/attendance');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { getTodayUtcDate } = require('../utils/time');
const { getUserClassId } = require('../utils/userClass');
const { parseLessonAttendanceSavePayload } = require('../validators/lessonAttendance');

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

async function assertStudentsBelongToRabbiClass(actor, studentIds) {
  const students = await User.find({
    ...buildRabbiClassStudentFilter(actor),
    _id: { $in: studentIds },
  }).select('_id');

  if (students.length === studentIds.length) {
    return;
  }

  throw new AppError(ERROR_MESSAGES.STUDENT_NOT_IN_RABBI_CLASS, 403, {
    errors: { records: ERROR_MESSAGES.STUDENT_NOT_IN_RABBI_CLASS },
  });
}

async function saveRabbiLessonAttendance(actor, payload) {
  const { records } = parseLessonAttendanceSavePayload(payload);
  const studentIds = records.map((record) => record.studentId);
  const date = getLessonAttendanceDate();

  await assertStudentsBelongToRabbiClass(actor, studentIds);

  const operations = records.map((record) => ({
    updateOne: {
      filter: {
        studentId: record.studentId,
        date,
        activityType: ACTIVITY_TYPE.LESSON,
      },
      update: {
        $set: {
          status: record.status,
          rabbiId: actor._id,
          reportedBy: actor._id,
          date,
          activityType: ACTIVITY_TYPE.LESSON,
        },
        $setOnInsert: {
          studentId: record.studentId,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(operations, { ordered: false });

  const savedRecords = await Attendance.find({
    rabbiId: actor._id,
    date,
    activityType: ACTIVITY_TYPE.LESSON,
  }).sort({ createdAt: 1 });

  return {
    date,
    records: savedRecords,
  };
}

module.exports = {
  buildRabbiClassStudentFilter,
  getLessonAttendanceDate,
  getRabbiLessonAttendanceToday,
  listRabbiClassStudents,
  resolveRabbiClassId,
  saveRabbiLessonAttendance,
};
