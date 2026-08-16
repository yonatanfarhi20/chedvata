const iconClassName = 'h-5 w-5 shrink-0';

function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  );
}

export function AttendanceIcon() {
  return (
    <Icon>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </Icon>
  );
}

export function PhonesIcon() {
  return (
    <Icon>
      <rect x="8" y="3" width="8" height="18" rx="2" />
      <path d="M11 6h2M12 18h.01" />
    </Icon>
  );
}

export function LeavesIcon() {
  return (
    <Icon>
      <path d="M4 19V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M9 14l2 2 4-4" />
    </Icon>
  );
}

export function MessagesIcon() {
  return (
    <Icon>
      <path d="M4 6h16v10a2 2 0 0 1-2 2H8l-4 3V6Z" />
    </Icon>
  );
}

export function UsersIcon() {
  return (
    <Icon>
      <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="9.5" cy="7.5" r="2.5" />
      <path d="M21 19v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a2.5 2.5 0 0 1 0 4.74" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export const SIDEBAR_ICONS = {
  dashboard: DashboardIcon,
  users: UsersIcon,
  attendance: AttendanceIcon,
  phones: PhonesIcon,
  leaves: LeavesIcon,
  messages: MessagesIcon,
};
