import { X } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { SidebarNav } from './SidebarNav';
import type { UserRole } from '@features/auth/types/auth.types';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  role: UserRole | undefined;
}

export function MobileSidebar({ onClose, open, role }: MobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigation backdrop"
      />
      <aside className="absolute inset-y-0 left-0 w-72 border-r bg-card shadow-xl">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div>
            <p className="text-sm font-semibold">Pesantren HRIS</p>
            <p className="text-xs text-muted-foreground">Navigation</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="py-4">
          <SidebarNav role={role} onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
}
