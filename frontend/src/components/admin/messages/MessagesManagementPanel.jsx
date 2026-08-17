'use client';

import { useState } from 'react';
import AdminMessagingForm from '@/components/admin/messages/AdminMessagingForm';
import Toast from '@/components/ui/Toast';

export default function MessagesManagementPanel() {
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">הודעות</h1>
          <p className="mt-1 text-sm text-muted">
            שלחו הודעה ממוקדת לתלמיד בודד או לשיעור שלם. ההודעה תופיע בתיבת הדואר של התלמיד.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <AdminMessagingForm
            onSuccess={(message) => setToast({ open: true, message, variant: 'success' })}
            onError={(message) => setToast({ open: true, message, variant: 'error' })}
          />
        </div>
      </section>

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
    </div>
  );
}
