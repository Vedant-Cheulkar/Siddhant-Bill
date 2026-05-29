import { cn } from '@shared/utils/cn';
import type { ReactNode } from 'react';

type CardVariant = 'indigo' | 'blue' | 'emerald' | 'amber' | 'default';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: { value: string; up: boolean };
  icon?: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const VARIANT_STYLES: Record<CardVariant, { stripe: string; iconWrap: string }> = {
  indigo:  { stripe: 'bg-accent',      iconWrap: 'bg-accent-bg   text-accent' },
  blue:    { stripe: 'bg-blue-500',    iconWrap: 'bg-blue-50     text-blue-600' },
  emerald: { stripe: 'bg-emerald-500', iconWrap: 'bg-emerald-50  text-emerald-600' },
  amber:   { stripe: 'bg-amber-500',   iconWrap: 'bg-amber-50    text-amber-600' },
  default: { stripe: 'bg-border',      iconWrap: 'bg-bg          text-muted' },
};

export function StatCard({ label, value, sub, trend, icon, variant = 'default', className }: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={cn('bg-surface rounded-card shadow-card overflow-hidden', className)}>
      {/* Coloured top stripe */}
      <div className={cn('h-1 w-full', styles.stripe)} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted font-medium mb-1.5">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-fg leading-none">{value}</p>
            {sub && <p className="text-xs text-muted mt-2 leading-relaxed">{sub}</p>}
          </div>

          {icon && (
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', styles.iconWrap)}>
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold mt-3 px-2 py-0.5 rounded-full',
              trend.up
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            )}
          >
            <span>{trend.up ? '↑' : '↓'}</span>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
