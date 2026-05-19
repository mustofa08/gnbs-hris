import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routePaths } from './route-paths';
import { useAuthStore } from '@features/auth/store/auth.store';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
