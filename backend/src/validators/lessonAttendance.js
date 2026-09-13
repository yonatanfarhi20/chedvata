const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { LESSON_ATTENDANCE_STATUSES } = require('../constants/attendance');
const { ERROR_MESSAGES } = require('../constants/errors');

const MAX_ATTENDANCE_RECORDS = 1000;

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }
}

function parseLessonAttendanceSavePayload(payload = {}) {
  const errors = {};
  const rawRecords = payload.records;

  if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
    errors.records = ERROR_MESSAGES.ATTENDANCE_RECORDS_REQUIRED;
  } else if (rawRecords.length > MAX_ATTENDANCE_RECORDS) {
    errors.records = ERROR_MESSAGES.ATTENDANCE_RECORDS_REQUIRED;
  }

  throwIfErrors(errors);

  const byStudentId = new Map();

  rawRecords.forEach((item, index) => {
    const record = item && typeof item === 'object' ? item : {};
    const fieldPrefix = `records.${index}`;
    const studentId =
      typeof record.studentId === 'string' ? record.studentId.trim() : String(record.studentId || '').trim();
    const status = typeof record.status === 'string' ? record.status.trim() : '';

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      errors[`${fieldPrefix}.studentId`] = ERROR_MESSAGES.USER_NOT_FOUND;
    }

    if (!LESSON_ATTENDANCE_STATUSES.includes(status)) {
      errors[`${fieldPrefix}.status`] = ERROR_MESSAGES.INVALID_ATTENDANCE_STATUS;
    }

    if (studentId && mongoose.Types.ObjectId.isValid(studentId) && LESSON_ATTENDANCE_STATUSES.includes(status)) {
      byStudentId.set(studentId, { studentId, status });
    }
  });

  throwIfErrors(errors);

  return {
    records: Array.from(byStudentId.values()),
  };
}

module.exports = {
  parseLessonAttendanceSavePayload,
};
