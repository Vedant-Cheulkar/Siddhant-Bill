export const PRODUCT_KEYS = {
  all: ['products'] as const,
  list: (params: object) => ['products', 'list', params] as const,
  detail: (id: string) => ['products', id] as const,
} as const;
