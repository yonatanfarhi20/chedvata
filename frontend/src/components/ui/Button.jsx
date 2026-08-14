const VARIANT_STYLES = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  success: 'bg-success text-white hover:bg-success-hover',
  danger: 'bg-error text-white hover:bg-error-hover',
};

const SIZE_STYLES = {
  md: 'px-4 py-3 text-base',
  sm: 'px-3 py-1.5 text-sm',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  disabled = false,
  className = '',
  ...props
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        fullWidth ? 'w-full' : ''
      } ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
