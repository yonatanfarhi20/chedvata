'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

const SIZE_STYLES = {
  md: 'max-w-md',
  lg: 'max-w-lg',
};

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
  closeDisabled = false,
  hideActions = false,
  size = 'md',
  align = 'center',
}) {
  const hasConfirm = typeof onConfirm === 'function';
  const isCloseLocked = confirmDisabled || closeDisabled;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;
  const isStartAligned = align === 'start';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isCloseLocked) {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, isCloseLocked]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={isCloseLocked ? undefined : onClose}
    >
      <div
        role={hasConfirm && !hideActions ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby="modal-description"
        className={`flex max-h-[min(90vh,44rem)] w-full flex-col overflow-hidden rounded-2xl bg-card p-6 shadow-xl ${sizeClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <h2
            id="modal-title"
            className={`mb-3 text-xl font-semibold text-foreground ${
              isStartAligned ? 'text-start' : 'text-center'
            }`}
          >
            {title}
          </h2>
        ) : null}
        <div
          id="modal-description"
          className={`min-h-0 flex-1 overflow-y-auto text-sm leading-6 text-foreground ${
            hideActions ? 'mb-0' : 'mb-6'
          } ${isStartAligned ? 'text-start' : 'text-center'}`}
        >
          {children}
        </div>
        {hideActions ? null : hasConfirm ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isCloseLocked}>
              {closeLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="inline-flex items-center justify-center"
            >
              {confirmLabel}
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={onClose} disabled={isCloseLocked}>
            {closeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
