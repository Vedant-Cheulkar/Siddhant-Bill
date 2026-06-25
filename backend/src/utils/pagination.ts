export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export function paginate<T>(items: T[], page: number, size: number): PageResult<T> {
  const safeSize = Math.min(Math.max(size, 1), 100);
  const safePage = Math.max(page, 0);
  const total = items.length;
  const start = safePage * safeSize;
  const content = items.slice(start, start + safeSize);
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  return {
    content,
    page: safePage,
    size: safeSize,
    totalElements: total,
    totalPages,
    last: start + safeSize >= total,
  };
}

export function parsePageQuery(query: Record<string, unknown>) {
  return {
    page: Number(query.page ?? 0),
    size: Number(query.size ?? 20),
  };
}
