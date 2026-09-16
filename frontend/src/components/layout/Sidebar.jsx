'use client';

import { useEffect } from 'react';
import { getVisibleAdminNavItems } from '@/lib/admin/nav';
import { CloseIcon } from '@/components/layout/SidebarIcons';
import SidebarNavItem from '@/components/layout/SidebarNavItem';
import { useSession } from '@/lib/auth/session';

export default function Sidebar({ isOpen = false, closeSidebar, items }) {
  const role = useSession()?.user?.role;
  const navItems = items ?? getVisibleAdminNavItems(role);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeSidebar?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSidebar]);

  return (
    <>
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="סגור תפריט ניווט"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => closeSidebar?.()}
      />

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col bg-primary text-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full'
        }`}
        aria-label="תפריט ניווט ראשי"
      >
        <div className="flex items-center justify-end px-5 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => closeSidebar?.()}
            aria-label="סגור תפריט ניווט"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="ניווט ראשי">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onNavigate={() => closeSidebar?.()}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
