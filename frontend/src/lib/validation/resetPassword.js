export const RESET_PASSWORD_INITIAL_VALUES = {
  password: '',
  confirmPassword: '',
};

export const RESET_PASSWORD_FIELDS = [
  {
    name: 'password',
    label: 'סיסמה חדשה',
    type: 'password',
    autoComplete: 'new-password',
    dir: 'ltr',
  },
  {
    name: 'confirmPassword',
    label: 'אימות סיסמה חדשה',
    type: 'password',
    autoComplete: 'new-password',
    dir: 'ltr',
  },
];

export function validateResetPasswordField(name, rawValue, values = {}) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) {
    return 'שדה זה הוא חובה';
  }

  if (name === 'password' && value.length < 8) {
    return 'הסיסמה חייבת להכיל לפחות 8 תווים';
  }

  if (name === 'confirmPassword') {
    const password = typeof values.password === 'string' ? values.password.trim() : '';
    return value === password ? '' : 'הסיסמאות אינן תואמות';
  }

  return '';
}

export function validateResetPasswordForm(values) {
  const errors = {};

  Object.keys(RESET_PASSWORD_INITIAL_VALUES).forEach((name) => {
    const message = validateResetPasswordField(name, values[name], values);
    if (message) {
      errors[name] = message;
    }
  });

  return errors;
}
