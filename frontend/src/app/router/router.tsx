import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { AuthLayout } from '@app/layouts/AuthLayout';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { AuthRedirect } from './AuthRedirect';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { routePaths } from './route-paths';

function RoutePlaceholder() {
  return null;
}

export const router = createBrowserRouter([
  {
    element: <AuthRedirect />,
    children: [
      {
        path: routePaths.login,
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: routePaths.app,
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={routePaths.adminDashboard} replace /> },
          {
            element: <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />,
            children: [{ path: 'admin/dashboard', element: <RoutePlaceholder /> }],
          },
          {
            element: <RoleProtectedRoute allowedRoles={['EMPLOYEE']} />,
            children: [{ path: 'employee/dashboard', element: <RoutePlaceholder /> }],
          },
        ],
      },
    ],
  },
  {
    path: routePaths.root,
    element: <Navigate to={routePaths.app} replace />,
  },
]);
