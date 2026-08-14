'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Modal({
  open,
  title,
  children,
  onClose,
  closeLabel = 'הבנתי',
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <h2 id="modal-title" className="mb-3 text-center text-xl font-semibold text-foreground">
            {title}
          </h2>
        ) : null}
        <div className="mb-6 text-center text-sm leading-6 text-foreground">{children}</div>
        <Button type="button" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
