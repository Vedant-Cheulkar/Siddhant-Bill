import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { InvoiceStatusBadge } from '@shared/components/ui/Badge';
import { DataTable, type Column } from '@shared/components/widgets/DataTable';
import { TabBar } from '@shared/components/widgets/TabBar';
import { SearchInput } from '@shared/components/widgets/SearchInput';
import { Pagination } from '@shared/components/widgets/Pagination';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { ErrorMessage } from '@shared/components/ui/ErrorMessage';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useInvoices, useDeleteInvoice } from '../hooks/useInvoices';
import { useCustomerMap } from '@features/customers/hooks/useCustomerMap';
import { formatCurrency, formatDate } from '@shared/utils/format';
import type { InvoiceSummaryResponse, InvoiceStatus } from '../types/invoice.types';
type FilterStatus = InvoiceStatus | 'ALL';

const TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Issued',    value: 'ISSUED'    },
  { label: 'Draft',     value: 'DRAFT'     },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PAGE_SIZE = 20;

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const customerMap = useCustomerMap();
  const deleteMutation = useDeleteInvoice();

  const { data: invoicePage, isLoading, isError, refetch } = useInvoices({
    status: activeTab === 'ALL' ? undefined : activeTab,
    q: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  const invoices = invoicePage?.content ?? [];

  const handleTabChange = (tab: FilterStatus) => { setActiveTab(tab); setPage(0); };
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };

  const COLUMNS: Column<InvoiceSummaryResponse>[] = [
    {
      key: 'displayNumber',
      header: 'Invoice ID',
      render: (r) => (
        <span className="font-mono text-xs font-medium text-fg">{r.displayNumber ?? '—'}</span>
      ),
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (r) => (
        <span className="text-sm">{customerMap.get(r.customerId) ?? r.customerId}</span>
      ),
    },
    {
      key: 'grandTotal',
      header: 'Amount',
      render: (r) => (
        <span className="text-sm font-semibold tabular-nums">{formatCurrency(r.grandTotal)}</span>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Date',
      render: (r) => (
        <span className="text-sm text-muted">{formatDate(r.invoiceDate)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <InvoiceStatusBadge status={r.status} />,
    },
    {
      key: 'id',
      header: '',
      render: (r) => (
        <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-stone-100 hover:text-fg transition-colors"
            aria-label="Actions"
          >
            <MoreHorizontal size={14} />
          </button>
          {openMenuId === r.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
              <div className="absolute right-0 top-8 z-20 w-36 bg-surface border border-border rounded-xl shadow-lg overflow-hidden py-1">
                <button
                  onClick={() => { navigate(`/invoices/${r.id}`); setOpenMenuId(null); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-fg hover:bg-stone-50 transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                {r.status === 'DRAFT' && (
                  <button
                    onClick={() => { setDeleteId(r.id); setOpenMenuId(null); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  const deleteInvoice = invoices.find((i) => i.id === deleteId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        action={
          <Button onClick={() => navigate('/invoices/new')}>
            <Plus size={14} /> New Invoice
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="px-5 pt-3 border-b border-border flex items-end justify-between">
          <TabBar tabs={TABS} active={activeTab} onChange={handleTabChange} />
          <div className="flex items-center gap-2 pb-3">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by invoice number…"
              className="w-52"
            />
          </div>
        </div>

        {isError ? (
          <ErrorMessage message="Could not fetch invoices." onRetry={refetch} />
        ) : (
          <DataTable
            columns={COLUMNS}
            data={invoices}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/invoices/${row.id}`)}
            emptyTitle="No invoices found"
            emptyDescription="Try adjusting your filters or create a new invoice."
          />
        )}

        {invoicePage && (
          <Pagination
            page={page}
            totalPages={invoicePage.totalPages}
            isLast={invoicePage.last}
            onPageChange={setPage}
            totalElements={invoicePage.totalElements}
          />
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Delete Invoice"
        description={`Delete ${deleteInvoice?.displayNumber ?? 'this invoice'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
