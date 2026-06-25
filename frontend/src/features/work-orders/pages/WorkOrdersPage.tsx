import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { DataTable, type Column } from '@shared/components/widgets/DataTable';
import { TabBar } from '@shared/components/widgets/TabBar';
import { SearchInput } from '@shared/components/widgets/SearchInput';
import { Pagination } from '@shared/components/widgets/Pagination';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { ErrorMessage } from '@shared/components/ui/ErrorMessage';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useWorkOrders, useDeleteWorkOrder } from '../hooks/useWorkOrders';
import { useCustomerMap } from '@features/customers/hooks/useCustomerMap';
import { formatCurrency, formatDate } from '@shared/utils/format';
import type { WorkOrderSummaryResponse, WorkOrderStatus } from '../types/workOrder.types';
import { cn } from '@shared/utils/cn';

type FilterStatus = WorkOrderStatus | 'ALL';

const TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All',         value: 'ALL'         },
  { label: 'Open',        value: 'OPEN'        },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed',   value: 'COMPLETED'   },
  { label: 'Invoiced',    value: 'INVOICED'    },
  { label: 'Cancelled',   value: 'CANCELLED'   },
];

const STATUS_VARIANT: Record<WorkOrderStatus, string> = {
  OPEN:        'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  INVOICED:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  CANCELLED:   'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  INVOICED:    'Invoiced',
  CANCELLED:   'Cancelled',
};

const PAGE_SIZE = 20;

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const customerMap = useCustomerMap();
  const deleteMutation = useDeleteWorkOrder();

  const { data: woPage, isLoading, isError, refetch } = useWorkOrders({
    status: activeTab === 'ALL' ? undefined : activeTab,
    q: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  const workOrders = woPage?.content ?? [];

  const handleTabChange = (tab: FilterStatus) => { setActiveTab(tab); setPage(0); };
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };

  const handleConvertToInvoice = (wo: WorkOrderSummaryResponse) => {
    sessionStorage.setItem('workOrderConvert', JSON.stringify({
      workOrderId: wo.id,
      customerId: wo.customerId,
      workOrderRef: wo.orderNumber,
    }));
    navigate('/invoices/new');
  };

  const COLUMNS: Column<WorkOrderSummaryResponse>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (r) => <span className="font-mono text-xs font-medium text-fg">{r.orderNumber}</span>,
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (r) => <span className="text-sm">{customerMap.get(r.customerId) ?? r.customerId}</span>,
    },
    {
      key: 'vehicleRef',
      header: 'Vehicle Ref',
      render: (r) => <span className="text-xs text-muted font-mono">{r.vehicleRef ?? '—'}</span>,
    },
    {
      key: 'grandTotal',
      header: 'Amount',
      render: (r) => <span className="text-sm font-semibold tabular-nums">{formatCurrency(r.grandTotal)}</span>,
    },
    {
      key: 'serviceDate',
      header: 'Service Date',
      render: (r) => <span className="text-sm text-muted">{formatDate(r.serviceDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', STATUS_VARIANT[r.status])}>
          {STATUS_LABEL[r.status]}
        </span>
      ),
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
              <div className="absolute right-0 top-8 z-20 w-44 bg-surface border border-border rounded-xl shadow-lg overflow-hidden py-1">
                <button
                  onClick={() => { navigate(`/work-orders/${r.id}`); setOpenMenuId(null); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-fg hover:bg-stone-50 transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                {r.status === 'COMPLETED' && (
                  <button
                    onClick={() => { handleConvertToInvoice(r); setOpenMenuId(null); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent hover:bg-accent-bg transition-colors"
                  >
                    <FileText size={12} /> Convert to Invoice
                  </button>
                )}
                {(r.status === 'OPEN' || r.status === 'CANCELLED') && (
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

  const deleteWo = workOrders.find((w) => w.id === deleteId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Work Orders"
        description="Track maintenance and service jobs for your clients."
        action={
          <Button onClick={() => navigate('/work-orders/new')}>
            <Plus size={14} /> New Work Order
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
              placeholder="Search orders…"
              className="w-52"
            />
          </div>
        </div>

        {isError ? (
          <ErrorMessage message="Could not fetch work orders." onRetry={refetch} />
        ) : (
          <DataTable
            columns={COLUMNS}
            data={workOrders}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/work-orders/${row.id}`)}
            emptyTitle="No work orders yet"
            emptyDescription="Create your first work order to track a service job."
          />
        )}

        {woPage && (
          <Pagination
            page={page}
            totalPages={woPage.totalPages}
            isLast={woPage.last}
            onPageChange={setPage}
            totalElements={woPage.totalElements}
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
        title="Delete Work Order"
        description={`Delete ${deleteWo?.orderNumber ?? 'this work order'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
