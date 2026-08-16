'use client';

import { useEffect } from 'react';
import { ADMIN_NAV_ITEMS } from '@/lib/admin/nav';
import { CloseIcon } from '@/components/layout/SidebarIcons';
import SidebarNavItem from '@/components/layout/SidebarNavItem';

export default function Sidebar({ isOpen = false, closeSidebar }) {
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
        className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col bg-primary text-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
        aria-label="תפריט ניווט ראשי"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <p className="text-lg font-bold tracking-wide">ישיבת חדוותא</p>
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => closeSidebar?.()}
            aria-label="סגור תפריט ניווט"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="מודולי ניהול">
          {ADMIN_NAV_ITEMS.map((item) => (
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
