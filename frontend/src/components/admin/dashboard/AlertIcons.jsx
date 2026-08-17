const iconClassName = 'h-5 w-5 shrink-0';

function Icon({ className = iconClassName, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function AlertBellIcon() {
  return (
    <Icon>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function ChevronLeftIcon() {
  return (
    <Icon className="h-4 w-4 shrink-0">
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  );
}

export function CheckCircleIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </Icon>
  );
}
