import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Wrench, Users,
  FileText, BarChart2, Settings, LogOut, Search,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useAuthStore } from '@features/auth/store/authStore';
import { useMutation } from '@tanstack/react-query';
import { logout as apiLogout } from '@features/auth/api/auth.api';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Overview'     },
  { to: '/item-groups',  icon: Layers,          label: 'Item Groups'  },
  { to: '/work-orders',  icon: Wrench,          label: 'Work Orders'  },
  { to: '/customers',    icon: Users,           label: 'Customers'    },
  { to: '/invoices',     icon: FileText,        label: 'Invoices'     },
  { to: '/reports',      icon: BarChart2,       label: 'Reports'      },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-accent text-white shadow-sm'
            : 'text-muted hover:text-fg hover:bg-bg-subtle'
        )
      }
    >
      <Icon size={15} />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: doLogout } = useMutation({
    mutationFn: () => apiLogout(localStorage.getItem('refresh_token') ?? undefined),
    onSettled: () => {
      logout();
      navigate('/login', { replace: true });
    },
    onError: () => toast.error('Logout failed — please try again.'),
  });

  const initials = user?.fullName
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <aside className="w-[210px] min-h-screen bg-bg border-r border-border flex flex-col py-5 px-3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-7">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-[9px] font-bold text-white text-center leading-tight select-none">SL</span>
        </div>
        <div>
          <p className="text-sm font-bold text-fg leading-none">Siddhant Logistics</p>
          <p className="text-2xs text-muted mt-0.5">Billing Suite</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 px-1">
        <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border text-muted text-xs cursor-pointer hover:border-border-strong transition-all">
          <Search size={12} className="shrink-0" />
          <span>Quick search…</span>
          <span className="ml-auto text-2xs bg-bg rounded px-1 py-0.5 border border-border font-mono">⌘K</span>
        </div>
      </div>

      {/* Nav label */}
      <p className="px-3 mb-1.5 text-2xs font-semibold text-muted uppercase tracking-widest">Menu</p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} />
        ))}
      </nav>

      {/* Divider */}
      <div className="my-3 border-t border-border" />

      {/* Bottom nav */}
      <div className="space-y-0.5 mb-3">
        <NavItem to="/settings" icon={Settings} label="Settings" />
        <button
          onClick={() => doLogout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl bg-surface border border-border min-w-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-white shrink-0 select-none shadow-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-fg truncate leading-tight">{user?.fullName ?? 'User'}</p>
          <p className="text-2xs text-muted truncate mt-0.5">{user?.email ?? ''}</p>
        </div>
      </div>
    </aside>
  );
}
