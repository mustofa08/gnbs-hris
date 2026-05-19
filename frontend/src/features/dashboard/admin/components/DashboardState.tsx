import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';

export function DashboardCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-5', className)}>
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="mt-4 h-8 w-20 rounded bg-muted" />
      <div className="mt-3 h-3 w-32 rounded bg-muted" />
    </div>
  );
}

export function DashboardPanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-5', className)}>
      <div className="h-5 w-40 rounded bg-muted" />
      <div className="mt-6 h-64 rounded bg-muted" />
    </div>
  );
}

export function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
      <h2 className="mt-4 text-lg font-semibold">Unable to load dashboard</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The analytics service did not respond successfully.
      </p>
      <Button type="button" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
