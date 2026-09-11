'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import StudentAutocomplete from '@/components/admin/students/StudentAutocomplete';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import { formatClassAffiliation, getRabbis } from '@/lib/admin/users';
import {
  buildMessagePayload,
  getLockedClassId,
  getMessageRecipientTypeLabels,
  getMessageRecipientTypes,
  getUniqueClassIds,
  MESSAGE_RECIPIENT_TYPE,
  validateMessageForm,
} from '@/lib/admin/messages';
import { getStudentId } from '@/lib/admin/students';
import { createMessage, getUsers } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { USER_ROLE, USER_STATUS } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

const INITIAL_VALUES = {
  recipientType: MESSAGE_RECIPIENT_TYPE.STUDENT,
  classId: '',
  subject: '',
  content: '',
};

function isActiveStudent(user) {
  return user?.role === USER_ROLE.STUDENT && user?.status === USER_STATUS.ACTIVE;
}

export default function AdminMessagingForm({ onSuccess, onError, className = '' }) {
  const user = useSession()?.user;
  const role = user?.role;
  const isRabbi = role === USER_ROLE.RABBI;
  const lockedClassId = getLockedClassId(user);
  const recipientTypes = getMessageRecipientTypes(role);
  const recipientTypeLabels = getMessageRecipientTypeLabels(role);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [errors, setErrors] = useState({});
  const [classIds, setClassIds] = useState([]);
  const [rabbis, setRabbis] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    if (isRabbi) {
      setIsLoadingClasses(false);
      setClassIds([]);
      setRabbis([]);
      setLoadError('');
      return undefined;
    }

    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    async function loadClasses() {
      try {
        const data = await getUsers();

        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        const users = Array.isArray(data?.users) ? data.users : [];
        setClassIds(getUniqueClassIds(users.filter(isActiveStudent)));
        setRabbis(getRabbis(users));
        setLoadError('');
      } catch (error) {
        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          return;
        }

        setClassIds([]);
        setRabbis([]);
        setLoadError(getErrorMessage(error, 'לא ניתן לטעון את רשימת השיעורים.'));
      } finally {
        if (requestId === loadRequestIdRef.current) {
          setIsLoadingClasses(false);
        }
      }
    }

    loadClasses();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [reloadKey, isRabbi]);

  const classOptions = useMemo(
    () =>
      classIds
        .map((classId) => ({
          value: classId,
          label: formatClassAffiliation(classId, rabbis),
        }))
        .sort((left, right) => left.label.localeCompare(right.label, 'he')),
    [classIds, rabbis],
  );

  function clearFieldError(name) {
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    clearFieldError(name);
  }

  function handleRecipientTypeChange(event) {
    const recipientType = event.target.value;
    setValues((current) => ({
      ...current,
      recipientType,
      classId:
        recipientType === MESSAGE_RECIPIENT_TYPE.CLASS ? lockedClassId || current.classId : '',
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.studentId;
      delete next.classId;
      return next;
    });

    if (recipientType !== MESSAGE_RECIPIENT_TYPE.STUDENT) {
      setSelectedStudent(null);
    }
  }

  function handleStudentSelect(student) {
    setSelectedStudent(student);
    clearFieldError('studentId');
  }

  function resetForm() {
    setValues(INITIAL_VALUES);
    setSelectedStudent(null);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const classId =
      values.recipientType === MESSAGE_RECIPIENT_TYPE.CLASS
        ? lockedClassId || values.classId
        : values.classId;

    const nextErrors = validateMessageForm({
      recipientType: values.recipientType,
      studentId: getStudentId(selectedStudent),
      classId,
      subject: values.subject,
      content: values.content,
    });

    if (isRabbi && values.recipientType === MESSAGE_RECIPIENT_TYPE.CLASS && !classId) {
      nextErrors.classId = 'לא הוגדר שיעור לחשבון זה';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const payload = buildMessagePayload({
      recipientType: values.recipientType,
      studentId: getStudentId(selectedStudent),
      classId,
      subject: values.subject,
      content: values.content,
    });

    try {
      const data = await createMessage(payload);
      resetForm();
      onSuccess?.(data?.message || 'ההודעה נשלחה בהצלחה');
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

      onError?.(getErrorMessage(error, 'שליחת ההודעה נכשלה. נסו שוב.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`flex flex-col gap-5 ${className}`.trim()}
      aria-busy={isSubmitting}
    >
      <SelectField
        id="message-recipient-type"
        name="recipientType"
        label="נמען"
        value={values.recipientType}
        onChange={handleRecipientTypeChange}
        disabled={isBusy}
        required
      >
        {recipientTypes.map((type) => (
          <option key={type} value={type}>
            {recipientTypeLabels[type]}
          </option>
        ))}
      </SelectField>

      {values.recipientType === MESSAGE_RECIPIENT_TYPE.STUDENT ? (
        <StudentAutocomplete
          id="message-student"
          selectedStudent={selectedStudent}
          onSelect={handleStudentSelect}
          error={errors.studentId}
          disabled={isBusy}
          required
        />
      ) : null}

      {values.recipientType === MESSAGE_RECIPIENT_TYPE.CLASS ? (
        isRabbi ? (
          lockedClassId ? (
            <p className="rounded-lg bg-background px-3 py-2 text-sm text-muted">
              ההודעה תישלח לכל תלמידי השיעור שלך.
            </p>
          ) : (
            <Alert>לא הוגדר שיעור לחשבון זה, לכן לא ניתן לשלוח לכל השיעור.</Alert>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {loadError ? (
              <div className="flex flex-col items-start gap-3">
                <Alert>{loadError}</Alert>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  onClick={() => {
                    setIsLoadingClasses(true);
                    setLoadError('');
                    setReloadKey((current) => current + 1);
                  }}
                >
                  נסה שוב
                </Button>
              </div>
            ) : null}

            <SelectField
              id="message-class"
              name="classId"
              label="שיעור"
              value={values.classId}
              onChange={handleChange}
              error={errors.classId}
              disabled={isBusy || isLoadingClasses || Boolean(loadError)}
              required
            >
              <option value="">{isLoadingClasses ? 'טוען שיעורים...' : 'בחרו שיעור'}</option>
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
        )
      ) : null}

      {values.recipientType === MESSAGE_RECIPIENT_TYPE.ALL ? (
        <p className="rounded-lg bg-background px-3 py-2 text-sm text-muted">
          ההודעה תישלח לכל באי הישיבה — צוות ותלמידים.
        </p>
      ) : null}

      <TextField
        id="message-subject"
        name="subject"
        label="נושא"
        value={values.subject}
        onChange={handleChange}
        error={errors.subject}
        required
        disabled={isBusy}
        autoComplete="off"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message-content" className="text-sm font-medium text-foreground">
          תוכן ההודעה
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <textarea
          id="message-content"
          name="content"
          value={values.content}
          onChange={handleChange}
          required
          disabled={isBusy}
          rows={8}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? 'message-content-error' : undefined}
          className={`min-h-40 w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.content
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'
          }`}
          placeholder="כתבו כאן את תוכן ההודעה..."
        />
        {errors.content ? (
          <p id="message-content-error" role="alert" className="text-sm font-medium text-error">
            {errors.content}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isBusy}
        className="inline-flex items-center justify-center gap-2 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            שולח הודעה...
          </>
        ) : (
          'שלח הודעה'
        )}
      </Button>
    </form>
  );
}
