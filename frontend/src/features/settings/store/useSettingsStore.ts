import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CompanySettings {
  name: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  stateCode: string;
  phone: string;
  email: string;
}

export interface InvoiceSettings {
  prefix: string;
  startingNumber: number;
  defaultDueDays: number;
  terms: string;
}

export interface TaxSettings {
  defaultRate: number;
}

interface SettingsState {
  company: CompanySettings;
  invoice: InvoiceSettings;
  tax: TaxSettings;
  updateCompany: (data: Partial<CompanySettings>) => void;
  updateInvoice: (data: Partial<InvoiceSettings>) => void;
  updateTax: (data: Partial<TaxSettings>) => void;
}

const DEFAULT_COMPANY: CompanySettings = {
  name: 'Siddhant Logistics',
  gstin: '',
  pan: '',
  address: '',
  city: '',
  stateCode: '27',
  phone: '',
  email: '',
};

const DEFAULT_INVOICE: InvoiceSettings = {
  prefix: 'SL',
  startingNumber: 1,
  defaultDueDays: 30,
  terms: 'Payment due within 30 days of invoice date. Late payments may attract 2% per month interest.',
};

const DEFAULT_TAX: TaxSettings = {
  defaultRate: 18,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      company: DEFAULT_COMPANY,
      invoice: DEFAULT_INVOICE,
      tax: DEFAULT_TAX,

      updateCompany: (data) =>
        set((s) => ({ company: { ...s.company, ...data } })),

      updateInvoice: (data) =>
        set((s) => ({ invoice: { ...s.invoice, ...data } })),

      updateTax: (data) =>
        set((s) => ({ tax: { ...s.tax, ...data } })),
    }),
    {
      name: 'siddhant-logistics-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
