import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { DataTable, type Column } from '@shared/components/widgets/DataTable';
import { SearchInput } from '@shared/components/widgets/SearchInput';
import { Pagination } from '@shared/components/widgets/Pagination';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { ErrorMessage } from '@shared/components/ui/ErrorMessage';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { formatCurrency } from '@shared/utils/format';
import type { ProductResponse } from '../types/product.types';

const PAGE_SIZE = 20;

function buildColumns(navigate: (path: string) => void): Column<ProductResponse>[] {
  return [
    { key: 'sku',         header: 'SKU',         render: (r) => <span className="font-mono text-xs text-muted">{r.sku}</span> },
    { key: 'name',        header: 'Name',        render: (r) => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-xs text-muted">{r.description ?? '—'}</span> },
    { key: 'salePrice',   header: 'Sale Price',  render: (r) => <span className="text-xs font-semibold">{formatCurrency(r.salePrice)}</span> },
    { key: 'active',      header: 'Status',      render: (r) => <Badge variant={r.active ? 'active' : 'inactive'}>{r.active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions',     header: '',            render: (r) => <RowActions product={r} onEdit={() => navigate(`/item-groups/${r.id}/edit`)} /> },
  ];
}

function RowActions({ product, onEdit }: { product: ProductResponse; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteProduct(product.id);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded hover:bg-surface text-muted hover:text-fg transition-colors"
        aria-label="Row actions"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-36 rounded-lg border border-border bg-bg shadow-lg py-1">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface transition-colors"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={() => { setOpen(false); setConfirmOpen(true); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Product"
        description={`Delete "${product.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteMutation.mutate(); setConfirmOpen(false); }}
      />
    </div>
  );
}

export function ItemGroupsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const columns = buildColumns(navigate);

  const { data: productPage, isLoading, isError, refetch } = useProducts({
    q: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  const products = productPage?.content ?? [];

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Item Groups"
        action={
          <Button onClick={() => navigate('/item-groups/new')}>
            <Plus size={14} /> New Product
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or SKU…"
            className="w-72"
          />
        </div>

        {isError ? (
          <ErrorMessage
            message="Could not fetch products."
            onRetry={refetch}
          />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/item-groups/${row.id}/edit`)}
            emptyTitle="No products found"
            emptyDescription="Create your first product to get started."
          />
        )}

        {productPage && (
          <Pagination
            page={page}
            totalPages={productPage.totalPages}
            isLast={productPage.last}
            onPageChange={setPage}
            totalElements={productPage.totalElements}
          />
        )}
      </Card>
    </div>
  );
}
