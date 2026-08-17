'use client';

import { useState } from 'react';
import LeaveAssignmentForm from '@/components/admin/leaves/LeaveAssignmentForm';
import Toast from '@/components/ui/Toast';

export default function LeavesManagementPanel() {
  const [toast, setToast] = useState({ open: false, message: '', variant: 'success' });

  function handleCloseToast() {
    setToast({ open: false, message: '', variant: 'success' });
  }

  function handleSuccess(message) {
    setToast({ open: true, message, variant: 'success' });
  }

  function handleError(message) {
    setToast({ open: true, message, variant: 'error' });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">חופשות</h1>
          <p className="mt-1 text-sm text-muted">
            הוסיפו ימי חופשה יזומים לתלמיד. לאחר השמירה יישלח עדכון אוטומטי לתיבת ההודעות שלו.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <LeaveAssignmentForm onSuccess={handleSuccess} onError={handleError} />
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
