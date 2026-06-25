import { Button } from '@shared/components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  isLast: boolean;
  onPageChange: (p: number) => void;
  totalElements?: number;
}

export function Pagination({
  page,
  totalPages,
  isLast,
  onPageChange,
  totalElements,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-5 py-3 border-t border-border">
      {totalElements !== undefined ? (
        <p className="text-xs text-muted">{totalElements.toLocaleString('en-IN')} total</p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-xs text-muted">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
