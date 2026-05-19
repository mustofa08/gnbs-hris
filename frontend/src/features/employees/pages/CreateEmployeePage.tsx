import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { EmployeeForm } from '../components/EmployeeForm';
import { useCreateEmployee } from '../hooks/use-employees';
import type { EmployeePayload } from '../types/employee.types';

export function CreateEmployeePage() {
  const createEmployee = useCreateEmployee();

  const handleSubmit = (payload: EmployeePayload) => {
    createEmployee.mutate(payload);
  };

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" className="px-0">
        <Link to={routePaths.adminEmployees}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to employees
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Create employee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new staff profile for scheduling, validation, attendance, and payroll workflows.
        </p>
      </div>

      {createEmployee.isError ? (
        <Alert variant="destructive" title="Create failed">
          The employee could not be created. Please check the form and try again.
        </Alert>
      ) : null}

      <EmployeeForm isSubmitting={createEmployee.isPending} onSubmit={handleSubmit} />
    </div>
  );
}
