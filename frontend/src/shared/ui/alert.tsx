import type { PropsWithChildren } from 'react';
import { cn } from '@shared/lib/utils';

interface AlertProps extends PropsWithChildren {
  variant?: 'default' | 'destructive';
  title?: string;
  className?: string;
}

export function Alert({ children, className, title, variant = 'default' }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        variant === 'destructive'
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-border bg-card text-card-foreground',
        className,
      )}
      role="alert"
    >
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
