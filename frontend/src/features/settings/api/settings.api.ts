import { apiClient } from '@infra/http/apiClient';
import type { CompanySettings, InvoiceSettings, TaxSettings } from '../store/useSettingsStore';

export interface OrganizationSettings {
  company: CompanySettings;
  invoice: InvoiceSettings;
  tax: TaxSettings;
}

export const getSettings = async (): Promise<OrganizationSettings> => {
  const res = await apiClient.get('/settings');
  return res.data.data;
};

export const updateSettings = async (
  data: Partial<OrganizationSettings>,
): Promise<OrganizationSettings> => {
  const res = await apiClient.put('/settings', data);
  return res.data.data;
};
