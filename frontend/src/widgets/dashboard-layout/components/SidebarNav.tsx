import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@shared/lib/utils';
import { getNavigationByRole, isNavigationItemActive } from '../lib/navigation';
import type { UserRole } from '@features/auth/types/auth.types';

interface SidebarNavProps {
  role: UserRole | undefined;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed = false, onNavigate, role }: SidebarNavProps) {
  const location = useLocation();
  const items = getNavigationByRole(role);

  return (
    <nav className="space-y-1 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isNavigationItemActive(location.pathname, item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              collapsed && 'justify-center px-2',
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {collapsed ? null : <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
