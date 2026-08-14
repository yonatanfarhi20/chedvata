export default function TextField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  required = false,
  disabled = false,
  dir,
  inputMode,
  maxLength,
}) {
  const inputId = id || name;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        dir={dir}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-card px-3 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? 'border-error focus:ring-2 focus:ring-error/20'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'
        }`}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
