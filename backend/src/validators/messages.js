const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { MESSAGE_TYPE } = require('../constants/messages');

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

function parseMessageType(rawValue, errors) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }

  const value = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue).trim();

  if (!value) {
    return undefined;
  }

  if (!Object.values(MESSAGE_TYPE).includes(value)) {
    errors.messageType = ERROR_MESSAGES.INVALID_MESSAGE_TYPE;
    return undefined;
  }

  return value;
}

function resolveMessageType(messageType, recipientId, classId) {
  if (messageType) {
    return messageType;
  }

  if (recipientId) {
    return MESSAGE_TYPE.PERSONAL;
  }

  if (classId) {
    return MESSAGE_TYPE.CLASS;
  }

  return undefined;
}

function parseMessagePayload(payload = {}) {
  const errors = {};
  const messageType = parseMessageType(payload.messageType, errors);
  const recipientId = parseOptionalObjectId(payload.recipientId, errors, 'recipientId');
  const classId = parseOptionalObjectId(payload.classId, errors, 'classId');
  const subject = parseRequiredText(payload.subject, errors, 'subject', MAX_SUBJECT_LENGTH);
  const content = parseRequiredText(payload.content, errors, 'content', MAX_CONTENT_LENGTH);
  const resolvedType = resolveMessageType(messageType, recipientId, classId);

  if (resolvedType === MESSAGE_TYPE.PERSONAL && !recipientId && !errors.recipientId) {
    errors.recipientId = ERROR_MESSAGES.MESSAGE_RECIPIENT_REQUIRED;
  }

  if (resolvedType === MESSAGE_TYPE.CLASS && !classId && !errors.classId) {
    errors.classId = ERROR_MESSAGES.INVALID_CLASS_ID;
  }

  if (!resolvedType && !errors.recipientId && !errors.classId && !errors.messageType) {
    errors.recipientId = ERROR_MESSAGES.MESSAGE_RECIPIENT_REQUIRED;
  }

  throwIfErrors(errors);

  if (resolvedType === MESSAGE_TYPE.ALL) {
    return {
      messageType: MESSAGE_TYPE.ALL,
      subject,
      content,
    };
  }

  if (resolvedType === MESSAGE_TYPE.PERSONAL) {
    return {
      messageType: MESSAGE_TYPE.PERSONAL,
      recipientId,
      subject,
      content,
    };
  }

  return {
    messageType: MESSAGE_TYPE.CLASS,
    classId,
    subject,
    content,
  };
}

module.exports = {
  parseMessagePayload,
};
