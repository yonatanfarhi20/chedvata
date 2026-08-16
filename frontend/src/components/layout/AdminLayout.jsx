'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useAdminSidebar } from '@/components/layout/useAdminSidebar';
import { ADMIN_ROLES } from '@/lib/auth/constants';

export default function AdminLayout({ children }) {
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useAdminSidebar();

  return (
    <RequireAuth allowedRoles={[...ADMIN_ROLES]}>
      <div className="h-dvh max-h-dvh overflow-hidden bg-background">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex h-full min-h-0 flex-col lg:ps-72">
          <Topbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
