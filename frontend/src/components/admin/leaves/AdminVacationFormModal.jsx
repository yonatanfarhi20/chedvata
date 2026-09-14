'use client';

import { useEffect, useState } from 'react';
import StudentAutocomplete from '@/components/admin/students/StudentAutocomplete';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import {
  getTodayDateInputValue,
  isVacationQuotaExceeded,
  validateLeaveForm,
} from '@/lib/admin/leaves';
import { getStudentId } from '@/lib/admin/students';
import { createAdminVacation } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

const INITIAL_VALUES = {
  startDate: '',
  endDate: '',
  reason: '',
};

export default function AdminVacationFormModal({ open, onClose, onSuccess }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [quotaWarning, setQuotaWarning] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    const today = getTodayDateInputValue();
    setSelectedStudent(null);
    setValues({
      startDate: today,
      endDate: today,
      reason: '',
    });
    setErrors({});
    setFormError('');
    setIsSubmitting(false);
    setPendingPayload(null);
    setQuotaWarning('');
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
    setFormError('');
  }

  function handleStudentSelect(student) {
    setSelectedStudent(student);
    setErrors((current) => {
      if (!current.studentId) {
        return current;
      }

      const next = { ...current };
      delete next.studentId;
      return next;
    });
    setFormError('');
  }

  async function submitPayload(payload) {
    setIsSubmitting(true);
    setFormError('');

    try {
      const data = await createAdminVacation(payload);
      onSuccess?.(data?.message || 'החופשה נוספה בהצלחה');
      onClose?.();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      if (isVacationQuotaExceeded(error) && !payload.overrideLimit) {
        setPendingPayload(payload);
        setQuotaWarning(
          error.message || 'התאריכים חורגים ממכסת ימי החופשה של התלמיד. האם לאשר בכל זאת?',
        );
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

      setFormError(getErrorMessage(error, 'הוספת החופשה נכשלה. נסו שוב.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const studentId = getStudentId(selectedStudent);
    const nextErrors = validateLeaveForm({
      studentId,
      startDate: values.startDate,
      endDate: values.endDate,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await submitPayload({
      studentId,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason.trim(),
      overrideLimit: false,
    });
  }

  async function handleOverrideConfirm() {
    if (!pendingPayload) {
      return;
    }

    const payload = { ...pendingPayload, overrideLimit: true };
    setPendingPayload(null);
    setQuotaWarning('');
    await submitPayload(payload);
  }

  return (
    <>
      <Modal
        open={open && !quotaWarning}
        title="הוספת חופשה יזומה"
        onClose={onClose}
        hideActions
        size="lg"
        align="start"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {formError ? <Alert>{formError}</Alert> : null}

          <StudentAutocomplete
            id="admin-vacation-student"
            selectedStudent={selectedStudent}
            onSelect={handleStudentSelect}
            error={errors.studentId}
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              id="admin-vacation-start-date"
              name="startDate"
              type="date"
              label="תאריך התחלה"
              value={values.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
              disabled={isSubmitting}
            />
            <TextField
              id="admin-vacation-end-date"
              name="endDate"
              type="date"
              label="תאריך סיום"
              value={values.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
              disabled={isSubmitting}
            />
          </div>

          <TextField
            id="admin-vacation-reason"
            name="reason"
            label="סיבת החופשה"
            value={values.reason}
            onChange={handleChange}
            error={errors.reason}
            disabled={isSubmitting}
            autoComplete="off"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  שומר חופשה...
                </>
              ) : (
                'הוסף חופשה'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(quotaWarning)}
        title="חריגה ממכסת החופשה"
        onClose={() => {
          if (isSubmitting) {
            return;
          }

          setPendingPayload(null);
          setQuotaWarning('');
        }}
        closeLabel="ביטול"
        confirmLabel="אשר בכל זאת"
        confirmVariant="danger"
        onConfirm={handleOverrideConfirm}
        confirmDisabled={isSubmitting}
        closeDisabled={isSubmitting}
      >
        <p>{quotaWarning}</p>
      </Modal>
    </>
  );
}
