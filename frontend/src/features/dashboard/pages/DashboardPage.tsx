import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card';
import { KpiRow } from './widgets/KpiRow';
import { SummaryPanel } from './widgets/SummaryPanel';
import { EarningsChart } from './widgets/EarningsChart';
import { MiniCalendar } from './widgets/MiniCalendar';
import { PercentageChart } from './widgets/PercentageChart';
import { RecentInvoicesWidget } from './widgets/RecentInvoicesWidget';

export function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiRow />
      </div>

      {/* Row 2: Summary | EarningsChart | MiniCalendar */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <SummaryPanel />
        </Card>

        <Card>
          <CardContent>
            <EarningsChart />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <MiniCalendar />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Invoice table | PercentageChart */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
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
