export default function RabbiDashboardSkeleton() {
  return (
    <section
      className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
      aria-hidden="true"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="h-4 w-36 animate-pulse rounded bg-border" />
          <div className="mt-2 h-3 w-52 animate-pulse rounded bg-border" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded-xl bg-border" />
      </div>
      <div className="mt-6 h-64 w-full animate-pulse rounded-xl bg-border" />
    </section>
  );
}
