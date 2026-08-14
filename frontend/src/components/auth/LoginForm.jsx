'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import {
  LOGIN_FIELDS,
  LOGIN_INITIAL_VALUES,
  validateLoginField,
  validateLoginForm,
} from '@/lib/validation/login';

export default function LoginForm() {
  const [values, setValues] = useState(LOGIN_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  function handleSubmit(event) {
    event.preventDefault();

    const nextTouched = Object.fromEntries(
      Object.keys(LOGIN_INITIAL_VALUES).map((name) => [name, true]),
    );
    setTouched(nextTouched);

    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {LOGIN_FIELDS.map((field) => (
        <TextField
          key={field.name}
          {...field}
          required
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

      <Button type="submit" className="mt-2">
        התחבר
      </Button>
    </form>
  );
}
