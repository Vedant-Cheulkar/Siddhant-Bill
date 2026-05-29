import { cn } from '@shared/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded bg-stone-100', className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface rounded-card p-5 space-y-3 shadow-card', className)}>
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-7 w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-3 w-full" />
        </td>
      ))}
    </tr>
  );
}
