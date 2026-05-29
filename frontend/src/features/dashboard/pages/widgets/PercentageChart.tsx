import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { Skeleton } from '@shared/components/ui/Skeleton';

const COLORS = {
  issued:    '#4f46e5',
  draft:     '#94a3b8',
  cancelled: '#fb7185',
};

export function PercentageChart() {
  const { data, isLoading, isError } = useDashboardSummary();

  const total =
    (data?.issuedInvoiceCount ?? 0) +
    (data?.draftInvoiceCount ?? 0) +
    (data?.cancelledInvoiceCount ?? 0);

  const pieData = [
    { name: 'Issued',    value: data?.issuedInvoiceCount    ?? 0, color: COLORS.issued    },
    { name: 'Draft',     value: data?.draftInvoiceCount     ?? 0, color: COLORS.draft     },
    { name: 'Cancelled', value: data?.cancelledInvoiceCount ?? 0, color: COLORS.cancelled },
  ].filter((d) => d.value > 0);

  const issuedPct = total > 0
    ? Math.round(((data?.issuedInvoiceCount ?? 0) / total) * 100)
    : 0;

  const header = (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold">Invoice Breakdown</h3>
    </div>
  );

  if (isLoading) return (
    <div>{header}<Skeleton className="h-44 w-full" /></div>
  );

  if (isError) return (
    <div>
      {header}
      <div className="flex flex-col items-center justify-center h-44 gap-3">
        <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
          <PieChartIcon size={16} className="text-muted" />
        </div>
        <p className="text-xs text-muted">Could not load breakdown</p>
      </div>
    </div>
  );

  return (
    <div>
      {header}

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-44 gap-2">
          <div className="w-16 h-16 rounded-full bg-bg border-4 border-border" />
          <p className="text-xs text-muted">No invoice data yet</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${String(v ?? 0)} invoices`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-fg leading-none">{issuedPct}%</span>
              <span className="text-xs text-muted mt-1">Issued</span>
            </div>
          </div>

          <div className="space-y-2 mt-1">
            {pieData.map((d) => {
              const pct = Math.round((d.value / total) * 100);
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-fg flex-1">{d.name}</span>
                  <span className="text-xs text-muted font-medium">{d.value}</span>
                  <span className="text-xs text-muted w-9 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
