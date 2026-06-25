import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

interface ListPageToolbarProps {
  tabs: ReactNode;
  search?: ReactNode;
  className?: string;
}

export function ListPageToolbar({ tabs, search, className }: ListPageToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex-1 min-w-0">{tabs}</div>
      {search && <div className="w-full sm:w-52 shrink-0">{search}</div>}
    </div>
  );
}
