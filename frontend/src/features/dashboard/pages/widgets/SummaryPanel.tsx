import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { Skeleton } from '@shared/components/ui/Skeleton';
import { formatCurrency, formatNumber } from '@shared/utils/format';
import { cn } from '@shared/utils/cn';

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  to: string;
  iconBg: string;
}

function SummaryRow({ icon, label, value, to, iconBg }: SummaryRowProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3.5 w-full text-left px-4 py-3.5 hover:bg-stone-50 transition-colors group"
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold mt-0.5">{value}</p>
      </div>
      <ChevronRight
        size={13}
        className="text-border-strong group-hover:text-muted group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </button>
  );
}

export function SummaryPanel() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const total =
    (data?.issuedInvoiceCount ?? 0) +
    (data?.draftInvoiceCount ?? 0) +
    (data?.cancelledInvoiceCount ?? 0);

  const rows = [
    {
      icon: <FileText size={15} />,
      label: 'Total Invoices',
      value: formatNumber(total),
      to: '/invoices',
      iconBg: 'bg-accent-bg text-accent',
    },
    {
      icon: <TrendingUp size={15} />,
      label: 'Issued Revenue',
      value: formatCurrency(data?.grandTotal ?? 0),
      to: '/reports',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: <CheckCircle2 size={15} />,
      label: 'Issued Invoices',
      value: formatNumber(data?.issuedInvoiceCount ?? 0),
      to: '/invoices',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <XCircle size={15} />,
      label: 'Draft Invoices',
      value: formatNumber(data?.draftInvoiceCount ?? 0),
      to: '/invoices',
      iconBg: 'bg-zinc-100 text-zinc-500',
    },
  ];

  return (
    <div className="divide-y divide-border">
      {rows.map((r) => (
        <SummaryRow key={r.label} {...r} />
      ))}
    </div>
  );
}
