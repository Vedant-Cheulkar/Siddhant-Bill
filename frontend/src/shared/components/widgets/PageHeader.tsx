interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-fg tracking-tight">{title}</h1>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
}
