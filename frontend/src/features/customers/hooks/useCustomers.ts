import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
  type CustomerListParams,
} from '../api/customers.api';
import { CUSTOMER_KEYS } from '../queryKeys';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { CustomerRequest } from '../types/customer.types';

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(params),
    queryFn: () => listCustomers(params),
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(id!),
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: CustomerRequest) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      toast.success('Customer created successfully.');
      navigate('/customers');
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: CustomerRequest) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(id) });
      toast.success('Customer updated successfully.');
      navigate('/customers');
    },
  });
}

export function useDeleteCustomer(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      toast.success('Customer deleted.');
      navigate('/customers');
    },
    onError: () => toast.error('Failed to delete customer.'),
  });
}
