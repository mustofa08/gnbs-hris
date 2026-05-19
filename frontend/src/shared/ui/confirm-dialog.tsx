import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { PropsWithChildren } from 'react';
import { Button } from './button';

interface ConfirmDialogProps extends PropsWithChildren {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  cancelLabel = 'Cancel',
  children,
  confirmLabel = 'Confirm',
  description,
  disabled,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="outline" disabled={disabled}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button type="button" variant="destructive" disabled={disabled} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
