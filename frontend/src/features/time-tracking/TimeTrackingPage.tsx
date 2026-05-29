import { Clock, TrendingUp, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@shared/components/ui/Card';
import { PageHeader } from '@shared/components/widgets/PageHeader';

const SUMMARY_CARDS = [
  { icon: <Clock size={20} />,       label: 'Hours This Week',  value: '—', sub: 'No data yet' },
  { icon: <TrendingUp size={20} />,  label: 'Billable Hours',   value: '—', sub: 'No data yet' },
  { icon: <Briefcase size={20} />,   label: 'Active Projects',  value: '—', sub: 'No data yet' },
];

export function TimeTrackingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Time Tracking" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center text-muted">
                  {card.icon}
                </div>
                <p className="text-xs text-muted font-medium">{card.label}</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-fg">{card.value}</p>
              <p className="text-xs text-muted mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center">
              <Clock size={28} className="text-muted" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-fg mb-1">Time Tracking Coming Soon</h2>
              <p className="text-sm text-muted leading-relaxed">
                Log hours against customers and projects, generate billable time reports, and sync with your invoices automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
