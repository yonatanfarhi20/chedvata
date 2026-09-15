export default function ManagementDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-border" />
        <div className="mt-2 h-3 w-48 animate-pulse rounded bg-border" />
        <div className="mt-6 h-12 w-20 animate-pulse rounded bg-border" />
        <div className="mt-3 h-3 w-36 animate-pulse rounded bg-border" />
      </section>

      <section className="min-h-[420px] w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="h-4 w-36 animate-pulse rounded bg-border" />
            <div className="mt-2 h-3 w-52 animate-pulse rounded bg-border" />
          </div>
          <div className="h-10 w-44 animate-pulse rounded-xl bg-border" />
        </div>
        <div className="h-64 w-full animate-pulse rounded-xl bg-border" />
      </section>

      <section className="min-h-[420px] w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="h-4 w-36 animate-pulse rounded bg-border" />
            <div className="mt-2 h-3 w-52 animate-pulse rounded bg-border" />
          </div>
          <div className="h-10 w-44 animate-pulse rounded-xl bg-border" />
        </div>
        <div className="h-64 w-full animate-pulse rounded-xl bg-border" />
      </section>
    </div>
  );
}
