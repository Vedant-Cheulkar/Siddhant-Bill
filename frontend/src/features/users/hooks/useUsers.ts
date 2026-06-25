import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUser, listUsers, updateUser } from '../api/users.api';
import { USER_KEYS } from '../queryKeys';
import type { CreateUserRequest, UpdateUserRequest } from '../types/user.types';

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn: listUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success('User created. Share the login credentials with them.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create user');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success('User updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update user');
    },
  });
}
