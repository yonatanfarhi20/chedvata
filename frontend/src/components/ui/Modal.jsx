'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Modal({
  open,
  title,
  children,
  onClose,
  closeLabel = 'הבנתי',
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  confirmDisabled = false,
}) {
  const hasConfirm = typeof onConfirm === 'function';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !confirmDisabled) {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, confirmDisabled]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={confirmDisabled ? undefined : onClose}
    >
      <div
        role={hasConfirm ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby="modal-description"
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <h2 id="modal-title" className="mb-3 text-center text-xl font-semibold text-foreground">
            {title}
          </h2>
        ) : null}
        <div id="modal-description" className="mb-6 text-center text-sm leading-6 text-foreground">
          {children}
        </div>
        {hasConfirm ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} disabled={confirmDisabled}>
              {closeLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={onClose}>
            {closeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
