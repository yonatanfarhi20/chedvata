export default function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  children,
}) {
  const selectId = id || name;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-card px-3 py-2.5 text-base text-foreground outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? 'border-error focus:ring-2 focus:ring-error/20'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'
        }`}
      >
        {children}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
