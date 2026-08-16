import { USER_ROLE } from '@/lib/auth/constants';
import { validateRegisterField } from '@/lib/validation/register';

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const ADMIN_USER_PROFILE_FIELDS = [
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
];

export const ADMIN_USER_INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  idNumber: '',
  phone: '',
  email: '',
  address: '',
  password: '',
  role: USER_ROLE.STUDENT,
  classId: '',
};

export function getAdminUserFormValues(user) {
  if (!user) {
    return { ...ADMIN_USER_INITIAL_VALUES };
  }

  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    idNumber: user.idNumber || '',
    phone: user.phone || '',
    email: user.email || '',
    address: user.address || '',
    password: '',
    role: user.role || USER_ROLE.STUDENT,
    classId: user.classId ? String(user.classId) : '',
  };
}

export function validateAdminUserForm(values, { isEdit = false } = {}) {
  const errors = {};

  ADMIN_USER_PROFILE_FIELDS.forEach((field) => {
    const message = validateRegisterField(field.name, values[field.name]);
    if (message) {
      errors[field.name] = message;
    }
  });

  const password = typeof values.password === 'string' ? values.password.trim() : '';

  if (!isEdit || password) {
    const passwordMessage = validateRegisterField('password', values.password);
    if (passwordMessage) {
      errors.password = passwordMessage;
    }
  }

  if (!values.role) {
    errors.role = 'שדה זה הוא חובה';
  }

  const classId = typeof values.classId === 'string' ? values.classId.trim() : '';
  if (classId && !OBJECT_ID_REGEX.test(classId)) {
    errors.classId = 'מזהה הכיתה אינו תקין';
  }

  return errors;
}

export function toAdminUserPayload(values, { isEdit = false } = {}) {
  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    idNumber: values.idNumber.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    role: values.role,
    classId: values.classId.trim() || null,
  };

  const password = typeof values.password === 'string' ? values.password.trim() : '';

  if (!isEdit || password) {
    payload.password = password;
  }

  return payload;
}
