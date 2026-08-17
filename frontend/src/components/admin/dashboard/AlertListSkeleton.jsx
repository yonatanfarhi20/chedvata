function PulseLine({ className }) {
  return <div className={`animate-pulse rounded bg-border ${className}`} />;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-9 w-9 animate-pulse rounded-full bg-border" />
      <div className="min-w-0 flex-1">
        <PulseLine className="h-4 w-28" />
        <PulseLine className="mt-2 h-3 w-48 max-w-full" />
      </div>
    </div>
  );
}

export default function AlertListSkeleton({ rows = 3 }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <PulseLine className="h-4 w-32" />
        <PulseLine className="mt-2 h-3 w-44 max-w-full" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    </div>
  );
}
