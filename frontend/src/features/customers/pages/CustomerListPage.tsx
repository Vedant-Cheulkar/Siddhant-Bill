import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { DataTable, type Column } from '@shared/components/widgets/DataTable';
import { SearchInput } from '@shared/components/widgets/SearchInput';
import { Pagination } from '@shared/components/widgets/Pagination';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { ErrorMessage } from '@shared/components/ui/ErrorMessage';
import { useCustomers } from '../hooks/useCustomers';
import type { CustomerResponse } from '../types/customer.types';

const PAGE_SIZE = 20;

const COLUMNS: Column<CustomerResponse>[] = [
  { key: 'name',       header: 'Name',        render: (r) => <span className="font-medium text-sm">{r.name}</span> },
  { key: 'code',       header: 'Code',        render: (r) => <span className="text-xs font-mono text-muted">{r.code}</span> },
  { key: 'email',      header: 'Email',       className: 'hidden lg:table-cell', render: (r) => <span className="text-xs text-muted">{r.email ?? '—'}</span> },
  { key: 'phone',      header: 'Phone',       className: 'hidden lg:table-cell', render: (r) => <span className="text-xs text-muted">{r.phone ?? '—'}</span> },
  { key: 'creditDays', header: 'Credit Days', className: 'hidden md:table-cell', render: (r) => <span className="text-xs">{r.creditDays}d</span> },
  { key: 'active',     header: 'Status',      render: (r) => <Badge variant={r.active ? 'active' : 'inactive'}>{r.active ? 'Active' : 'Inactive'}</Badge> },
];

export function CustomerListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data: customerPage, isLoading, isError, refetch } = useCustomers({
    q: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  const customers = customerPage?.content ?? [];

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        action={
          <Button onClick={() => navigate('/customers/new')}>
            <Plus size={14} /> New Customer
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-border">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email…"
            className="sm:max-w-sm"
          />
        </div>

        {isError ? (
          <ErrorMessage
            message="Could not fetch customers."
            onRetry={refetch}
          />
        ) : (
          <DataTable
            columns={COLUMNS}
            data={customers}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/customers/${row.id}/edit`)}
            emptyTitle="No customers found"
            emptyDescription="Create your first customer to get started."
          />
        )}

        {customerPage && (
          <Pagination
            page={page}
            totalPages={customerPage.totalPages}
            isLast={customerPage.last}
            onPageChange={setPage}
            totalElements={customerPage.totalElements}
          />
        )}
      </Card>
    </div>
  );
}
