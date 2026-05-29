export const INVOICE_KEYS = {
  all: ['invoices'] as const,
  list: (params: object) => ['invoices', 'list', params] as const,
  detail: (id: string) => ['invoices', id] as const,
} as const;
