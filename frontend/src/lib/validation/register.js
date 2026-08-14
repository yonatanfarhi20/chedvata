const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REGISTER_INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  idNumber: '',
  phone: '',
  email: '',
  address: '',
  password: '',
};

export const REGISTER_FIELDS = [
  {
    name: 'firstName',
    label: 'שם פרטי',
    type: 'text',
    autoComplete: 'given-name',
  },
  {
    name: 'lastName',
    label: 'שם משפחה',
    type: 'text',
    autoComplete: 'family-name',
  },
  {
    name: 'idNumber',
    label: 'תעודת זהות',
    type: 'text',
    inputMode: 'numeric',
    autoComplete: 'off',
    maxLength: 9,
    dir: 'ltr',
  },
  {
    name: 'phone',
    label: 'מספר טלפון',
    type: 'tel',
    autoComplete: 'tel',
    dir: 'ltr',
  },
  {
    name: 'email',
    label: 'דואר אלקטרוני',
    type: 'email',
    autoComplete: 'email',
    dir: 'ltr',
  },
  {
    name: 'address',
    label: 'כתובת',
    type: 'text',
    autoComplete: 'street-address',
  },
  {
    name: 'password',
    label: 'סיסמה',
    type: 'password',
    autoComplete: 'new-password',
    dir: 'ltr',
  },
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

export function validateRegisterField(name, rawValue) {
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

export function validateRegisterForm(values) {
  const errors = {};

  Object.keys(REGISTER_INITIAL_VALUES).forEach((name) => {
    const message = validateRegisterField(name, values[name]);
    if (message) {
      errors[name] = message;
    }
  });

  return errors;
}
