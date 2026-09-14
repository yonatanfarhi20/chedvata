function CardSkeleton({ className = '' }) {
  return (
    <div className={`min-h-[280px] rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="h-4 w-32 animate-pulse rounded bg-border" />
      <div className="mt-2 h-3 w-48 animate-pulse rounded bg-border" />
      <div className="mt-8 flex flex-1 items-center justify-center">
        <div className="h-36 w-36 animate-pulse rounded-full bg-border" />
      </div>
    </div>
  );
}

export default function StudentDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-hidden="true">
      <CardSkeleton />
      <CardSkeleton className="xl:col-span-2" />
      <CardSkeleton className="xl:col-span-3 min-h-[320px]" />
    </div>
  );
}
