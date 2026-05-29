export const CUSTOMER_KEYS = {
  all: ['customers'] as const,
  list: (params: object) => ['customers', 'list', params] as const,
  detail: (id: string) => ['customers', id] as const,
} as const;
