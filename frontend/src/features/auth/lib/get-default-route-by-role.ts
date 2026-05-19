import { routePaths } from '@app/router/route-paths';
import type { UserRole } from '../types/auth.types';

export function getDefaultRouteByRole(role: UserRole): string {
  if (role === 'EMPLOYEE') {
    return routePaths.employeeDashboard;
  }

  return routePaths.adminDashboard;
}
