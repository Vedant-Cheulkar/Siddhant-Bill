import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  listWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  type WorkOrderListParams,
} from '../api/workOrders.api';
import { WORK_ORDER_KEYS } from '../queryKeys';
import type { WorkOrderRequest, WorkOrderStatus } from '../types/workOrder.types';
import { getApiErrorMessage } from '@shared/utils/apiError';

export function useWorkOrders(params: WorkOrderListParams = {}) {
  return useQuery({
    queryKey: WORK_ORDER_KEYS.list(params),
    queryFn: () => listWorkOrders(params),
    placeholderData: (prev) => prev,
  });
}

export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: WORK_ORDER_KEYS.detail(id ?? ''),
    queryFn: () => getWorkOrder(id!),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: WorkOrderRequest) => createWorkOrder(data),
    onSuccess: (wo) => {
      qc.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all });
      toast.success('Work order created.');
      navigate(`/work-orders/${wo.id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to create work order.')),
  });
}

export function useUpdateWorkOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkOrderRequest) => updateWorkOrder(id, data),
    onSuccess: (wo) => {
      qc.setQueryData(WORK_ORDER_KEYS.detail(id), wo);
      qc.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all });
      toast.success('Work order updated.');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update work order.')),
  });
}

export function useDeleteWorkOrder() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (id: string) => deleteWorkOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all });
      toast.success('Work order deleted.');
      navigate('/work-orders');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to delete work order.')),
  });
}

export function useUpdateWorkOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) =>
      updateWorkOrderStatus(id, status),
    onSuccess: (wo) => {
      qc.setQueryData(WORK_ORDER_KEYS.detail(wo.id), wo);
      qc.invalidateQueries({ queryKey: WORK_ORDER_KEYS.all });
      toast.success(`Status updated to ${wo.status.replace('_', ' ').toLowerCase()}.`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update status.')),
  });
}
