const iconClassName = 'h-5 w-5 shrink-0';

function Icon({ children, className = iconClassName }) {
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

export function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function SearchIcon() {
  return (
    <Icon className="h-4 w-4 shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  );
}

export function ChevronDownIcon({ className = 'h-4 w-4 shrink-0' }) {
  return (
    <Icon className={className}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function UserIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19.5c1.6-3.2 4-4.75 7-4.75s5.4 1.55 7 4.75" />
    </Icon>
  );
}

export function LogoutIcon() {
  return (
    <Icon>
      <path d="M15 12H4" />
      <path d="M11 8l4 4-4 4" />
      <path d="M15 5h3a2 2 0 012 2v10a2 2 0 01-2 2h-3" />
    </Icon>
  );
}
