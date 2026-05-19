import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { AuthLayout } from '@app/layouts/AuthLayout';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { AdminDashboardPage } from '@features/dashboard/admin/pages/AdminDashboardPage';
import { AuthRedirect } from './AuthRedirect';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { routePaths } from './route-paths';

function RoutePlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <div className="h-5 w-40 rounded bg-muted" />
      <div className="mt-4 h-4 w-full max-w-md rounded bg-muted" />
      <span className="sr-only">{title}</span>
    </div>
  );
}

function AppIndexRedirect() {
  return <Navigate to={routePaths.adminDashboard} replace />;
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
          { index: true, element: <AppIndexRedirect /> },
          {
            element: <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />,
            children: [
              { path: 'admin/dashboard', element: <AdminDashboardPage /> },
              { path: 'admin/employees', element: <RoutePlaceholder title="Employees" /> },
              { path: 'admin/students', element: <RoutePlaceholder title="Students" /> },
              { path: 'admin/activities', element: <RoutePlaceholder title="Activities" /> },
              { path: 'admin/schedules', element: <RoutePlaceholder title="Schedules" /> },
              { path: 'admin/validations', element: <RoutePlaceholder title="Validations" /> },
              { path: 'admin/attendance', element: <RoutePlaceholder title="Attendance" /> },
              { path: 'admin/payroll', element: <RoutePlaceholder title="Payroll" /> },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={['EMPLOYEE']} />,
            children: [
              { path: 'employee/dashboard', element: <RoutePlaceholder title="Employee dashboard" /> },
              { path: 'employee/schedule', element: <RoutePlaceholder title="My schedule" /> },
              { path: 'employee/attendance', element: <RoutePlaceholder title="My attendance" /> },
              { path: 'employee/validations', element: <RoutePlaceholder title="My validations" /> },
              { path: 'employee/payroll', element: <RoutePlaceholder title="My payroll" /> },
            ],
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
