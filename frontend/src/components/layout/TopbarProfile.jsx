'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, LogoutIcon, UserIcon } from '@/components/layout/TopbarIcons';
import { clearSession } from '@/lib/auth/session';

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

function ProfileAvatar({ user, initials }) {
  const imageUrl = user?.profileImage;

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
      />
    );
  }

  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function TopbarProfile({ user }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fullName = getUserDisplayName(user) || 'מנהל';
  const initials = getUserInitials(user);

  useEffect(() => {
    if (!isDropdownOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  function handleToggle() {
    setIsDropdownOpen((open) => !open);
  }

  function handleLogout() {
    setIsDropdownOpen(false);
    clearSession();
    router.push('/login');
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-background"
        onClick={handleToggle}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
        aria-label="תפריט משתמש"
      >
        <ProfileAvatar user={user} initials={initials} />
        <span className="max-w-[10rem] truncate text-sm font-medium text-foreground max-sm:sr-only">
          {fullName}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isDropdownOpen ? (
        <div
          role="menu"
          aria-label="תפריט משתמש"
          className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <Link
            href="/admin/profile"
            role="menuitem"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <UserIcon />
            עריכת פרופיל
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-background"
          >
            <LogoutIcon />
            התנתק
          </button>
        </div>
      ) : null}
    </div>
  );
}
