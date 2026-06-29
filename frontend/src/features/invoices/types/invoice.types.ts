/** Exact enum values from InvoiceStatus.java */
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';

export type DocumentType = 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'CREDIT_NOTE' | 'DEBIT_NOTE';

export interface InvoiceLineItemRequest {
  productId?: string;
  hsnSac?: string;
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
  documentType?: DocumentType;
  reverseCharge?: boolean;
  notes?: string;
  items: InvoiceLineItemRequest[];
}

export interface InvoiceLineItemResponse {
  id: string;
  productId?: string;
  hsnSac?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
  taxableAmount?: number;
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
  documentType: DocumentType;
  reverseCharge: boolean;
  placeOfSupply?: string;
  taxType?: 'INTRA' | 'INTER';
  taxableAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
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
