import { Invoice } from '../models/Invoice.js';

export interface DashboardStats {
  fromDate: string;
  toDate: string;
  issuedInvoiceCount: number;
  draftInvoiceCount: number;
  cancelledInvoiceCount: number;
  grandTotal: number;
}

export async function getDashboardStats(
  organizationId: string,
  fromDate: string,
  toDate: string,
): Promise<DashboardStats> {
  const rows = await Invoice.aggregate<{
    _id: string;
    count: number;
    total: number;
  }>([
    {
      $match: {
        organizationId,
        deletedAt: null,
        invoiceDate: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$grandTotal' },
      },
    },
  ]);

  let issuedInvoiceCount = 0;
  let draftInvoiceCount = 0;
  let cancelledInvoiceCount = 0;
  let grandTotal = 0;

  for (const row of rows) {
    if (row._id === 'ISSUED') {
      issuedInvoiceCount = row.count;
      grandTotal = row.total;
    } else if (row._id === 'DRAFT') {
      draftInvoiceCount = row.count;
    } else if (row._id === 'CANCELLED') {
      cancelledInvoiceCount = row.count;
    }
  }

  return {
    fromDate,
    toDate,
    issuedInvoiceCount,
    draftInvoiceCount,
    cancelledInvoiceCount,
    grandTotal,
  };
}

export async function getYearlyTrend(
  organizationId: string,
  years: number[],
): Promise<Array<{ year: string; issued: number; draft: number; cancelled: number; total: number }>> {
  return Promise.all(
    years.map(async (year) => {
      const stats = await getDashboardStats(organizationId, `${year}-01-01`, `${year}-12-31`);
      return {
        year: String(year),
        issued: stats.issuedInvoiceCount,
        draft: stats.draftInvoiceCount,
        cancelled: stats.cancelledInvoiceCount,
        total: stats.grandTotal,
      };
    }),
  );
}
