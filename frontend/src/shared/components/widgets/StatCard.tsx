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

const VARIANT_STYLES: Record<
  CardVariant,
  { card: string; label: string; value: string; sub: string; iconWrap: string; trend?: string }
> = {
  indigo: {
    card:     'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-500/20',
    label:    'text-indigo-200',
    value:    'text-white',
    sub:      'text-indigo-200/80',
    iconWrap: 'bg-white/15 text-white backdrop-blur-sm',
    trend:    'bg-white/15 text-white',
  },
  blue: {
    card:     'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 shadow-lg shadow-blue-500/20',
    label:    'text-blue-100',
    value:    'text-white',
    sub:      'text-blue-100/80',
    iconWrap: 'bg-white/15 text-white backdrop-blur-sm',
    trend:    'bg-white/15 text-white',
  },
  emerald: {
    card:     'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/20',
    label:    'text-emerald-100',
    value:    'text-white',
    sub:      'text-emerald-100/80',
    iconWrap: 'bg-white/15 text-white backdrop-blur-sm',
    trend:    'bg-white/15 text-white',
  },
  amber: {
    card:     'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 shadow-lg shadow-amber-500/20',
    label:    'text-amber-100',
    value:    'text-white',
    sub:      'text-amber-100/80',
    iconWrap: 'bg-white/15 text-white backdrop-blur-sm',
    trend:    'bg-white/15 text-white',
  },
  default: {
    card:     'bg-surface shadow-card-md border border-border/50',
    label:    'text-muted',
    value:    'text-fg',
    sub:      'text-muted',
    iconWrap: 'bg-bg text-muted',
    trend:    '',
  },
};

export function StatCard({ label, value, sub, trend, icon, variant = 'default', className }: StatCardProps) {
  const s = VARIANT_STYLES[variant];

  return (
    <div className={cn('rounded-card overflow-hidden', s.card, className)}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={cn('text-xs font-semibold uppercase tracking-wider mb-2', s.label)}>{label}</p>
            <p className={cn('text-3xl font-bold tracking-tight leading-none', s.value)}>{value}</p>
            {sub && <p className={cn('text-xs mt-2.5 leading-relaxed', s.sub)}>{sub}</p>}
          </div>

          {icon && (
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', s.iconWrap)}>
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold mt-4 px-2 py-0.5 rounded-full',
              variant !== 'default'
                ? 'bg-white/15 text-white'
                : trend.up
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
