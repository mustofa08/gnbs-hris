import {
  Activity,
  BadgeCheck,
  Banknote,
  CalendarDays,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { routePaths } from '@app/router/route-paths';
import type { UserRole } from '@features/auth/types/auth.types';

export interface NavigationItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: routePaths.adminDashboard,
    icon: Gauge,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Employees',
    path: routePaths.adminEmployees,
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Students',
    path: routePaths.adminStudents,
    icon: GraduationCap,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Activities',
    path: routePaths.adminActivities,
    icon: Activity,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Schedules',
    path: routePaths.adminSchedules,
    icon: CalendarDays,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Validations',
    path: routePaths.adminValidations,
    icon: BadgeCheck,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Attendance',
    path: routePaths.adminAttendance,
    icon: ClipboardCheck,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Payroll',
    path: routePaths.adminPayroll,
    icon: Banknote,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Dashboard',
    path: routePaths.employeeDashboard,
    icon: Gauge,
    roles: ['EMPLOYEE'],
  },
  {
    label: 'My Schedule',
    path: routePaths.employeeSchedule,
    icon: CalendarDays,
    roles: ['EMPLOYEE'],
  },
  {
    label: 'My Attendance',
    path: routePaths.employeeAttendance,
    icon: ClipboardCheck,
    roles: ['EMPLOYEE'],
  },
  {
    label: 'My Validations',
    path: routePaths.employeeValidations,
    icon: BadgeCheck,
    roles: ['EMPLOYEE'],
  },
  {
    label: 'My Payroll',
    path: routePaths.employeePayroll,
    icon: Banknote,
    roles: ['EMPLOYEE'],
  },
];
