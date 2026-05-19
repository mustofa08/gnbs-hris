import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { DashboardPanelSkeleton, EmptyState } from '@features/dashboard/admin/components/DashboardState';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { EmployeePagination } from '../components/EmployeePagination';
import { EmployeeTable } from '../components/EmployeeTable';
import { useDeleteEmployee, useEmployees } from '../hooks/use-employees';
import type { EmployeeQuery, EmploymentStatus } from '../types/employee.types';

const DEFAULT_LIMIT = 10;

export function EmployeeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<string>();

  const query = useMemo<EmployeeQuery>(() => {
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
    const search = searchParams.get('search') ?? undefined;
    const status = searchParams.get('status') as EmploymentStatus | null;
    const department = searchParams.get('department') ?? undefined;

    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
      search: search || undefined,
      status: status || undefined,
      department: department || undefined,
    };
  }, [searchParams]);

  const employeesQuery = useEmployees(query);
  const deleteEmployee = useDeleteEmployee();

  const updateQuery = (nextQuery: EmployeeQuery) => {
    const params = new URLSearchParams();

    params.set('page', String(nextQuery.page ?? 1));
    params.set('limit', String(nextQuery.limit ?? DEFAULT_LIMIT));

    if (nextQuery.search) params.set('search', nextQuery.search);
    if (nextQuery.status) params.set('status', nextQuery.status);
    if (nextQuery.department) params.set('department', nextQuery.department);

    setSearchParams(params);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteEmployee.mutate(id, {
      onSettled: () => setDeletingId(undefined),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage employee identity, department, role, and salary profile.
          </p>
        </div>
        <Button asChild>
          <Link to={`${routePaths.adminEmployees}/create`}>
            <Plus className="mr-2 h-4 w-4" />
            Create employee
          </Link>
        </Button>
      </div>

      <EmployeeFilters query={query} onChange={updateQuery} />

      {deleteEmployee.isError ? (
        <Alert variant="destructive" title="Delete failed">
          Unable to delete this employee. Please try again.
        </Alert>
      ) : null}

      {employeesQuery.isLoading ? <DashboardPanelSkeleton /> : null}

      {employeesQuery.isError ? (
        <Alert variant="destructive" title="Unable to load employees">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>The employee service did not respond successfully.</span>
            <Button type="button" variant="outline" onClick={() => employeesQuery.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : null}

      {employeesQuery.data ? (
        <div className="space-y-4">
          {employeesQuery.data.data.length ? (
            <EmployeeTable
              data={employeesQuery.data.data}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState message="No employees match the current filters." />
          )}
          <EmployeePagination
            meta={employeesQuery.data.meta}
            onPageChange={(page) => updateQuery({ ...query, page })}
          />
        </div>
      ) : null}
    </div>
  );
}
