export default function DashboardSectionCard({ title, description, children, className = '' }) {
  return (
    <section
      className={`flex min-h-[280px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
