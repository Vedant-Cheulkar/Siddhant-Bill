import { apiClient } from '@infra/http/apiClient';
import type {
  InvoiceStatus,
  InvoiceSummaryResponse,
  InvoiceDetailResponse,
  InvoiceCreateRequest,
} from '../types/invoice.types';
import type { PageResponse } from '@shared/types';

export interface InvoiceListParams {
  status?: InvoiceStatus;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const listInvoices = async (params: InvoiceListParams = {}): Promise<PageResponse<InvoiceSummaryResponse>> => {
  const res = await apiClient.get('/invoices', { params });
  return res.data.data;
};

export const getInvoice = async (id: string): Promise<InvoiceDetailResponse> => {
  const res = await apiClient.get(`/invoices/${id}`);
  return res.data.data;
};

export const createInvoice = async (data: InvoiceCreateRequest): Promise<InvoiceDetailResponse> => {
  const res = await apiClient.post('/invoices', data);
  return res.data.data;
};

export const updateInvoice = async (id: string, data: InvoiceCreateRequest): Promise<InvoiceDetailResponse> => {
  const res = await apiClient.put(`/invoices/${id}`, data);
  return res.data.data;
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<InvoiceDetailResponse> => {
  const res = await apiClient.patch(`/invoices/${id}/status`, { status });
  return res.data.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await apiClient.delete(`/invoices/${id}`);
};
