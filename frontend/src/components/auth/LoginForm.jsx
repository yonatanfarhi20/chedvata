'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TextField from '@/components/ui/TextField';
import { ApiError } from '@/lib/api/client';
import { loginUser } from '@/lib/api/auth';
import { USER_STATUS, getDashboardPath } from '@/lib/auth/constants';
import { saveSession } from '@/lib/auth/session';
import {
  LOGIN_FIELDS,
  LOGIN_INITIAL_VALUES,
  validateLoginField,
  validateLoginForm,
} from '@/lib/validation/login';

function getStatusNotice(error) {
  if (!(error instanceof ApiError)) {
    return null;
  }

  if (error.code === USER_STATUS.PENDING_EMAIL_VERIFICATION) {
    return {
      title: 'חשבון טרם אומת',
      message: error.message,
    };
  }

  if (error.code === USER_STATUS.PENDING_ADMIN_APPROVAL) {
    return {
      title: 'ממתין לאישור הנהלה',
      message: error.message,
    };
  }

  return null;
}

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState(LOGIN_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [statusNotice, setStatusNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateFieldError(name, nextValues) {
    const message = validateLoginField(name, nextValues[name]);
    setErrors((current) => {
      const nextErrors = { ...current };
      if (message) {
        nextErrors[name] = message;
      } else {
        delete nextErrors[name];
      }
      return nextErrors;
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
    setStatusNotice(null);

    const nextTouched = Object.fromEntries(
      Object.keys(LOGIN_INITIAL_VALUES).map((name) => [name, true]),
    );
    setTouched(nextTouched);

    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginUser(values);
      saveSession({ token: data.token, user: data.user });
      router.push(getDashboardPath(data.user.role));
    } catch (error) {
      const notice = getStatusNotice(error);

      if (notice) {
        setStatusNotice(notice);
      } else if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
      } else {
        setFormError(error.message || 'אירעה שגיאה. נסו שוב.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={isSubmitting}>
        {formError ? <Alert>{formError}</Alert> : null}

        {LOGIN_FIELDS.map((field) => (
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

        <p className="text-start text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline underline-offset-4"
          >
            שכחתי סיסמא
          </Link>
        </p>

        <Button type="submit" className="mt-2" disabled={isSubmitting}>
          {isSubmitting ? 'מתחבר...' : 'התחבר'}
        </Button>
      </form>

      <Modal
        open={Boolean(statusNotice)}
        title={statusNotice?.title}
        onClose={() => setStatusNotice(null)}
      >
        {statusNotice?.message}
      </Modal>
    </>
  );
}
