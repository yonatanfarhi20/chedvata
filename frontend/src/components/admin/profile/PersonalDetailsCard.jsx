'use client';

import { useEffect, useRef, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import TextField from '@/components/ui/TextField';
import Toast from '@/components/ui/Toast';
import { getAdminProfile, updateAdminProfile } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { updateSessionUser } from '@/lib/auth/session';
import {
  ADMIN_PROFILE_INITIAL_VALUES,
  getAdminProfileFormValues,
  validateAdminProfileField,
  validateAdminProfileForm,
} from '@/lib/validation/adminProfile';

const MAX_IMAGE_BYTES = 1024 * 1024;

function getInitials(user) {
  const first = user?.firstName?.trim()?.[0] || '';
  const last = user?.lastName?.trim()?.[0] || '';
  const initials = `${first}${last}`;

  return initials ? initials.toUpperCase() : '?';
}

export default function PersonalDetailsCard() {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [values, setValues] = useState(ADMIN_PROFILE_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState('');
  const [imageChanged, setImageChanged] = useState(false);
  const [imageError, setImageError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError('');

      try {
        const data = await getAdminProfile();
        if (!isActive) {
          return;
        }

        const profileUser = data?.user || null;
        setUser(profileUser);
        setValues(getAdminProfileFormValues(profileUser));
        setPreviewImage(profileUser?.profileImage || '');
        setImageChanged(false);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          return;
        }

        setLoadError(getErrorMessage(error, 'לא ניתן לטעון את פרטי הפרופיל.'));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFormError('');

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validateAdminProfileField(name, value),
      }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors((current) => ({
      ...current,
      [name]: validateAdminProfileField(name, value),
    }));
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('יש לבחור קובץ תמונה');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('גודל התמונה חייב להיות עד 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setPreviewImage(result);
      setImageChanged(true);
      setImageError('');
    };
    reader.onerror = () => {
      setImageError('לא ניתן לקרוא את קובץ התמונה');
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateAdminProfileForm(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0 || imageError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        phone: values.phone.trim(),
        address: values.address.trim(),
      };

      if (imageChanged) {
        payload.profileImage = previewImage;
      }

      const data = await updateAdminProfile(payload);
      const updatedUser = data?.user || null;

      if (updatedUser) {
        setUser(updatedUser);
        setValues(getAdminProfileFormValues(updatedUser));
        setPreviewImage(updatedUser.profileImage || '');
        setImageChanged(false);
        updateSessionUser(updatedUser);
      }

      setToastMessage(data?.message || 'הפרטים האישיים עודכנו בהצלחה');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
        return;
      }

      setFormError(getErrorMessage(error, 'לא ניתן לשמור את הפרטים האישיים.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const initials = getInitials(user);
  const isBusy = isLoading || isSubmitting;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">פרטים אישיים</h2>
      <p className="mt-1 text-sm text-muted">עדכון מספר טלפון, כתובת ותמונת פרופיל</p>

      {loadError ? (
        <div className="mt-4">
          <Alert>{loadError}</Alert>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5" aria-busy={isBusy}>
        <div className="flex flex-col items-center gap-3">
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage}
              alt="תמונת פרופיל"
              className="h-28 w-28 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span
              className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-white"
              aria-hidden="true"
            >
              {isLoading ? '' : initials}
            </span>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
            disabled={isBusy}
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth={false}
            disabled={isBusy}
            onClick={handleUploadClick}
          >
            העלה תמונה
          </Button>

          {imageError ? (
            <p role="alert" className="text-sm font-medium text-error">
              {imageError}
            </p>
          ) : null}
        </div>

        {formError ? <Alert>{formError}</Alert> : null}

        <TextField
          name="phone"
          label="מספר טלפון"
          type="tel"
          autoComplete="tel"
          dir="ltr"
          required
          disabled={isBusy}
          value={values.phone}
          error={errors.phone}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <TextField
          name="address"
          label="כתובת"
          type="text"
          autoComplete="street-address"
          required
          disabled={isBusy}
          value={values.address}
          error={errors.address}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <Button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              שומר...
            </>
          ) : (
            'שמור פרטים אישיים'
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
