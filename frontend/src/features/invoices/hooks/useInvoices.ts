import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  type InvoiceListParams,
} from '../api/invoices.api';
import { INVOICE_KEYS } from '../queryKeys';
import type { InvoiceCreateRequest, InvoiceStatus } from '../types/invoice.types';

export function useInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: INVOICE_KEYS.list(params),
    queryFn: () => listInvoices(params),
    placeholderData: (prev) => prev,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id ?? ''),
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: InvoiceCreateRequest) => createInvoice(data),
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      toast.success('Invoice created');
      navigate(`/invoices/${invoice.id}`);
    },
    onError: () => toast.error('Failed to create invoice'),
  });
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceCreateRequest) => updateInvoice(id, data),
    onSuccess: (invoice) => {
      qc.setQueryData(INVOICE_KEYS.detail(id), invoice);
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      toast.success('Invoice updated');
    },
    onError: () => toast.error('Failed to update invoice'),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: (invoice) => {
      qc.setQueryData(INVOICE_KEYS.detail(invoice.id), invoice);
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      toast.success('Invoice deleted');
      navigate('/invoices');
    },
    onError: () => toast.error('Failed to delete invoice'),
  });
}
