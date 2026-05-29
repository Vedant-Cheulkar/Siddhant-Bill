import { apiClient } from '@infra/http/apiClient';
import type { CustomerRequest, CustomerResponse } from '../types/customer.types';
import type { PageResponse } from '@shared/types';

export interface CustomerListParams {
  q?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export const listCustomers = async (params: CustomerListParams = {}): Promise<PageResponse<CustomerResponse>> => {
  const res = await apiClient.get('/customers', { params });
  return res.data.data;
};

export const getCustomer = async (id: string): Promise<CustomerResponse> => {
  const res = await apiClient.get(`/customers/${id}`);
  return res.data.data;
};

export const createCustomer = async (data: CustomerRequest): Promise<CustomerResponse> => {
  const res = await apiClient.post('/customers', data);
  return res.data.data;
};

export const updateCustomer = async (id: string, data: CustomerRequest): Promise<CustomerResponse> => {
  const res = await apiClient.put(`/customers/${id}`, data);
  return res.data.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
};
