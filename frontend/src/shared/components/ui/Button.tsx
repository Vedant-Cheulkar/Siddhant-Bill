import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shared/utils/cn';
import type { ButtonHTMLAttributes } from 'react';

const button = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium rounded-input transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap select-none',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
        outline: 'border border-border bg-surface text-fg hover:bg-bg hover:border-border-strong',
        ghost:   'text-fg hover:bg-bg',
        danger:  'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        soft:    'bg-accent-bg text-accent-text hover:bg-indigo-100 font-semibold',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 h-7',
        md: 'text-sm px-4 py-2 h-9',
        lg: 'text-sm px-5 py-2.5 h-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
