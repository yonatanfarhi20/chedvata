const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FORGOT_PASSWORD_INITIAL_VALUES = {
  email: '',
};

export const FORGOT_PASSWORD_FIELDS = [
  {
    name: 'email',
    label: 'דואר אלקטרוני',
    type: 'email',
    autoComplete: 'email',
    dir: 'ltr',
  },
];

export function validateForgotPasswordField(name, rawValue) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) {
    return 'שדה זה הוא חובה';
  }

  if (name === 'email' && !EMAIL_REGEX.test(value)) {
    return 'כתובת דואר אלקטרוני לא תקינה';
  }

  return '';
}

export function validateForgotPasswordForm(values) {
  const errors = {};

  Object.keys(FORGOT_PASSWORD_INITIAL_VALUES).forEach((name) => {
    const message = validateForgotPasswordField(name, values[name]);
    if (message) {
      errors[name] = message;
    }
  });

  return errors;
}
