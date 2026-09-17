const BADGE_VARIANTS = {
  neutral: 'border-border bg-background text-muted',
  info: 'border-primary/40 bg-primary/10 text-primary',
  success: 'border-success bg-success/10 text-success',
  error: 'border-error bg-error/10 text-error',
};

export default function Badge({ variant = 'neutral', className = '', children }) {
  const styles = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${styles} ${className}`}
    >
      {children}
    </span>
  );
}
