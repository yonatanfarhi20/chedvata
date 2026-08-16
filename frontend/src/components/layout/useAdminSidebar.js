'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

export function useAdminSidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarPath, setSidebarPath] = useState(pathname);

  if (sidebarPath !== pathname) {
    setSidebarPath(pathname);
    setIsSidebarOpen(false);
  }

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((open) => !open);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    function handleChange(event) {
      if (event.matches) {
        closeSidebar();
      }
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [closeSidebar]);

  return { isSidebarOpen, closeSidebar, toggleSidebar };
}
