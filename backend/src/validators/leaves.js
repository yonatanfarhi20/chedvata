const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { normalizeToUtcDate } = require('../utils/time');

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }
}

function parseStudentId(rawValue, errors) {
  const studentId = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue || '').trim();

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    errors.studentId = ERROR_MESSAGES.USER_NOT_FOUND;
    return undefined;
  }

  return studentId;
}

function parseDateValue(rawValue, errors, fieldName) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    errors[fieldName] = 'שדה זה הוא חובה';
    return undefined;
  }

  const parsed = new Date(rawValue);

  if (Number.isNaN(parsed.getTime())) {
    errors[fieldName] = ERROR_MESSAGES.INVALID_LEAVE_DATE;
    return undefined;
  }

  return normalizeToUtcDate(parsed);
}

function parseReason(rawValue) {
  if (rawValue === undefined || rawValue === null) {
    return '';
  }

  return String(rawValue).trim();
}

function parseLeavePayload(payload = {}) {
  const errors = {};
  const studentId = parseStudentId(payload.studentId, errors);
  const startDate = parseDateValue(payload.startDate, errors, 'startDate');
  const endDate = parseDateValue(payload.endDate, errors, 'endDate');
  const reason = parseReason(payload.reason);

  if (startDate && endDate && endDate < startDate) {
    errors.endDate = ERROR_MESSAGES.INVALID_LEAVE_RANGE;
  }

  throwIfErrors(errors);

  return {
    studentId,
    startDate,
    endDate,
    reason,
  };
}

module.exports = {
  parseLeavePayload,
};
