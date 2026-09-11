'use client';

import { useState } from 'react';
import AdminMessagingForm from '@/components/admin/messages/AdminMessagingForm';
import MessagesInbox from '@/components/messages/MessagesInbox';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function MessagesManagementPanel({
  description = 'הודעות שנשלחו ושהתקבלו. לחצו על הפלוס כדי לשלוח הודעה חדשה.',
}) {
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });
  const [inboxReloadKey, setInboxReloadKey] = useState(0);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  function handleCloseCompose() {
    setIsComposeOpen(false);
  }

  function handleSuccess(message) {
    setIsComposeOpen(false);
    setToast({ open: true, message, variant: 'success' });
    setInboxReloadKey((current) => current + 1);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">הודעות</h1>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            aria-label="שליחת הודעה"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <PlusIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessagesInbox reloadKey={inboxReloadKey} />
        </div>
      </section>

      <Modal
        open={isComposeOpen}
        title="שליחת הודעה"
        onClose={handleCloseCompose}
        hideActions
        size="lg"
        align="start"
      >
        <AdminMessagingForm
          onSuccess={handleSuccess}
          onError={(message) => setToast({ open: true, message, variant: 'error' })}
        />
      </Modal>

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
    </div>
  );
}
