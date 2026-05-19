import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultRouteByRole } from '@features/auth/lib/get-default-route-by-role';
import { useAuthStore } from '@features/auth/store/auth.store';

export function AuthRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <Outlet />;
}
