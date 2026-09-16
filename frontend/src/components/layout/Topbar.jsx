'use client';

import { useSession } from '@/lib/auth/session';
import { MenuIcon } from '@/components/layout/TopbarIcons';
import TopbarProfile from '@/components/layout/TopbarProfile';

export default function Topbar({ isSidebarOpen = false, toggleSidebar, profileHref }) {
  const user = useSession()?.user;

  return (
    <header className="z-20 shrink-0 border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-background lg:hidden"
          onClick={() => toggleSidebar?.()}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          aria-label={isSidebarOpen ? 'סגור תפריט ניווט' : 'פתח תפריט ניווט'}
        >
          <MenuIcon />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-center text-lg font-bold tracking-wide text-primary md:text-xl">
          ישיבת חדוותא
        </h1>

        <div className="relative shrink-0">
          <TopbarProfile user={user} profileHref={profileHref} />
        </div>
      </div>
    </header>
  );
}
