'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { ApiError } from '@/lib/api/client';
import { resetPassword } from '@/lib/api/auth';
import {
  RESET_PASSWORD_FIELDS,
  RESET_PASSWORD_INITIAL_VALUES,
  validateResetPasswordField,
  validateResetPasswordForm,
} from '@/lib/validation/resetPassword';

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [values, setValues] = useState(RESET_PASSWORD_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setFieldErrors(nextValues, fieldNames) {
    setErrors((current) => {
      const nextErrors = { ...current };

      fieldNames.forEach((name) => {
        const message = validateResetPasswordField(name, nextValues[name], nextValues);
        if (message) {
          nextErrors[name] = message;
        } else {
          delete nextErrors[name];
        }
      });

      return nextErrors;
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    const fieldsToValidate = [];
    if (touched[name]) {
      fieldsToValidate.push(name);
    }
    if (name === 'password' && touched.confirmPassword) {
      fieldsToValidate.push('confirmPassword');
    }

    if (fieldsToValidate.length > 0) {
      setFieldErrors(nextValues, fieldsToValidate);
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setFieldErrors(values, [name]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextTouched = Object.fromEntries(
      Object.keys(RESET_PASSWORD_INITIAL_VALUES).map((name) => [name, true]),
    );
    setTouched(nextTouched);

    const nextErrors = validateResetPasswordForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, { password: values.password.trim() });
      router.replace('/login');
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
      } else {
        setFormError(error.message || 'אירעה שגיאה. נסו שוב.');
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={isSubmitting}>
      {formError ? <Alert>{formError}</Alert> : null}

      {RESET_PASSWORD_FIELDS.map((field) => (
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

      <Button type="submit" className="mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'שומר...' : 'שמור סיסמה'}
      </Button>
    </form>
  );
}
