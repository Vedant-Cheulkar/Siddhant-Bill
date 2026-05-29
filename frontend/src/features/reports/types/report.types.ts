export interface DashboardResponse {
  fromDate: string;
  toDate: string;
  issuedInvoiceCount: number;
  draftInvoiceCount: number;
  cancelledInvoiceCount: number;
  grandTotal: number;
}
