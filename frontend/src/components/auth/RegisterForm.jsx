'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import {
  REGISTER_FIELDS,
  REGISTER_INITIAL_VALUES,
  validateRegisterField,
  validateRegisterForm,
} from '@/lib/validation/register';

export default function RegisterForm({ onSubmit }) {
  const [values, setValues] = useState(REGISTER_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  function handleSubmit(event) {
    event.preventDefault();

    const nextTouched = Object.fromEntries(
      Object.keys(REGISTER_INITIAL_VALUES).map((name) => [name, true]),
    );
    setTouched(nextTouched);

    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit?.(values);
  }

  const nameFields = REGISTER_FIELDS.filter(
    (field) => field.name === 'firstName' || field.name === 'lastName',
  );
  const otherFields = REGISTER_FIELDS.filter(
    (field) => field.name !== 'firstName' && field.name !== 'lastName',
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {nameFields.map((field) => (
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
      </div>

      {otherFields.map((field) => (
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

      <Button type="submit" className="mt-2">
        צור חשבון
      </Button>
    </form>
  );
}
