const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { ACTIVITY_TYPE, ATTENDANCE_STATUS } = require('../constants/attendance');
const { normalizeToUtcDate } = require('../utils/time');

const MAX_ATTENDANCE_RECORDS = 1000;

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }
}

function parseDateValue(rawValue, errors, fieldName = 'date') {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    errors[fieldName] = 'שדה זה הוא חובה';
    return undefined;
  }

  const parsed = new Date(rawValue);

  if (Number.isNaN(parsed.getTime())) {
    errors[fieldName] = ERROR_MESSAGES.INVALID_ATTENDANCE_DATE;
    return undefined;
  }

  return normalizeToUtcDate(parsed);
}

function parseActivityType(rawValue, errors) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    errors.activityType = 'שדה זה הוא חובה';
    return undefined;
  }

  const activityType = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!Object.values(ACTIVITY_TYPE).includes(activityType)) {
    errors.activityType = ERROR_MESSAGES.INVALID_ACTIVITY_TYPE;
    return undefined;
  }

  return activityType;
}

function parseStudentId(rawValue, errors, fieldName) {
  const studentId = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue || '').trim();

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    errors[fieldName] = ERROR_MESSAGES.USER_NOT_FOUND;
    return undefined;
  }

  return studentId;
}

function parseStatus(rawValue, errors, fieldName) {
  const status = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
    errors[fieldName] = ERROR_MESSAGES.INVALID_ATTENDANCE_STATUS;
    return undefined;
  }

  return status;
}

function parseAttendanceQuery(query = {}) {
  const errors = {};
  const date = parseDateValue(query.date, errors);
  const activityType = parseActivityType(query.activityType, errors);

  throwIfErrors(errors);

  return { date, activityType };
}

function parseAttendanceSavePayload(payload = {}) {
  const errors = {};
  const date = parseDateValue(payload.date, errors);
  const activityType = parseActivityType(payload.activityType, errors);
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
    const studentId = parseStudentId(record.studentId, errors, `${fieldPrefix}.studentId`);
    const status = parseStatus(record.status, errors, `${fieldPrefix}.status`);

    if (studentId && status) {
      byStudentId.set(studentId, { studentId, status });
    }
  });

  throwIfErrors(errors);

  return {
    date,
    activityType,
    records: Array.from(byStudentId.values()),
  };
}

module.exports = {
  parseAttendanceQuery,
  parseAttendanceSavePayload,
};
