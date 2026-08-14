'use client';

import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { ApiError } from '@/lib/api/client';
import { registerUser } from '@/lib/api/auth';
import {
  REGISTER_FIELDS,
  REGISTER_INITIAL_VALUES,
  validateRegisterField,
  validateRegisterForm,
} from '@/lib/validation/register';

function mapServerErrors(error) {
  if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
    return error.errors;
  }

  if (error instanceof ApiError && error.status === 409) {
    return {
      email: error.message,
      idNumber: error.message,
    };
  }

  return null;
}

export default function RegisterForm({ onSuccess }) {
  const [values, setValues] = useState(REGISTER_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateFieldError(name, nextValues) {
    const message = validateRegisterField(name, nextValues[name]);
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

    const nextTouched = Object.fromEntries(
      Object.keys(REGISTER_INITIAL_VALUES).map((name) => [name, true]),
    );
    setTouched(nextTouched);

    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(values);
      onSuccess?.(values.email.trim());
    } catch (error) {
      const serverErrors = mapServerErrors(error);

      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        setFormError(error.message || 'אירעה שגיאה. נסו שוב.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const nameFields = REGISTER_FIELDS.filter(
    (field) => field.name === 'firstName' || field.name === 'lastName',
  );
  const otherFields = REGISTER_FIELDS.filter(
    (field) => field.name !== 'firstName' && field.name !== 'lastName',
  );

  return (
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

      <Button type="submit" className="mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'שולח...' : 'צור חשבון'}
      </Button>
    </form>
  );
}
