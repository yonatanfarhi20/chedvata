const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTER_FIELDS = [
  'firstName',
  'lastName',
  'idNumber',
  'phone',
  'email',
  'address',
  'password',
];

function isValidIsraeliId(idNumber) {
  if (!/^\d{9}$/.test(idNumber)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    let digit = Number(idNumber[index]) * ((index % 2) + 1);
    if (digit > 9) {
      digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

function isValidPhone(phone) {
  const normalized = phone.replace(/[-\s]/g, '');
  return /^0\d{8,9}$/.test(normalized) || /^\+972\d{8,9}$/.test(normalized);
}

function validateField(name, rawValue) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) {
    return 'שדה זה הוא חובה';
  }

  switch (name) {
    case 'firstName':
    case 'lastName':
      return value.length < 2 ? 'יש להזין לפחות 2 תווים' : '';
    case 'idNumber':
      if (!/^\d{9}$/.test(value)) {
        return 'תעודת זהות חייבת להכיל 9 ספרות';
      }
      return isValidIsraeliId(value) ? '' : 'תעודת זהות לא תקינה';
    case 'phone':
      return isValidPhone(value) ? '' : 'מספר טלפון לא תקין';
    case 'email':
      return EMAIL_REGEX.test(value) ? '' : 'כתובת דואר אלקטרוני לא תקינה';
    case 'password':
      return value.length < 8 ? 'הסיסמה חייבת להכיל לפחות 8 תווים' : '';
    default:
      return '';
  }
}

function parseRegisterPayload(payload = {}) {
  const errors = {};
  const data = {};

  REGISTER_FIELDS.forEach((name) => {
    const message = validateField(name, payload[name]);
    if (message) {
      errors[name] = message;
      return;
    }

    data[name] = payload[name].trim();
  });

  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }

  data.email = data.email.toLowerCase();
  return data;
}

module.exports = {
  parseRegisterPayload,
};
