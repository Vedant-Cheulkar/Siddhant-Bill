import { cn } from '@shared/utils/cn';

interface Tab<T> {
  label: string;
  value: T;
  count?: number;
}

interface TabBarProps<T> {
  tabs: Tab<T>[];
  active: T;
  onChange: (v: T) => void;
  className?: string;
}

export function TabBar<T extends string | number>({
  tabs,
  active,
  onChange,
  className,
}: TabBarProps<T>) {
  return (
    <div className={cn('overflow-x-auto -mx-1 px-1', className)}>
      <div className="flex items-end gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={String(tab.value)}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                'px-3 pb-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap',
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-fg hover:border-border-strong'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                    isActive
                      ? 'bg-accent-bg text-accent-text'
                      : 'bg-bg text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
