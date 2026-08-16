'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth/session';
import { MenuIcon } from '@/components/layout/TopbarIcons';
import TopbarProfile from '@/components/layout/TopbarProfile';
import TopbarSearch from '@/components/layout/TopbarSearch';

export default function Topbar({ isSidebarOpen = false, toggleSidebar }) {
  const user = useSession()?.user;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="z-20 shrink-0 border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-background lg:hidden"
          onClick={() => toggleSidebar?.()}
          aria-expanded={isSidebarOpen}
          aria-controls="admin-sidebar"
          aria-label={isSidebarOpen ? 'סגור תפריט ניווט' : 'פתח תפריט ניווט'}
        >
          <MenuIcon />
        </button>

        <div className="flex min-w-0 flex-1 justify-center">
          <TopbarSearch
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="shrink-0">
          <TopbarProfile user={user} />
        </div>
      </div>
    </header>
  );
}
