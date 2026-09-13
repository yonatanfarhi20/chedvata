const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

function parseStudentIdParam(rawValue) {
  const studentId = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue || '').trim();

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return studentId;
}

module.exports = {
  parseStudentIdParam,
};
