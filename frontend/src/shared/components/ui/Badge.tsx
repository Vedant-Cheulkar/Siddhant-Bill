import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shared/utils/cn';
import type { InvoiceStatus } from '@features/invoices/types/invoice.types';

const badge = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
  {
    variants: {
      variant: {
        issued:    'bg-blue-50   text-blue-700   ring-1 ring-inset ring-blue-200/60',
        draft:     'bg-zinc-100  text-zinc-600   ring-1 ring-inset ring-zinc-200/60',
        cancelled: 'bg-red-50    text-red-600    ring-1 ring-inset ring-red-200/60',
        active:    'bg-green-50  text-green-700  ring-1 ring-inset ring-green-200/60',
        inactive:  'bg-zinc-100  text-zinc-500   ring-1 ring-inset ring-zinc-200/60',
        accent:    'bg-accent-bg text-accent-text ring-1 ring-inset ring-indigo-200/60',
      },
    },
    defaultVariants: { variant: 'draft' },
  }
);

const DOT_COLOR: Record<string, string> = {
  issued:    'bg-blue-500',
  draft:     'bg-zinc-400',
  cancelled: 'bg-red-500',
  active:    'bg-green-500',
  inactive:  'bg-zinc-400',
  accent:    'bg-accent',
};

const STATUS_VARIANT: Record<InvoiceStatus, VariantProps<typeof badge>['variant']> = {
  ISSUED:    'issued',
  DRAFT:     'draft',
  CANCELLED: 'cancelled',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  ISSUED:    'Issued',
  DRAFT:     'Draft',
  CANCELLED: 'Cancelled',
};

interface InvoiceBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceBadgeProps) {
  const variant = STATUS_VARIANT[status] as string;
  return (
    <span className={cn(badge({ variant: STATUS_VARIANT[status] }), className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLOR[variant])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

interface BadgeProps extends VariantProps<typeof badge> {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant, children, className, dot }: BadgeProps) {
  const v = (variant ?? 'draft') as string;
  return (
    <span className={cn(badge({ variant }), className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLOR[v])} />}
      {children}
    </span>
  );
}
