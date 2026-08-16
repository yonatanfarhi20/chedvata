function getUserDisplayName(user) {
  if (!user) {
    return '';
  }

  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
}

function getUserInitials(user) {
  const first = user?.firstName?.trim()?.[0] || '';
  const last = user?.lastName?.trim()?.[0] || '';
  const initials = `${first}${last}`;

  return initials ? initials.toUpperCase() : '?';
}

export default function TopbarProfile({ user }) {
  const fullName = getUserDisplayName(user) || 'מנהל';
  const initials = getUserInitials(user);
  const imageUrl = user?.profileImage;

  return (
    <div className="flex items-center gap-2.5">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      <span className="max-w-[10rem] truncate text-sm font-medium text-foreground max-sm:sr-only">
        {fullName}
      </span>
    </div>
  );
}
