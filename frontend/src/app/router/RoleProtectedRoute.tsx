import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultRouteByRole } from '@features/auth/lib/get-default-route-by-role';
import { useAuthStore } from '@features/auth/store/auth.store';
import type { UserRole } from '@features/auth/types/auth.types';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <Outlet />;
}
