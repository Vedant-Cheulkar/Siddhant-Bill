import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceStatusBadge } from '@shared/components/ui/Badge';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { SkeletonRow } from '@shared/components/ui/Skeleton';
import { SearchInput } from '@shared/components/widgets/SearchInput';
import { TabBar } from '@shared/components/widgets/TabBar';
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold shrink-0">Recent Invoices</h3>
        <div className="w-full sm:w-auto sm:max-w-[10rem]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search..."
            className="sm:w-36"
          />
        </div>
      </div>

      <div className="px-4 sm:px-5 border-b border-border">
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {[
                { h: 'Invoice ID', className: '' },
                { h: 'Customer', className: '' },
                { h: 'Amount', className: '' },
                { h: 'Date', className: 'hidden md:table-cell' },
                { h: 'Status', className: 'hidden md:table-cell' },
              ].map(({ h, className }) => (
                <th key={h} className={cn('text-left px-3 sm:px-5 py-3 text-xs font-medium text-muted whitespace-nowrap', className)}>
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
                  className="border-b border-border hover:bg-accent-bg/50 cursor-pointer transition-colors"
                >
                  <td className="px-3 sm:px-5 py-3.5 font-mono text-xs">{inv.displayNumber ?? '—'}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-xs text-muted max-w-[8rem] sm:max-w-none truncate">{customerMap.get(inv.customerId) ?? inv.customerId}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-xs font-semibold">{formatCurrency(inv.grandTotal)}</td>
                  <td className="hidden md:table-cell px-5 py-3.5 text-xs text-muted">{formatDate(inv.invoiceDate)}</td>
                  <td className="hidden md:table-cell px-5 py-3.5">
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
