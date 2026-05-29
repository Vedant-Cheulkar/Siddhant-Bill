import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { useYearlyTrend } from '../../hooks/useDashboard';
import { Skeleton } from '@shared/components/ui/Skeleton';

const COLORS = { issued: '#4f46e5', draft: '#d1d5db', cancelled: '#fca5a5' };

export function EarningsChart() {
  const { chartData, isLoading, isError } = useYearlyTrend();

  const header = (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-semibold">Earnings Overview</h3>
      <span className="text-xs text-muted">5-year trend</span>
    </div>
  );

  if (isLoading) return (
    <div>{header}<Skeleton className="h-[200px] w-full" /></div>
  );

  if (isError) return (
    <div>
      {header}
      <div className="flex flex-col items-center justify-center h-[200px] gap-3">
        <div className="w-11 h-11 rounded-xl bg-bg flex items-center justify-center">
          <BarChart2 size={18} className="text-muted" />
        </div>
        <p className="text-sm text-muted">Could not load chart data</p>
      </div>
    </div>
  );

  const hasData = chartData.some((d) => d.issued + d.draft + d.cancelled > 0);

  if (!hasData) return (
    <div>
      {header}
      <div className="flex flex-col items-center justify-center h-[200px] gap-3">
        <div className="w-11 h-11 rounded-xl bg-bg flex items-center justify-center">
          <BarChart2 size={18} className="text-muted" />
        </div>
        <p className="text-sm text-muted">No earnings data yet</p>
        <p className="text-xs text-muted">Data will appear once invoices are created</p>
      </div>
    </div>
  );

  return (
    <div>
      {header}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="35%" barGap={3}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.8} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12, padding: '8px 12px' }}
            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
          />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: 'var(--color-muted)' }} />
          <Bar dataKey="issued"    fill={COLORS.issued}    radius={[4, 4, 0, 0]} name="Issued"    />
          <Bar dataKey="draft"     fill={COLORS.draft}     radius={[4, 4, 0, 0]} name="Draft"     />
          <Bar dataKey="cancelled" fill={COLORS.cancelled} radius={[4, 4, 0, 0]} name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
