import { httpClient } from '@shared/api/http-client';
import type { PaginatedResponse } from '@shared/api/api-response.type';
import type { Employee, EmployeePayload, EmployeeQuery } from '../types/employee.types';

export async function getEmployees(query: EmployeeQuery) {
  const response = await httpClient.get<PaginatedResponse<Employee>>('/employees', { params: query });
  return response.data;
}

export async function getEmployee(id: string) {
  const response = await httpClient.get<Employee>(`/employees/${id}`);
  return response.data;
}

export async function createEmployee(payload: EmployeePayload) {
  const response = await httpClient.post<Employee>('/employees', payload);
  return response.data;
}

export async function updateEmployee(id: string, payload: Partial<EmployeePayload>) {
  const response = await httpClient.patch<Employee>(`/employees/${id}`, payload);
  return response.data;
}

export async function deleteEmployee(id: string) {
  const response = await httpClient.delete<{ message: string }>(`/employees/${id}`);
  return response.data;
}
