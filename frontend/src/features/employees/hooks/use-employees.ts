import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { toast } from '@shared/ui/toast';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from '../api/employees.api';
import type { EmployeePayload, EmployeeQuery } from '../types/employee.types';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (query: EmployeeQuery) => [...employeeKeys.lists(), query] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};

export function useEmployees(query: EmployeeQuery) {
  return useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: () => getEmployees(query),
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => getEmployee(id!),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: EmployeePayload) => createEmployee(payload),
    onSuccess: async (employee) => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Employee created', employee.fullName);
      navigate(`${routePaths.adminEmployees}/${employee.id}`, { replace: true });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: Partial<EmployeePayload>) => updateEmployee(id, payload),
    onSuccess: async (employee) => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success('Employee updated', employee.fullName);
      navigate(`${routePaths.adminEmployees}/${employee.id}`, { replace: true });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success('Employee deleted');
    },
  });
}
