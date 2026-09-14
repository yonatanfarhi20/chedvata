'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import { requestVacation } from '@/lib/api/vacations';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import {
  getTomorrowDateInputValue,
  validateVacationRequest,
} from '@/lib/student/vacations';

const INITIAL_VALUES = {
  startDate: '',
  endDate: '',
  reason: '',
};

export default function VacationRequestModal({
  open,
  remainingDays = 0,
  vacations = [],
  onClose,
  onSuccess,
}) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = useMemo(
    () =>
      validateVacationRequest({
        startDate: values.startDate,
        endDate: values.endDate,
        remainingDays,
        vacations,
      }),
    [remainingDays, vacations, values.endDate, values.startDate],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const tomorrow = getTomorrowDateInputValue();
    setValues({
      startDate: tomorrow,
      endDate: tomorrow,
      reason: '',
    });
    setErrors({});
    setFormError('');
    setIsSubmitting(false);
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name] && !current.quota && !current.overlap) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      delete next.quota;
      delete next.overlap;
      return next;
    });
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || validation.isBlocked) {
      setErrors(validation.errors);
      return;
    }

    setErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const data = await requestVacation({
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim(),
      });

      onSuccess?.(data?.message || 'בקשת החופשה נשלחה בהצלחה');
      onClose?.();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      const fieldErrors =
        error instanceof ApiError && error.errors && typeof error.errors === 'object'
          ? error.errors
          : {};

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }

      setFormError(getErrorMessage(error, 'שליחת בקשת החופשה נכשלה. נסו שוב.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="הגשת בקשת חופשה" onClose={onClose} hideActions size="lg" align="start">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError ? <Alert>{formError}</Alert> : null}
        {validation.exceedsQuota ? <Alert>{validation.errors.quota}</Alert> : null}
        {validation.hasOverlap ? <Alert>{validation.errors.overlap}</Alert> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="vacation-start-date"
            name="startDate"
            type="date"
            label="תאריך התחלה"
            value={values.startDate}
            onChange={handleChange}
            error={errors.startDate || (values.startDate ? validation.errors.startDate : undefined)}
            required
            disabled={isSubmitting}
            min={getTomorrowDateInputValue()}
          />
          <TextField
            id="vacation-end-date"
            name="endDate"
            type="date"
            label="תאריך סיום"
            value={values.endDate}
            onChange={handleChange}
            error={errors.endDate || (values.endDate ? validation.errors.endDate : undefined)}
            required
            disabled={isSubmitting}
            min={values.startDate || getTomorrowDateInputValue()}
          />
        </div>

        <TextField
          id="vacation-reason"
          name="reason"
          label="סיבת החופשה"
          value={values.reason}
          onChange={handleChange}
          error={errors.reason}
          disabled={isSubmitting}
          autoComplete="off"
        />

        <p className="text-sm text-muted">
          יתרה זמינה: {remainingDays} ימים
          {validation.requestedDays > 0 ? ` · הבקשה כוללת ${validation.requestedDays} ימים` : ''}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || validation.isBlocked}
            className="inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                שולח בקשה...
              </>
            ) : (
              'שלח בקשה'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
