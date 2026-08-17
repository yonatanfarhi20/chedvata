const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

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

function parseIsDeposited(rawValue, errors) {
  if (typeof rawValue === 'boolean') {
    return rawValue;
  }

  if (rawValue === 'true' || rawValue === 'false') {
    return rawValue === 'true';
  }

  errors.isDeposited = ERROR_MESSAGES.INVALID_PHONE_DEPOSIT_STATUS;
  return undefined;
}

function parsePhoneDepositPayload(payload = {}) {
  const errors = {};
  const studentId = parseStudentId(payload.studentId, errors);
  const isDeposited = parseIsDeposited(
    payload.isDeposited !== undefined ? payload.isDeposited : payload.status,
    errors,
  );

  throwIfErrors(errors);

  return { studentId, isDeposited };
}

module.exports = {
  parsePhoneDepositPayload,
};
