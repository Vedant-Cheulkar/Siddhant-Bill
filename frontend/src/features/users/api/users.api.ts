import { apiClient } from '@infra/http/apiClient';
import type { CreateUserRequest, UpdateUserRequest, UserSummary, ChangePasswordRequest } from '../types/user.types';

export const listUsers = async (): Promise<UserSummary[]> => {
  const res = await apiClient.get('/users');
  return res.data.data;
};

export const createUser = async (data: CreateUserRequest): Promise<UserSummary> => {
  const res = await apiClient.post('/users', data);
  return res.data.data;
};

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UserSummary> => {
  const res = await apiClient.patch(`/users/${id}`, data);
  return res.data.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.post('/auth/change-password', data);
};
