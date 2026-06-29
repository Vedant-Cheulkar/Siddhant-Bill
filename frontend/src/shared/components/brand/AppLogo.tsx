import { cn } from '@shared/utils/cn';

interface AppLogoProps {
  /** Full wordmark or icon-only mark (left crop). */
  variant?: 'full' | 'mark';
  className?: string;
  alt?: string;
}

export function AppLogo({
  variant = 'full',
  className,
  alt = 'Siddhant Logistics Billing Suite',
}: AppLogoProps) {
  const src = variant === 'mark' ? '/logo-mark.png' : '/logo.png';

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'object-contain object-left select-none',
        variant === 'full' ? 'h-9 w-auto max-w-full' : 'h-9 w-9',
        className,
      )}
    />
  );
}
