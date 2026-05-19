import { Menu } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
import { UserMenu } from './UserMenu';
import type { AuthUser } from '@features/auth/types/auth.types';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
  user: AuthUser | null;
}

export function TopNavbar({ onOpenMobileSidebar, user }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <DashboardBreadcrumbs />
      </div>
      <UserMenu user={user} />
    </header>
  );
}
