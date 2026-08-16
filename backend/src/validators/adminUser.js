const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE } = require('../constants/user');
const { validateField } = require('./register');

const PROFILE_FIELDS = ['firstName', 'lastName', 'idNumber', 'phone', 'email', 'address'];

function parseRole(rawValue, errors, { required = true } = {}) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    if (required) {
      errors.role = 'שדה זה הוא חובה';
    }
    return undefined;
  }

  const role = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!Object.values(USER_ROLE).includes(role)) {
    errors.role = ERROR_MESSAGES.INVALID_ROLE;
    return undefined;
  }

  return role;
}

function parseOptionalClassId(rawValue, errors) {
  if (rawValue === undefined) {
    return undefined;
  }

  if (rawValue === null) {
    return null;
  }

  const value = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue).trim();

  if (!value) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    errors.classId = ERROR_MESSAGES.INVALID_CLASS_ID;
    return undefined;
  }

  return value;
}

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }
}

function parseAdminCreateUserPayload(payload = {}) {
  const errors = {};
  const data = {};

  PROFILE_FIELDS.forEach((name) => {
    const message = validateField(name, payload[name]);
    if (message) {
      errors[name] = message;
      return;
    }

    data[name] = payload[name].trim();
  });

  const passwordMessage = validateField('password', payload.password);
  if (passwordMessage) {
    errors.password = passwordMessage;
  } else {
    data.password = payload.password.trim();
  }

  const role = parseRole(payload.role, errors, { required: false });
  data.role = role || USER_ROLE.STUDENT;

  const classId = parseOptionalClassId(payload.classId, errors);
  if (classId) {
    data.classId = classId;
  }

  throwIfErrors(errors);

  data.email = data.email.toLowerCase();
  return data;
}

function parseAdminUpdateUserPayload(payload = {}) {
  const errors = {};
  const data = {};

  PROFILE_FIELDS.forEach((name) => {
    if (payload[name] === undefined) {
      return;
    }

    const message = validateField(name, payload[name]);
    if (message) {
      errors[name] = message;
      return;
    }

    data[name] = payload[name].trim();
  });

  if (payload.password !== undefined && String(payload.password).trim() !== '') {
    const passwordMessage = validateField('password', payload.password);
    if (passwordMessage) {
      errors.password = passwordMessage;
    } else {
      data.password = String(payload.password).trim();
    }
  }

  if (payload.role !== undefined) {
    const role = parseRole(payload.role, errors, { required: true });
    if (role) {
      data.role = role;
    }
  }

  if (payload.classId !== undefined) {
    const classId = parseOptionalClassId(payload.classId, errors);
    if (classId !== undefined && !errors.classId) {
      data.classId = classId;
    }
  }

  throwIfErrors(errors);

  if (data.email) {
    data.email = data.email.toLowerCase();
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400);
  }

  return data;
}

module.exports = {
  parseAdminCreateUserPayload,
  parseAdminUpdateUserPayload,
};
