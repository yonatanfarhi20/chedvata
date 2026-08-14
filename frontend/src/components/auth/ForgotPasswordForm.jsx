'use client';

import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { ApiError } from '@/lib/api/client';
import { requestPasswordReset } from '@/lib/api/auth';
import {
  FORGOT_PASSWORD_FIELDS,
  FORGOT_PASSWORD_INITIAL_VALUES,
  validateForgotPasswordField,
  validateForgotPasswordForm,
} from '@/lib/validation/forgotPassword';

const SUCCESS_MESSAGE = 'קישור נשלח למייל';

export default function ForgotPasswordForm() {
  const [values, setValues] = useState(FORGOT_PASSWORD_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateFieldError(name, nextValues) {
    const message = validateForgotPasswordField(name, nextValues[name]);
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
    setSuccessMessage('');

    const nextTouched = Object.fromEntries(
      Object.keys(FORGOT_PASSWORD_INITIAL_VALUES).map((name) => [name, true]),
    );
    setTouched(nextTouched);

    const nextErrors = validateForgotPasswordForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await requestPasswordReset(values);
      setSuccessMessage(data?.message || SUCCESS_MESSAGE);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
      } else {
        setFormError(error.message || 'אירעה שגיאה. נסו שוב.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={isSubmitting}>
      {successMessage ? <Alert variant="success">{successMessage}</Alert> : null}
      {formError ? <Alert>{formError}</Alert> : null}

      {FORGOT_PASSWORD_FIELDS.map((field) => (
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
        {isSubmitting ? 'שולח...' : 'שלח קישור לאיפוס'}
      </Button>
    </form>
  );
}
