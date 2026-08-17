export default function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-24 animate-pulse rounded bg-border" />
          <div className="mt-3 h-8 w-16 animate-pulse rounded bg-border" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-border" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-xl bg-border" />
      </div>
    </div>
  );
}
