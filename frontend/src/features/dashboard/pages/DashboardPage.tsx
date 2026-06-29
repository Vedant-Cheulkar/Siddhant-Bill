import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card';
import { KpiRow } from './widgets/KpiRow';
import { SummaryPanel } from './widgets/SummaryPanel';
import { EarningsChart } from './widgets/EarningsChart';
import { PercentageChart } from './widgets/PercentageChart';
import { RecentInvoicesWidget } from './widgets/RecentInvoicesWidget';

export function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiRow />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <SummaryPanel />
        </Card>

        <Card>
          <CardContent>
            <EarningsChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <Card className="overflow-hidden">
          <RecentInvoicesWidget />
        </Card>

        <Card>
          <CardContent>
            <PercentageChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
