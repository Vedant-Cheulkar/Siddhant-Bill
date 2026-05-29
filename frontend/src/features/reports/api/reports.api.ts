import { apiClient } from '@infra/http/apiClient';
import type { DashboardResponse } from '../types/report.types';

export const getDashboard = async (fromDate?: string, toDate?: string): Promise<DashboardResponse> => {
  const res = await apiClient.get('/reports/dashboard', {
    params: { fromDate, toDate },
  });
  return res.data.data;
};
