'use client';

import { useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SelectField from '@/components/ui/SelectField';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import { USER_ROLE_LABELS } from '@/lib/admin/users';
import { createUser, updateUser } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { USER_ROLE } from '@/lib/auth/constants';
import {
  ADMIN_USER_PROFILE_FIELDS,
  getAdminUserFormValues,
  toAdminUserPayload,
  validateAdminUserForm,
} from '@/lib/validation/adminUser';

function mapServerErrors(error) {
  if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
    return error.errors;
  }

  if (error instanceof ApiError && error.status === 409) {
    return {
      idNumber: error.message || 'משתמש עם תעודת זהות זו כבר קיים',
      email: error.message,
    };
  }

  return null;
}

export default function UserFormModal({ isOpen, onClose, user = null, onSaved }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState(() => getAdminUserFormValues(user));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(getAdminUserFormValues(user));
    setErrors({});
    setTouched({});
    setFormError('');
    setIsSubmitting(false);
  }, [isOpen, user]);

  function updateFieldError(name, nextValues) {
    const nextErrors = validateAdminUserForm(nextValues, { isEdit });
    setErrors((current) => {
      const updated = { ...current };

      if (nextErrors[name]) {
        updated[name] = nextErrors[name];
      } else {
        delete updated[name];
      }

      return updated;
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    if (touched[name]) {
      updateFieldError(name, nextValues);
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    updateFieldError(name, values);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const fieldNames = [
      ...ADMIN_USER_PROFILE_FIELDS.map((field) => field.name),
      'password',
      'role',
      'classId',
    ];
    setTouched(Object.fromEntries(fieldNames.map((name) => [name, true])));

    const nextErrors = validateAdminUserForm(values, { isEdit });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = toAdminUserPayload(values, { isEdit });
      const data = isEdit ? await updateUser(user._id, payload) : await createUser(payload);
      onSaved?.(data?.message || (isEdit ? 'פרטי המשתמש עודכנו בהצלחה' : 'המשתמש נוסף בהצלחה'));
      onClose?.();
    } catch (error) {
      const serverErrors = mapServerErrors(error);

      if (serverErrors) {
        setErrors(serverErrors);
        setFormError(
          serverErrors.idNumber ||
            serverErrors.email ||
            error.message ||
            'משתמש עם תעודת זהות זו כבר קיים',
        );
      } else {
        setFormError(error.message || 'אירעה שגיאה. נסו שוב.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const nameFields = ADMIN_USER_PROFILE_FIELDS.filter(
    (field) => field.name === 'firstName' || field.name === 'lastName',
  );
  const otherFields = ADMIN_USER_PROFILE_FIELDS.filter(
    (field) => field.name !== 'firstName' && field.name !== 'lastName',
  );

  return (
    <Modal
      open={isOpen}
      title={isEdit ? 'עריכת משתמש' : 'הוספת משתמש'}
      onClose={onClose}
      closeDisabled={isSubmitting}
      hideActions
      size="lg"
      align="start"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={isSubmitting}>
        {formError ? <Alert>{formError}</Alert> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {nameFields.map((field) => (
            <TextField
              key={field.name}
              {...field}
              required
              disabled={isSubmitting}
              value={values[field.name]}
              error={errors[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          ))}
        </div>

        {otherFields.map((field) => (
          <TextField
            key={field.name}
            {...field}
            required
            disabled={isSubmitting}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ))}

        <TextField
          name="password"
          label={isEdit ? 'סיסמה חדשה' : 'סיסמה'}
          type="password"
          autoComplete="new-password"
          dir="ltr"
          required={!isEdit}
          disabled={isSubmitting}
          value={values.password}
          error={errors.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {isEdit ? (
          <p className="-mt-2 text-xs text-muted">השאירו ריק כדי להשאיר את הסיסמה הקיימת</p>
        ) : null}

        <SelectField
          name="role"
          label="תפקיד"
          required
          disabled={isSubmitting}
          value={values.role}
          error={errors.role}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          {Object.values(USER_ROLE).map((role) => (
            <option key={role} value={role}>
              {USER_ROLE_LABELS[role]}
            </option>
          ))}
        </SelectField>

        <TextField
          name="classId"
          label="שיוך כיתתי"
          type="text"
          autoComplete="off"
          dir="ltr"
          disabled={isSubmitting}
          value={values.classId}
          error={errors.classId}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Spinner />
                שומר...
              </>
            ) : (
              'שמור'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
