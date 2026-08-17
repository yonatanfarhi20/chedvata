const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE } = require('../constants/user');
const {
  parseAttendanceQuery,
  parseAttendanceSavePayload,
} = require('../validators/attendance');

async function listAttendance(query) {
  const { date, activityType } = parseAttendanceQuery(query);

  const records = await Attendance.find({ date, activityType }).sort({ createdAt: 1 });

  return {
    date,
    activityType,
    records,
  };
}

async function assertStudentsExist(studentIds) {
  const students = await User.find({
    _id: { $in: studentIds },
    role: USER_ROLE.STUDENT,
  }).select('_id');

  if (students.length === studentIds.length) {
    return;
  }

  throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404, {
    errors: { records: ERROR_MESSAGES.USER_NOT_FOUND },
  });
}

async function saveAttendance(payload, { reportedBy } = {}) {
  const { date, activityType, records } = parseAttendanceSavePayload(payload);
  const studentIds = records.map((record) => record.studentId);

  await assertStudentsExist(studentIds);

  const operations = records.map((record) => ({
    updateOne: {
      filter: {
        studentId: record.studentId,
        date,
        activityType,
      },
      update: {
        $set: {
          status: record.status,
          reportedBy,
          date,
          activityType,
        },
        $setOnInsert: {
          studentId: record.studentId,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(operations, { ordered: false });

  const savedRecords = await Attendance.find({ date, activityType }).sort({ createdAt: 1 });

  return {
    date,
    activityType,
    records: savedRecords,
  };
}

module.exports = {
  listAttendance,
  saveAttendance,
};
