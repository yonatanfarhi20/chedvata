'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-xl">
        <h2 className="mb-3 text-xl font-semibold text-foreground">אירעה שגיאה</h2>
        <p className="mb-6 text-sm text-muted">לא ניתן להציג את המסך כרגע. נסו שוב.</p>
        <Button type="button" onClick={() => retry()}>
          נסה שוב
        </Button>
      </div>
    </div>
  );
}
