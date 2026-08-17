function SummaryStat({ label, value, valueClassName = 'text-foreground' }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3 text-center shadow-sm sm:px-4">
      <p className={`text-xl font-bold tabular-nums sm:text-2xl ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium text-muted sm:text-xs">{label}</p>
    </div>
  );
}

export default function PhoneDepositSummaryBar({ total = 0, deposited = 0, alerts = 0 }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-3 backdrop-blur">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <SummaryStat label="סך התלמידים" value={total} />
        <SummaryStat
          label="הופקדו"
          value={deposited}
          valueClassName="text-success"
        />
        <SummaryStat
          label="חריגים"
          value={alerts}
          valueClassName={alerts > 0 ? 'text-error' : 'text-foreground'}
        />
      </div>
    </div>
  );
}
