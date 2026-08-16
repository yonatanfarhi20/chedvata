'use client';

import { useEffect } from 'react';

const VARIANT_STYLES = {
  success: 'border-success bg-success text-white',
  error: 'border-error bg-error text-white',
};

export default function Toast({ open, message, variant = 'success', onClose }) {
  useEffect(() => {
    if (!open || !message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [open, message, onClose]);

  if (!open || !message) {
    return null;
  }

  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.success;

  return (
    <div
      role="status"
      className={`fixed inset-inline-end-4 bottom-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${variantClass}`}
    >
      {message}
    </div>
  );
}
