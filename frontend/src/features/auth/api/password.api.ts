import { apiClient } from '@infra/http/apiClient';

export const forgotPassword = async (
  email: string,
): Promise<{ message: string; resetUrl?: string; expiresAt?: string }> => {
  const res = await apiClient.post('/auth/forgot-password', { email });
  return res.data.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await apiClient.post('/auth/reset-password', { token, newPassword });
};
