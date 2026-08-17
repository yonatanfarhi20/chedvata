const iconClassName = 'h-6 w-6';

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

export function PresentIcon() {
  return (
    <Icon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M16 11l2 2 4-4" />
    </Icon>
  );
}

export function LateIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function PhonesKpiIcon() {
  return (
    <Icon>
      <rect x="8" y="3" width="8" height="18" rx="2" />
      <path d="M11 6h2M12 18h.01" />
    </Icon>
  );
}

export function LeavesKpiIcon() {
  return (
    <Icon>
      <path d="M4 19V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M9 14l2 2 4-4" />
    </Icon>
  );
}

export const KPI_ICONS = {
  present: PresentIcon,
  late: LateIcon,
  phones: PhonesKpiIcon,
  leaves: LeavesKpiIcon,
};
