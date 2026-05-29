import { TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@shared/components/widgets/StatCard';
import { SkeletonCard } from '@shared/components/ui/Skeleton';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { formatCurrency, formatNumber } from '@shared/utils/format';

export function KpiRow() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </>
    );
  }

  const totalInvoices =
    (data?.issuedInvoiceCount ?? 0) +
    (data?.draftInvoiceCount ?? 0) +
    (data?.cancelledInvoiceCount ?? 0);

  return (
    <>
      <StatCard
        label="Total Revenue"
        value={formatCurrency(data?.grandTotal ?? 0)}
        sub={`${data?.fromDate ?? ''} — ${data?.toDate ?? ''}`}
        icon={<TrendingUp size={18} />}
        variant="indigo"
      />
      <StatCard
        label="Total Invoices"
        value={formatNumber(totalInvoices)}
        sub="All statuses this period"
        icon={<FileText size={18} />}
        variant="blue"
      />
      <StatCard
        label="Issued Invoices"
        value={formatNumber(data?.issuedInvoiceCount ?? 0)}
        sub={`Draft: ${data?.draftInvoiceCount ?? 0}  ·  Cancelled: ${data?.cancelledInvoiceCount ?? 0}`}
        icon={<CheckCircle2 size={18} />}
        variant="emerald"
      />
    </>
  );
}
