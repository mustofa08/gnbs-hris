import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';
import { SidebarNav } from './SidebarNav';
import type { UserRole } from '@features/auth/types/auth.types';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: UserRole | undefined;
}

export function DashboardSidebar({ collapsed, onToggle, role }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        'hidden min-h-screen shrink-0 border-r bg-card transition-[width] duration-200 lg:block',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-3">
        {collapsed ? (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            HR
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">Pesantren HRIS</p>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={collapsed ? 'hidden' : 'h-9 w-9'}
          onClick={onToggle}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      <div className="py-4">
        {collapsed ? (
          <div className="mb-3 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onToggle}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
        <SidebarNav collapsed={collapsed} role={role} />
      </div>
    </aside>
  );
}
