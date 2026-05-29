import { Bell, ChevronDown, ChevronRight, FileText, Search } from 'lucide-react';
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
}

export function Header({ onOpenSearch }: HeaderProps) {
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
    <header className="h-14 flex items-center justify-between gap-4 px-6 bg-bg border-b border-border shrink-0">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
        <ol className="flex items-center gap-1.5">
          <li>
            <button
              onClick={() => navigate('/')}
              className="text-muted font-medium hover:text-fg transition-colors"
            >
              {companyName}
            </button>
          </li>
          <li aria-hidden="true"><ChevronRight size={12} className="text-muted shrink-0" /></li>
          <li><span className="font-semibold text-fg truncate">{pageLabel}</span></li>
        </ol>
      </nav>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-muted hover:border-border-strong hover:text-fg transition-all"
          aria-label="Open search"
        >
          <Search size={12} />
          <span>Search</span>
          <span className="ml-1 font-mono bg-bg border border-border rounded px-1 text-2xs">⌘K</span>
        </button>

        <Button size="sm" onClick={() => navigate('/invoices/new')}>
          <FileText size={13} />
          New Invoice
        </Button>

        <button
          className="flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium hover:bg-bg transition-all"
          aria-label="Select language"
        >
          EN <ChevronDown size={12} />
        </button>

        <button className="relative w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg hover:bg-bg transition-all" aria-label="Notifications">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full ring-1 ring-bg" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-white shadow-sm hover:bg-accent-hover transition-colors select-none"
          aria-label="Account settings"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
