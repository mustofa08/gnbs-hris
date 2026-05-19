import { useQuery } from '@tanstack/react-query';
import { getEmployeeDashboard } from '../api/employee-dashboard.api';

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: getEmployeeDashboard,
  });
}
