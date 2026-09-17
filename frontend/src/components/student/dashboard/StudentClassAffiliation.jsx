export default function StudentClassAffiliation({ affiliation }) {
  const label = affiliation?.label || 'טרם שויכת לשיעור';
  const isAssigned = Boolean(affiliation?.isAssigned);

  return (
    <div
      className={`mt-3 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        isAssigned
          ? 'border-primary/15 bg-primary/10 text-primary'
          : 'border-border bg-card text-muted'
      }`}
      aria-label={`השיוך שלי: ${label}`}
    >
      <span className="font-medium">השיוך שלי:</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}
