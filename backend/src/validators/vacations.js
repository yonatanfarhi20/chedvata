const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { VACATION_STATUS } = require('../constants/vacations');
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

function parseOverrideLimit(rawValue) {
  return rawValue === true || rawValue === 'true';
}

function parseVacationStatus(rawValue, errors) {
  const status = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!status) {
    errors.status = 'שדה זה הוא חובה';
    return undefined;
  }

  if (status !== VACATION_STATUS.APPROVED && status !== VACATION_STATUS.REJECTED) {
    errors.status = ERROR_MESSAGES.INVALID_VACATION_STATUS;
    return undefined;
  }

  return status;
}

function parseVacationDays(rawValue, errors) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    errors.defaultVacationDays = 'שדה זה הוא חובה';
    return undefined;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 365) {
    errors.defaultVacationDays = ERROR_MESSAGES.INVALID_VACATION_DAYS;
    return undefined;
  }

  return parsed;
}

function parseVacationId(rawValue) {
  const vacationId = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue || '').trim();

  if (!vacationId || !mongoose.Types.ObjectId.isValid(vacationId)) {
    throw new AppError(ERROR_MESSAGES.VACATION_NOT_FOUND, 404);
  }

  return vacationId;
}

function ensureValidRange(startDate, endDate, errors) {
  if (startDate && endDate && endDate < startDate) {
    errors.endDate = ERROR_MESSAGES.INVALID_LEAVE_RANGE;
  }
}

function parseStudentVacationPayload(payload = {}) {
  const errors = {};
  const startDate = parseDateValue(payload.startDate, errors, 'startDate');
  const endDate = parseDateValue(payload.endDate, errors, 'endDate');
  const reason = parseReason(payload.reason);

  ensureValidRange(startDate, endDate, errors);
  throwIfErrors(errors);

  return { startDate, endDate, reason };
}

function parseAdminVacationPayload(payload = {}) {
  const errors = {};
  const studentId = parseStudentId(payload.studentId, errors);
  const startDate = parseDateValue(payload.startDate, errors, 'startDate');
  const endDate = parseDateValue(payload.endDate, errors, 'endDate');
  const reason = parseReason(payload.reason);
  const overrideLimit = parseOverrideLimit(payload.overrideLimit);

  ensureValidRange(startDate, endDate, errors);
  throwIfErrors(errors);

  return { studentId, startDate, endDate, reason, overrideLimit };
}

function parseVacationStatusPayload(payload = {}) {
  const errors = {};
  const status = parseVacationStatus(payload.status, errors);
  throwIfErrors(errors);
  return { status };
}

function parseVacationSettingsPayload(payload = {}) {
  const errors = {};
  const defaultVacationDays = parseVacationDays(payload.defaultVacationDays, errors);
  throwIfErrors(errors);
  return { defaultVacationDays };
}

module.exports = {
  parseVacationId,
  parseStudentVacationPayload,
  parseAdminVacationPayload,
  parseVacationStatusPayload,
  parseVacationSettingsPayload,
};
