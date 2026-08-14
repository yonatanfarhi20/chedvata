const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LOGIN_INITIAL_VALUES = {
  email: '',
  password: '',
};

export const LOGIN_FIELDS = [
  {
    name: 'email',
    label: 'דואר אלקטרוני',
    type: 'email',
    autoComplete: 'email',
    dir: 'ltr',
  },
  {
    name: 'password',
    label: 'סיסמה',
    type: 'password',
    autoComplete: 'current-password',
    dir: 'ltr',
  },
];

export function validateLoginField(name, rawValue) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) {
    return 'שדה זה הוא חובה';
  }

  if (name === 'email' && !EMAIL_REGEX.test(value)) {
    return 'כתובת דואר אלקטרוני לא תקינה';
  }

  return '';
}

export function validateLoginForm(values) {
  const errors = {};

  Object.keys(LOGIN_INITIAL_VALUES).forEach((name) => {
    const message = validateLoginField(name, values[name]);
    if (message) {
      errors[name] = message;
    }
  });

  return errors;
}
