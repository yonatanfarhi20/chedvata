'use client';

import MessagesInbox from '@/components/messages/MessagesInbox';

export default function MessagesInboxPanel() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">הודעות</h1>
          <p className="mt-1 text-sm text-muted">
            הודעות שנשלחו אליכם אישית, לשיעור שלכם, או לכל הישיבה.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessagesInbox />
        </div>
      </section>
    </div>
  );
}
