import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { InvoiceStatusBadge } from '@shared/components/ui/Badge';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { SkeletonRow } from '@shared/components/ui/Skeleton';
import { SearchInput } from '@shared/components/widgets/SearchInput';
import { useInvoices } from '@features/invoices/hooks/useInvoices';
import { useCustomerMap } from '@features/customers/hooks/useCustomerMap';
import { formatCurrency, formatDate } from '@shared/utils/format';
import type { InvoiceStatus } from '@features/invoices/types/invoice.types';
import { cn } from '@shared/utils/cn';

type FilterStatus = InvoiceStatus | 'ALL';

const TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All Invoices', value: 'ALL'       },
  { label: 'Issued',      value: 'ISSUED'    },
  { label: 'Draft',       value: 'DRAFT'     },
  { label: 'Cancelled',   value: 'CANCELLED' },
];

export function RecentInvoicesWidget() {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterStatus>('ALL');
  const [search,    setSearch]    = useState('');

  const customerMap = useCustomerMap();

  const { data: invoicePage, isLoading } = useInvoices({
    status: activeTab === 'ALL' ? undefined : activeTab,
    q: search || undefined,
    size: 8,
  });

  const invoices = invoicePage?.content ?? [];

  return (
    <div className="overflow-hidden">
      {/* Header row — title + search/filter on same baseline */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold">Recent Invoices</h3>
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search..."
            className="w-36"
          />
          <button className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg text-xs bg-surface hover:bg-bg transition-colors whitespace-nowrap">
            <SlidersHorizontal size={11} /> Filter
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-1 px-5 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap',
              activeTab === tab.value
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg hover:border-border-strong'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Invoice ID', 'Customer', 'Amount', 'Date', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState description="No invoices match the current filter." />
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="border-b border-border hover:bg-indigo-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs">{inv.displayNumber ?? '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-muted">{customerMap.get(inv.customerId) ?? inv.customerId}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold">{formatCurrency(inv.grandTotal)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-5 py-3.5">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
