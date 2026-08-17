const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

const MAX_SUBJECT_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }
}

function parseOptionalObjectId(rawValue, errors, fieldName) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }

  const value = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue).trim();

  if (!value) {
    return undefined;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    errors[fieldName] =
      fieldName === 'classId' ? ERROR_MESSAGES.INVALID_CLASS_ID : ERROR_MESSAGES.USER_NOT_FOUND;
    return undefined;
  }

  return value;
}

function parseRequiredText(rawValue, errors, fieldName, maxLength) {
  if (rawValue === undefined || rawValue === null) {
    errors[fieldName] = 'שדה זה הוא חובה';
    return undefined;
  }

  const value = String(rawValue).trim();

  if (!value) {
    errors[fieldName] = 'שדה זה הוא חובה';
    return undefined;
  }

  if (value.length > maxLength) {
    errors[fieldName] = ERROR_MESSAGES.INVALID_DATA;
    return undefined;
  }

  return value;
}

function parseMessagePayload(payload = {}) {
  const errors = {};
  const recipientId = parseOptionalObjectId(payload.recipientId, errors, 'recipientId');
  const classId = parseOptionalObjectId(payload.classId, errors, 'classId');
  const subject = parseRequiredText(payload.subject, errors, 'subject', MAX_SUBJECT_LENGTH);
  const content = parseRequiredText(payload.content, errors, 'content', MAX_CONTENT_LENGTH);

  if (!recipientId && !classId && !errors.recipientId && !errors.classId) {
    errors.recipientId = ERROR_MESSAGES.MESSAGE_RECIPIENT_REQUIRED;
  }

  throwIfErrors(errors);

  return {
    ...(recipientId ? { recipientId } : {}),
    ...(classId && !recipientId ? { classId } : {}),
    subject,
    content,
  };
}

module.exports = {
  parseMessagePayload,
};
