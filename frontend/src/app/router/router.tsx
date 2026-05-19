import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { AuthLayout } from '@app/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { routePaths } from './route-paths';

function RoutePlaceholder() {
  return null;
}

export const router = createBrowserRouter([
  {
    path: routePaths.login,
    element: <AuthLayout />,
    children: [{ index: true, element: <RoutePlaceholder /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: routePaths.app,
        element: <AppLayout />,
        children: [{ index: true, element: <RoutePlaceholder /> }],
      },
    ],
  },
  {
    path: routePaths.root,
    element: <Navigate to={routePaths.app} replace />,
  },
]);
