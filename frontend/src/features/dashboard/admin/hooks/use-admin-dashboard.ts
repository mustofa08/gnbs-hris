import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '../api/admin-dashboard.api';

export function useAdminDashboard(year: number) {
  return useQuery({
    queryKey: ['admin-dashboard', year],
    queryFn: () => getAdminDashboard(year),
  });
}
