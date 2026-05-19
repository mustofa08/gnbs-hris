import { httpClient } from '@shared/api/http-client';
import type { AdminDashboardResponse } from '../types/admin-dashboard.types';

export async function getAdminDashboard(year?: number): Promise<AdminDashboardResponse> {
  const response = await httpClient.get<AdminDashboardResponse>('/dashboard/admin', {
    params: year ? { year } : undefined,
  });

  return response.data;
}
