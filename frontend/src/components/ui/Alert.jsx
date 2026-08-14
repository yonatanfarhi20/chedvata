export default function Alert({ variant = 'error', children }) {
  const styles =
    variant === 'success'
      ? 'border-success bg-success/10 text-success'
      : 'border-error bg-error/10 text-error';

  return (
    <div role="alert" className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${styles}`}>
      {children}
    </div>
  );
}
