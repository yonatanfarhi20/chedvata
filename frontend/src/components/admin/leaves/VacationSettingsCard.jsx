'use client';

import { useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import { updateVacationSettings } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

export default function VacationSettingsCard({ defaultVacationDays, disabled = false, onSaved, onError }) {
  const [value, setValue] = useState(String(defaultVacationDays ?? ''));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValue(String(defaultVacationDays ?? ''));
    setError('');
  }, [defaultVacationDays]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || disabled) {
      return;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 365) {
      setError('יש להזין מספר שלם בין 0 ל-365');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = await updateVacationSettings({ defaultVacationDays: parsed });
      onSaved?.(data?.settings?.defaultVacationDays ?? parsed, data?.message);
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 401) {
        return;
      }

      const fieldError = saveError instanceof ApiError ? saveError.errors?.defaultVacationDays : '';
      if (fieldError) {
        setError(fieldError);
        return;
      }

      onError?.(getErrorMessage(saveError, 'עדכון מכסת החופשה נכשל. נסו שוב.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">הגדרות חופשה</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        עדכון מכסת ימי החופשה השנתית לכלל התלמידים בישיבה.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:max-w-xs">
        {error ? <Alert>{error}</Alert> : null}
        <TextField
          id="vacation-annual-quota"
          name="defaultVacationDays"
          type="number"
          label="מכסת ימים שנתית"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError('');
          }}
          error=""
          required
          disabled={disabled || isSubmitting}
          inputMode="numeric"
        />
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          fullWidth={false}
          className="inline-flex items-center justify-center gap-2 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              שומר...
            </>
          ) : (
            'שמור מכסה'
          )}
        </Button>
      </form>
    </section>
  );
}
