import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { EmptyState } from '@features/dashboard/admin/components/DashboardState';
import { Button } from '@shared/ui/button';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';
import { formatCurrency, formatEmployeeStatus } from '../lib/employee-formatters';
import type { Employee } from '../types/employee.types';

interface EmployeeTableProps {
  data: Employee[];
  deletingId?: string;
  onDelete: (id: string) => void;
}

export function EmployeeTable({ data, deletingId, onDelete }: EmployeeTableProps) {
  if (!data.length) {
    return <EmptyState message="No employees found." />;
  }

  return (
    <Table className="min-w-[900px]">
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.employeeCode}</TableCell>
            <TableCell>{employee.fullName}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.position}</TableCell>
            <TableCell>{formatEmployeeStatus(employee.employmentStatus)}</TableCell>
            <TableCell>{formatCurrency(employee.baseSalary)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button asChild variant="ghost" size="icon" title="View employee">
                  <Link to={`${routePaths.adminEmployees}/${employee.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" title="Edit employee">
                  <Link to={`${routePaths.adminEmployees}/${employee.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <ConfirmDialog
                  title="Delete employee?"
                  description={`This will soft delete ${employee.fullName}.`}
                  confirmLabel={deletingId === employee.id ? 'Deleting' : 'Delete'}
                  disabled={deletingId === employee.id}
                  onConfirm={() => onDelete(employee.id)}
                >
                  <Button variant="ghost" size="icon" title="Delete employee">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
