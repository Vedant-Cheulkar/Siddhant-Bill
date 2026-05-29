import { apiClient } from '@infra/http/apiClient';
import type { WorkOrderRequest, WorkOrderResponse, WorkOrderSummaryResponse, WorkOrderStatus } from '../types/workOrder.types';
import type { PageResponse } from '@shared/types';

export interface WorkOrderListParams {
  q?: string;
  status?: WorkOrderStatus;
  page?: number;
  size?: number;
}

export const listWorkOrders = async (params: WorkOrderListParams = {}): Promise<PageResponse<WorkOrderSummaryResponse>> => {
  const res = await apiClient.get('/work-orders', { params });
  return res.data.data;
};

export const getWorkOrder = async (id: string): Promise<WorkOrderResponse> => {
  const res = await apiClient.get(`/work-orders/${id}`);
  return res.data.data;
};

export const createWorkOrder = async (data: WorkOrderRequest): Promise<WorkOrderResponse> => {
  const res = await apiClient.post('/work-orders', data);
  return res.data.data;
};

export const updateWorkOrder = async (id: string, data: WorkOrderRequest): Promise<WorkOrderResponse> => {
  const res = await apiClient.put(`/work-orders/${id}`, data);
  return res.data.data;
};

export const deleteWorkOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/work-orders/${id}`);
};

export const updateWorkOrderStatus = async (id: string, status: WorkOrderStatus): Promise<WorkOrderResponse> => {
  const res = await apiClient.patch(`/work-orders/${id}/status`, { status });
  return res.data.data;
};
