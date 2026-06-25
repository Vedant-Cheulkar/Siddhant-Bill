/** Exact enum values from InvoiceStatus.java */
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';

export interface InvoiceLineItemRequest {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
}

export interface InvoiceCreateRequest {
  customerId: string;
  workOrderId?: string;
  displayNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  items: InvoiceLineItemRequest[];
}

export interface InvoiceLineItemResponse {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
  lineTotal: number;
}

export interface InvoiceDetailResponse {
  id: string;
  displayNumber: string;
  status: InvoiceStatus;
  customerId: string;
  customerName?: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  grandTotal: number;
  notes?: string;
  items: InvoiceLineItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummaryResponse {
  id: string;
  displayNumber: string;
  status: InvoiceStatus;
  customerId: string;
  invoiceDate: string;
  grandTotal: number;
  createdAt: string;
}
