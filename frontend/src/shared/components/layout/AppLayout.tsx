import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '@shared/components/widgets/CommandPalette';
import { useOrgSettings } from '@features/settings/hooks/useOrgSettings';

export function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  useOrgSettings();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg">
      <Sidebar className="hidden lg:flex min-h-screen" />

      {mobileNavOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <Sidebar
            className="fixed inset-y-0 left-0 z-50 min-h-full shadow-xl lg:hidden"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenMenu={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 safe-bottom">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
