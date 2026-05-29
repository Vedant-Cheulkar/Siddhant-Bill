export const WORK_ORDER_KEYS = {
  all: ['work-orders'] as const,
  list: (params: object) => ['work-orders', 'list', params] as const,
  detail: (id: string) => ['work-orders', id] as const,
} as const;
