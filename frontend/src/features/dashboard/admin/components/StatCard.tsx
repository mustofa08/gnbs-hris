import type { ComponentType } from 'react';
import { cn } from '@shared/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}

export function StatCard({ className, description, icon: Icon, title, value }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-5 text-card-foreground shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {description ? <p className="mt-3 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}
