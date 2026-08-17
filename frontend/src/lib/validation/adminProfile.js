import { validateRegisterField } from '@/lib/validation/register';

export const ADMIN_PROFILE_INITIAL_VALUES = {
  phone: '',
  address: '',
};

export function getAdminProfileFormValues(user) {
  return {
    phone: user?.phone || '',
    address: user?.address || '',
  };
}

export function validateAdminProfileField(name, rawValue) {
  return validateRegisterField(name, rawValue);
}

export function validateAdminProfileForm(values) {
  const errors = {};

  Object.keys(ADMIN_PROFILE_INITIAL_VALUES).forEach((name) => {
    const message = validateAdminProfileField(name, values[name]);
    if (message) {
      errors[name] = message;
    }
  });

  return errors;
}
