'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useAdminSidebar } from '@/components/layout/useAdminSidebar';

export default function AppShell({ children, allowedRoles, navItems, profileHref }) {
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useAdminSidebar();

  return (
    <RequireAuth allowedRoles={allowedRoles}>
      <div className="h-dvh max-h-dvh overflow-hidden bg-background">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} items={navItems} />
        <div className="flex h-full min-h-0 flex-col lg:ms-72">
          <Topbar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            profileHref={profileHref}
          />
          <main
            className={`min-h-0 flex-1 overscroll-y-contain ${
              isSidebarOpen ? 'overflow-hidden lg:overflow-y-auto' : 'overflow-y-auto'
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
