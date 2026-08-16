export const PASSWORD_CHANGE_INITIAL_VALUES = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function getPasswordMatchState(newPassword, confirmPassword) {
  const hasConfirmInput = confirmPassword.length > 0;

  if (!hasConfirmInput) {
    return { isMatch: false, isMismatch: false };
  }

  const isMatch = confirmPassword === newPassword;
  return { isMatch, isMismatch: !isMatch };
}

export function validatePasswordChangeField(name, rawValue, values = {}) {
  const value = typeof rawValue === 'string' ? rawValue : '';

  if (name === 'oldPassword') {
    return value ? '' : 'שדה זה הוא חובה';
  }

  if (name === 'newPassword') {
    if (!value) {
      return 'שדה זה הוא חובה';
    }

    return value.length < 8 ? 'הסיסמה חייבת להכיל לפחות 8 תווים' : '';
  }

  if (name === 'confirmPassword') {
    if (!value) {
      return 'שדה זה הוא חובה';
    }

    return value === values.newPassword ? '' : 'הסיסמאות אינן תואמות';
  }

  return '';
}

export function validatePasswordChangeForm(values) {
  const errors = {};

  Object.keys(PASSWORD_CHANGE_INITIAL_VALUES).forEach((name) => {
    const message = validatePasswordChangeField(name, values[name], values);
    if (message) {
      errors[name] = message;
    }
  });

  return errors;
}
