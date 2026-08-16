'use client';

import { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import Sidebar from '@/components/layout/Sidebar';
import { ADMIN_ROLES } from '@/lib/auth/constants';

export default function AdminNavigationFrame({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <RequireAuth allowedRoles={[...ADMIN_ROLES]}>
      <div className="min-h-full bg-background">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="min-h-full lg:ps-72">{children}</div>
      </div>
    </RequireAuth>
  );
}
