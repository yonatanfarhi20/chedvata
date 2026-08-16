'use client';

import { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { ADMIN_ROLES } from '@/lib/auth/constants';

export default function AdminNavigationFrame({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen((open) => !open);
  }

  return (
    <RequireAuth allowedRoles={[...ADMIN_ROLES]}>
      <div className="min-h-full bg-background">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex min-h-full flex-col lg:ps-72">
          <Topbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
