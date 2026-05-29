import { cn } from '@shared/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('w-5 h-5 border-2 border-border border-t-fg rounded-full animate-spin', className)}
    />
  );
}
