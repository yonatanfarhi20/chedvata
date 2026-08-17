'use client';

import { useState } from 'react';
import StudentAutocomplete from '@/components/admin/students/StudentAutocomplete';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import { getTodayDateInputValue, validateLeaveForm } from '@/lib/admin/leaves';
import { getStudentId } from '@/lib/admin/students';
import { createLeave } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

const INITIAL_VALUES = {
  startDate: getTodayDateInputValue(),
  endDate: getTodayDateInputValue(),
  reason: '',
};

export default function LeaveAssignmentForm({ disabled = false, onSuccess, onError }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = disabled || isSubmitting;

  function resetForm() {
    setSelectedStudent(null);
    setValues({
      startDate: getTodayDateInputValue(),
      endDate: getTodayDateInputValue(),
      reason: '',
    });
    setErrors({});
  }

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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isBusy) {
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

    setIsSubmitting(true);

    try {
      const data = await createLeave({
        studentId,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim(),
      });

      resetForm();
      onSuccess?.(data?.message || 'החופשה נוספה בהצלחה');
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

      onError?.(getErrorMessage(error, 'הוספת החופשה נכשלה. נסו שוב.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"
      aria-busy={isSubmitting}
    >
      <StudentAutocomplete
        id="leave-student"
        selectedStudent={selectedStudent}
        onSelect={handleStudentSelect}
        error={errors.studentId}
        disabled={isBusy}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="leave-start-date"
          name="startDate"
          type="date"
          label="תאריך התחלה"
          value={values.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
          disabled={isBusy}
        />
        <TextField
          id="leave-end-date"
          name="endDate"
          type="date"
          label="תאריך סיום"
          value={values.endDate}
          onChange={handleChange}
          error={errors.endDate}
          required
          disabled={isBusy}
        />
      </div>

      <TextField
        id="leave-reason"
        name="reason"
        label="סיבת החופשה"
        value={values.reason}
        onChange={handleChange}
        error={errors.reason}
        disabled={isBusy}
        autoComplete="off"
      />

      <Button
        type="submit"
        disabled={isBusy}
        className="inline-flex items-center justify-center gap-2 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            שולח עדכון...
          </>
        ) : (
          'הוסף חופשה ושלח עדכון'
        )}
      </Button>
    </form>
  );
}
