import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Wrench, Users,
  FileText, BarChart2, Settings, LogOut, Search,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useAuthStore } from '@features/auth/store/authStore';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';
import { useMutation } from '@tanstack/react-query';
import { logout as apiLogout } from '@features/auth/api/auth.api';
import { toast } from 'sonner';

export const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Overview'     },
  { to: '/item-groups',  icon: Layers,          label: 'Item Groups'  },
  { to: '/work-orders',  icon: Wrench,          label: 'Work Orders'  },
  { to: '/customers',    icon: Users,           label: 'Customers'    },
  { to: '/invoices',     icon: FileText,        label: 'Invoices'     },
  { to: '/reports',      icon: BarChart2,       label: 'Reports'      },
];

function NavItem({
  to,
  icon: Icon,
  label,
  onNavigate,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-sidebar-active-bg text-sidebar-active-fg'
            : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover-bg'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={15}
            className={cn(
              'shrink-0 transition-colors',
              isActive ? 'text-sidebar-active-fg' : 'text-sidebar-muted group-hover:text-sidebar-fg',
            )}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  onOpenSearch?: () => void;
}

export function Sidebar({ className, onNavigate, onOpenSearch }: SidebarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const companyName = useSettingsStore((s) => s.company.name);

  const initials = companyName
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SL';

  const { mutate: doLogout } = useMutation({
    mutationFn: () => apiLogout(localStorage.getItem('refresh_token') ?? undefined),
    onSettled: () => {
      logout();
      navigate('/login', { replace: true });
      onNavigate?.();
    },
    onError: () => toast.error('Logout failed — please try again.'),
  });

  return (
    <aside
      className={cn(
        'w-[220px] min-h-full bg-sidebar-bg border-r border-sidebar-border flex flex-col py-5 px-3 shrink-0 safe-top safe-bottom',
        className,
      )}
    >
      {/* Brand mark */}
      <div className="px-2 mb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {initials}
          </div>
          <span className="text-sidebar-fg font-semibold text-sm leading-tight truncate">
            {companyName || 'Siddhant'}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 px-1">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 bg-sidebar-hover-bg rounded-xl px-3 py-2 border border-sidebar-border text-sidebar-muted text-xs hover:border-sidebar-fg/20 hover:text-sidebar-fg transition-all"
        >
          <Search size={12} className="shrink-0" />
          <span>Search…</span>
          <span className="ml-auto text-2xs bg-white/5 rounded px-1 py-0.5 border border-sidebar-border font-mono hidden lg:inline">⌘K</span>
        </button>
      </div>

      {/* Nav section label */}
      <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-widest text-sidebar-muted/60">Menu</p>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="my-3 border-t border-sidebar-border" />

      <div className="space-y-0.5">
        <NavItem to="/settings" icon={Settings} label="Settings" onNavigate={onNavigate} />
        <button
          onClick={() => doLogout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-muted hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
