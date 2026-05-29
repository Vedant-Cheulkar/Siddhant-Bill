export const REPORT_KEYS = {
  dashboard: (from?: string, to?: string) => ['reports', 'dashboard', from, to] as const,
  yearlyTrend: (years: number[]) => ['reports', 'yearly-trend', years] as const,
} as const;
