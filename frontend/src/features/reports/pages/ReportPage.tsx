import { BarChart2, TrendingUp, FileText, XCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card';
import { SkeletonCard, Skeleton } from '@shared/components/ui/Skeleton';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { useDashboardSummary, useYearlyTrend } from '../hooks/useReports';
import { formatCurrency, formatNumber } from '@shared/utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = { issued: '#4f46e5', draft: '#d1d5db', cancelled: '#fca5a5' };

function KpiCard({ label, value, icon, isLoading, isError }: {
  label: string; value: string; icon: React.ReactNode; isLoading: boolean; isError: boolean;
}) {
  if (isLoading) return <SkeletonCard />;
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted mb-1.5">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{isError ? '—' : value}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center text-muted shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportPage() {
  const { data, isLoading, isError } = useDashboardSummary();
  const { chartData, isLoading: chartLoading, isError: chartError } = useYearlyTrend();

  const hasChartData = chartData.some((d) => d.issued + d.draft + d.cancelled > 0);

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Invoice summary and multi-year trend" />

      {/* KPI row — always renders, shows — when errored */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Issued Invoices"    value={formatNumber(data?.issuedInvoiceCount    ?? 0)} icon={<CheckCircle2 size={16} />} isLoading={isLoading} isError={isError} />
        <KpiCard label="Draft Invoices"     value={formatNumber(data?.draftInvoiceCount     ?? 0)} icon={<FileText size={16} />}     isLoading={isLoading} isError={isError} />
        <KpiCard label="Cancelled Invoices" value={formatNumber(data?.cancelledInvoiceCount ?? 0)} icon={<XCircle size={16} />}      isLoading={isLoading} isError={isError} />
        <KpiCard label="Issued Revenue"     value={formatCurrency(data?.grandTotal          ?? 0)} icon={<TrendingUp size={16} />}   isLoading={isLoading} isError={isError} />
      </div>

      {/* Chart — always renders with its own state */}
      <Card>
        <CardHeader>
          <CardTitle>5-Year Invoice Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartError ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-3">
              <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center">
                <BarChart2 size={20} className="text-muted" />
              </div>
              <p className="text-sm font-medium text-fg">Could not load trend data</p>
              <p className="text-xs text-muted">Start the backend server to see chart data</p>
            </div>
          ) : !hasChartData ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-3">
              <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center">
                <BarChart2 size={20} className="text-muted" />
              </div>
              <p className="text-sm font-medium text-fg">No trend data yet</p>
              <p className="text-xs text-muted">Invoice data will appear here over time</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.8} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: 'var(--color-muted)' }} />
                <Bar dataKey="issued"    fill={COLORS.issued}    radius={[4, 4, 0, 0]} name="Issued"    />
                <Bar dataKey="draft"     fill={COLORS.draft}     radius={[4, 4, 0, 0]} name="Draft"     />
                <Bar dataKey="cancelled" fill={COLORS.cancelled} radius={[4, 4, 0, 0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
