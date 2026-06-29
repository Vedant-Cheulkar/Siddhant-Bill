import { ChevronRight, FileText, Menu, Search } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/authStore';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';

function getPageLabel(pathname: string): string {
  if (pathname === '/')                           return 'Overview';
  if (pathname === '/invoices/new')               return 'New Invoice';
  if (pathname.startsWith('/invoices/'))          return 'Invoice Detail';
  if (pathname === '/invoices')                   return 'Invoices';
  if (pathname === '/customers/new')              return 'New Customer';
  if (pathname.startsWith('/customers/'))         return 'Customer';
  if (pathname === '/customers')                  return 'Customers';
  if (pathname === '/item-groups/new')            return 'New Product';
  if (pathname.startsWith('/item-groups/'))       return 'Edit Product';
  if (pathname === '/item-groups')                return 'Item Groups';
  if (pathname === '/work-orders/new')            return 'New Work Order';
  if (pathname.startsWith('/work-orders/'))       return 'Work Order';
  if (pathname === '/work-orders')                return 'Work Orders';
  if (pathname === '/reports')                    return 'Reports';
  if (pathname === '/settings')                   return 'Settings';
  return 'Overview';
}

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenMenu?: () => void;
}

export function Header({ onOpenSearch, onOpenMenu }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const companyName = useSettingsStore((s) => s.company.name);

  const initials = user?.fullName
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  const pageLabel = getPageLabel(location.pathname);

  return (
    <header className="h-14 flex items-center justify-between gap-3 px-4 lg:px-6 bg-surface border-b border-border shadow-[0_1px_3px_0_rgba(0,0,0,.04)] shrink-0 safe-top">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-bg text-muted hover:bg-bg-subtle hover:text-fg transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
          <ol className="flex items-center gap-1.5 min-w-0">
            <li className="min-w-0">
              <button
                onClick={() => navigate('/')}
                className="text-muted font-medium hover:text-fg transition-colors truncate max-w-[8rem] sm:max-w-none"
              >
                {companyName}
              </button>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} className="text-border-strong shrink-0" /></li>
            <li className="min-w-0"><span className="font-semibold text-fg truncate">{pageLabel}</span></li>
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-2 sm:px-3 sm:py-1.5 bg-bg border border-border rounded-lg text-xs text-muted hover:border-border-strong hover:text-fg transition-all"
          aria-label="Open search"
        >
          <Search size={14} className="sm:hidden" />
          <Search size={12} className="hidden sm:block" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden lg:inline-flex ml-1 items-center font-mono bg-surface border border-border rounded px-1 py-0.5 text-2xs">⌘K</kbd>
        </button>

        <Button size="sm" onClick={() => navigate('/invoices/new')} className="hidden sm:inline-flex">
          <FileText size={13} />
          <span className="hidden md:inline">New Invoice</span>
          <span className="md:hidden">New</span>
        </Button>

        <button
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm hover:shadow-md hover:scale-105 transition-all select-none ring-2 ring-white"
          aria-label="Account settings"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
