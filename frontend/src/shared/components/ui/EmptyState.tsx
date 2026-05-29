import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No results',
  description = 'Nothing matches your current filters.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center">
        <FileSearch size={22} className="text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      {action}
    </div>
  );
}
