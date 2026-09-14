'use client';

export default function StudentVacationsPanel() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">בקשת חופשה</h1>
          <p className="mt-1 text-sm text-muted">
            צפייה במכסת החופשות השנתית והגשת בקשות במסגרת הימים שנותרו.
          </p>
        </header>
      </section>
    </div>
  );
}
