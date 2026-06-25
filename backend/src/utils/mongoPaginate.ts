import type { PageResult } from './pagination.js';

export function buildPageResult<T>(
  content: T[],
  page: number,
  size: number,
  totalElements: number,
): PageResult<T> {
  const safeSize = Math.min(Math.max(size, 1), 100);
  const safePage = Math.max(page, 0);
  const totalPages = Math.max(1, Math.ceil(totalElements / safeSize));

  return {
    content,
    page: safePage,
    size: safeSize,
    totalElements,
    totalPages,
    last: safePage >= totalPages - 1,
  };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
