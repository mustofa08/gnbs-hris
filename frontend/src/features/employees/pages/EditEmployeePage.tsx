import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { DashboardPanelSkeleton } from '@features/dashboard/admin/components/DashboardState';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { EmployeeForm } from '../components/EmployeeForm';
import { useEmployee, useUpdateEmployee } from '../hooks/use-employees';
import type { EmployeePayload } from '../types/employee.types';

export function EditEmployeePage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const employeeQuery = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee(employeeId ?? '');

  const handleSubmit = (payload: EmployeePayload) => {
    updateEmployee.mutate(payload);
  };

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" className="px-0">
        <Link to={employeeId ? `${routePaths.adminEmployees}/${employeeId}` : routePaths.adminEmployees}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to employee
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Edit employee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update employment profile, contact details, and compensation metadata.
        </p>
      </div>

      {employeeQuery.isLoading ? <DashboardPanelSkeleton /> : null}

      {employeeQuery.isError ? (
        <Alert variant="destructive" title="Unable to load employee">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>The requested employee profile could not be loaded.</span>
            <Button type="button" variant="outline" onClick={() => employeeQuery.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : null}

      {updateEmployee.isError ? (
        <Alert variant="destructive" title="Update failed">
          The employee could not be updated. Please check the form and try again.
        </Alert>
      ) : null}

      {employeeQuery.data ? (
        <EmployeeForm
          employee={employeeQuery.data}
          isSubmitting={updateEmployee.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
