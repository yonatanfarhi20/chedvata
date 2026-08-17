'use client';

import { useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import Toast from '@/components/ui/Toast';
import { updateAdminPassword } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import {
  PASSWORD_CHANGE_INITIAL_VALUES,
  getPasswordMatchState,
  validatePasswordChangeField,
  validatePasswordChangeForm,
} from '@/lib/validation/adminPassword';

export default function SecuritySettingsCard() {
  const [values, setValues] = useState(PASSWORD_CHANGE_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { isMatch, isMismatch } = useMemo(
    () => getPasswordMatchState(values.newPassword, values.confirmPassword),
    [values.newPassword, values.confirmPassword],
  );

  const canSubmit =
    Boolean(values.oldPassword) &&
    values.newPassword.length >= 8 &&
    isMatch &&
    !isSubmitting;

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setFormError('');

    if (name === 'confirmPassword' || name === 'newPassword') {
      const matchState = getPasswordMatchState(nextValues.newPassword, nextValues.confirmPassword);
      setErrors((current) => ({
        ...current,
        confirmPassword: matchState.isMismatch ? 'הסיסמאות אינן תואמות' : '',
        ...(name === 'newPassword' && current.newPassword
          ? { newPassword: validatePasswordChangeField('newPassword', value, nextValues) }
          : {}),
      }));
      return;
    }

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validatePasswordChangeField(name, value, nextValues),
      }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;

    if (name === 'confirmPassword') {
      return;
    }

    setErrors((current) => ({
      ...current,
      [name]: validatePasswordChangeField(name, value, values),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validatePasswordChangeForm(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0 || !isMatch) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await updateAdminPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      setValues(PASSWORD_CHANGE_INITIAL_VALUES);
      setErrors({});
      setToastMessage(data?.message || 'הסיסמה עודכנה בהצלחה');
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
        setFormError(error.message || 'סיסמה שגויה');
        return;
      }

      setFormError(getErrorMessage(error, 'לא ניתן לעדכן את הסיסמה.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">הגדרות אבטחה</h2>
      <p className="mt-1 text-sm text-muted">החלפת סיסמת הגישה לחשבון המנהל</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5" aria-busy={isSubmitting}>
        {formError ? <Alert>{formError}</Alert> : null}

        <TextField
          name="oldPassword"
          label="סיסמה נוכחית"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
          disabled={isSubmitting}
          value={values.oldPassword}
          error={errors.oldPassword}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <TextField
          name="newPassword"
          label="סיסמה חדשה"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          required
          disabled={isSubmitting}
          value={values.newPassword}
          error={errors.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <TextField
          name="confirmPassword"
          label="אימות סיסמה חדשה"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          required
          disabled={isSubmitting}
          value={values.confirmPassword}
          error={isMismatch ? 'הסיסמאות אינן תואמות' : errors.confirmPassword}
          success={isMatch}
          onChange={handleChange}
        />

        <Button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              שומר...
            </>
          ) : (
            'שמור סיסמה חדשה'
          )}
        </Button>
      </form>

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage}
        variant="success"
        onClose={() => setToastMessage('')}
      />
    </section>
  );
}
