import { apiClient } from '@infra/http/apiClient';
import type { AuthTokenResponse, UserProfile } from '../types/auth.types';

export const login = async (email: string, password: string): Promise<AuthTokenResponse> => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data.data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const res = await apiClient.get('/auth/me');
  return res.data.data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokenResponse> => {
  const res = await apiClient.post('/auth/refresh', { refreshToken });
  return res.data.data;
};

export const logout = async (refreshToken?: string): Promise<void> => {
  await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : undefined);
};
