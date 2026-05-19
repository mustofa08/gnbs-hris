import { ArrowLeft, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { DashboardPanelSkeleton } from '@features/dashboard/admin/components/DashboardState';
import { Alert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { useDeleteEmployee, useEmployee } from '../hooks/use-employees';
import {
  formatCurrency,
  formatEmployeeStatus,
  toDateInputValue,
} from '../lib/employee-formatters';

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const employeeQuery = useEmployee(employeeId);
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = () => {
    if (!employeeId) return;

    deleteEmployee.mutate(employeeId, {
      onSuccess: () => navigate(routePaths.adminEmployees, { replace: true }),
    });
  };

  const employee = employeeQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" className="px-0">
          <Link to={routePaths.adminEmployees}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to employees
          </Link>
        </Button>

        {employee ? (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`${routePaths.adminEmployees}/${employee.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <ConfirmDialog
              title="Delete employee?"
              description={`This will soft delete ${employee.fullName}.`}
              confirmLabel={deleteEmployee.isPending ? 'Deleting' : 'Delete'}
              disabled={deleteEmployee.isPending}
              onConfirm={handleDelete}
            >
              <Button type="button" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </ConfirmDialog>
          </div>
        ) : null}
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

      {deleteEmployee.isError ? (
        <Alert variant="destructive" title="Delete failed">
          Unable to delete this employee. Please try again.
        </Alert>
      ) : null}

      {employee ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">{employee.fullName}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{employee.employeeCode}</p>
              </div>
              <span className="w-fit rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {formatEmployeeStatus(employee.employmentStatus)}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <DetailItem label="Gender" value={formatEmployeeStatus(employee.gender)} />
              <DetailItem label="Phone number" value={employee.phoneNumber} />
              <DetailItem label="Department" value={employee.department} />
              <DetailItem label="Position" value={employee.position} />
              <DetailItem label="Birth date" value={toDateInputValue(employee.birthDate)} />
              <DetailItem label="Join date" value={toDateInputValue(employee.joinDate)} />
              <DetailItem label="Salary type" value={formatEmployeeStatus(employee.salaryType)} />
              <DetailItem label="Base salary" value={formatCurrency(employee.baseSalary)} />
              <DetailItem label="Linked user ID" value={employee.userId ?? 'Not linked'} />
              <DetailItem
                label="Last updated"
                value={new Date(employee.updatedAt).toLocaleString('id-ID')}
              />
            </div>

            <div className="mt-5 rounded-md border bg-background p-4">
              <p className="text-sm font-medium">Address</p>
              <p className="mt-2 text-sm text-muted-foreground">{employee.address}</p>
            </div>
          </section>

          <aside className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Employee workflow</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <DetailItem label="Scheduling" value="Available through Schedule module" />
              <DetailItem label="Attendance" value="Tracked through Attendance module" />
              <DetailItem label="Payroll" value="Calculated through Payroll module" />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}
