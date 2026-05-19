import { httpClient } from '@shared/api/http-client';
import type { EmployeeDashboardResponse } from '../types/employee-dashboard.types';

export async function getEmployeeDashboard(): Promise<EmployeeDashboardResponse> {
  const response = await httpClient.get<EmployeeDashboardResponse>('/dashboard/employee');
  return response.data;
}
