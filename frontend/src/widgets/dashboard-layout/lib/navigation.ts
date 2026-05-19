import { navigationItems } from '../config/navigation.config';
import type { UserRole } from '@features/auth/types/auth.types';

export function getNavigationByRole(role: UserRole | undefined) {
  if (!role) {
    return [];
  }

  return navigationItems.filter((item) => item.roles.includes(role));
}

export function isNavigationItemActive(pathname: string, itemPath: string) {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => ({
    label: segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    path: `/${segments.slice(0, index + 1).join('/')}`,
  }));
}
