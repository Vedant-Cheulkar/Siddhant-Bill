import { useQueries } from '@tanstack/react-query';
import { getDashboard } from '../api/reports.api';
import { REPORT_KEYS } from '../queryKeys';
import { format, startOfYear, endOfYear } from 'date-fns';

/** Returns dashboard stats for current month (used for KPI cards + summary) */
export function useDashboardSummary() {
  return useQueries({
    queries: [
      {
        queryKey: REPORT_KEYS.dashboard(),
        queryFn: () => getDashboard(),
      },
    ],
    combine: (results) => ({
      data: results[0].data,
      isLoading: results[0].isLoading,
      isError: results[0].isError,
      refetch: results[0].refetch,
    }),
  });
}

/** Returns per-year dashboard data for the earnings chart (last 5 years) */
export function useYearlyTrend() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

  const results = useQueries({
    queries: years.map((year) => {
      const from = format(startOfYear(new Date(year, 0)), 'yyyy-MM-dd');
      const to   = format(endOfYear(new Date(year, 0)), 'yyyy-MM-dd');
      return {
        queryKey: REPORT_KEYS.dashboard(from, to),
        queryFn: () => getDashboard(from, to),
        staleTime: 1000 * 60 * 10,
      };
    }),
  });

  const chartData = results.map((r, i) => ({
    year: String(years[i]),
    issued:    r.data?.issuedInvoiceCount    ?? 0,
    draft:     r.data?.draftInvoiceCount     ?? 0,
    cancelled: r.data?.cancelledInvoiceCount ?? 0,
    total:     r.data?.grandTotal            ?? 0,
  }));

  return {
    chartData,
    isLoading: results.some((r) => r.isLoading),
    isError:   results.some((r) => r.isError),
  };
}
