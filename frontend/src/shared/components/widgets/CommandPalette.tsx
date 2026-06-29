import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search, FileText, Users, BarChart2, Settings,
  Package, Wrench, Home,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useInvoices } from '@features/invoices/hooks/useInvoices';
import { useCustomers } from '@features/customers/hooks/useCustomers';

interface CommandItem {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  href: string;
  group: string;
}

const STATIC_COMMANDS: CommandItem[] = [
  { id: 'nav-dashboard',    label: 'Overview',     group: 'Navigate', icon: <Home size={14} />,       href: '/' },
  { id: 'nav-invoices',     label: 'Invoices',     group: 'Navigate', icon: <FileText size={14} />,   href: '/invoices' },
  { id: 'nav-customers',    label: 'Customers',    group: 'Navigate', icon: <Users size={14} />,      href: '/customers' },
  { id: 'nav-items',        label: 'Item Groups',  group: 'Navigate', icon: <Package size={14} />,    href: '/item-groups' },
  { id: 'nav-work-orders',  label: 'Work Orders',  group: 'Navigate', icon: <Wrench size={14} />,     href: '/work-orders' },
  { id: 'nav-reports',      label: 'Reports',      group: 'Navigate', icon: <BarChart2 size={14} />,  href: '/reports' },
  { id: 'nav-settings',     label: 'Settings',     group: 'Navigate', icon: <Settings size={14} />,   href: '/settings' },
  { id: 'action-new-inv',   label: 'New Invoice',  group: 'Actions',  icon: <FileText size={14} />,   href: '/invoices/new' },
  { id: 'action-new-cust',  label: 'New Customer', group: 'Actions',  icon: <Users size={14} />,      href: '/customers/new' },
  { id: 'action-new-prod',  label: 'New Product',  group: 'Actions',  icon: <Package size={14} />,    href: '/item-groups/new' },
  { id: 'action-new-wo',    label: 'New Work Order',group: 'Actions', icon: <Wrench size={14} />,     href: '/work-orders/new' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: invoicePage } = useInvoices({ q: query || undefined, size: 5 });
  const { data: customerPage } = useCustomers({ q: query || undefined, size: 5 });

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlighted(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const dynamicItems: CommandItem[] = [
    ...(invoicePage?.content ?? []).map((inv) => ({
      id: `inv-${inv.id}`,
      label: inv.displayNumber,
      sub: `Invoice · ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inv.grandTotal)}`,
      icon: <FileText size={14} />,
      href: `/invoices/${inv.id}`,
      group: 'Invoices',
    })),
    ...(customerPage?.content ?? []).map((c) => ({
      id: `cust-${c.id}`,
      label: c.name,
      sub: `Customer · ${c.email ?? c.code}`,
      icon: <Users size={14} />,
      href: `/customers/${c.id}/edit`,
      group: 'Customers',
    })),
  ];

  const filteredStatic = query
    ? STATIC_COMMANDS.filter(
        (c) => c.label.toLowerCase().includes(query.toLowerCase()) ||
               c.group.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_COMMANDS;

  const items: CommandItem[] = query
    ? [...dynamicItems, ...filteredStatic]
    : [...filteredStatic];

  const grouped = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatItems = Object.values(grouped).flat();

  const handleSelect = useCallback(
    (item: CommandItem) => {
      navigate(item.href);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[highlighted]) handleSelect(flatItems[highlighted]);
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  useEffect(() => {
    if (!listRef.current || !open) return;
    const item = listRef.current.querySelector(`[data-index="${highlighted}"]`) as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search size={16} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or navigate…"
            className="flex-1 text-sm bg-transparent outline-none text-fg placeholder:text-muted"
          />
          <kbd className="hidden sm:flex items-center gap-1 text-2xs text-muted font-mono bg-bg border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {flatItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No results for "{query}"</p>
          ) : (
            Object.entries(grouped).map(([group, groupItems]) => {
              const groupStart = flatItems.indexOf(groupItems[0]);
              return (
                <div key={group}>
                  <p className="px-3 py-1.5 text-2xs font-semibold text-muted uppercase tracking-wider">
                    {group}
                  </p>
                  {groupItems.map((item, relIdx) => {
                    const absIdx = groupStart + relIdx;
                    return (
                      <button
                        key={item.id}
                        data-index={absIdx}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                          absIdx === highlighted ? 'bg-indigo-50' : 'hover:bg-bg'
                        )}
                      >
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                          absIdx === highlighted ? 'bg-indigo-500 text-white' : 'bg-bg text-muted'
                        )}>
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-fg truncate">{item.label}</p>
                          {item.sub && (
                            <p className="text-xs text-muted truncate">{item.sub}</p>
                          )}
                        </div>
                        {absIdx === highlighted && (
                          <kbd className="ml-auto text-2xs font-mono text-muted bg-bg border border-border rounded px-1.5 py-0.5 shrink-0">
                            Enter
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-2xs text-muted">
          <span>↑↓ navigate</span>
          <span>↩ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
