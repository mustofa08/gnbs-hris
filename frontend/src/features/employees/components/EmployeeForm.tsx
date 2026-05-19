import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Textarea } from '@shared/ui/textarea';
import { employeeSchema, type EmployeeFormValues } from '../schemas/employee.schema';
import type { Employee, EmployeePayload } from '../types/employee.types';
import { toDateInputValue } from '../lib/employee-formatters';

interface EmployeeFormProps {
  employee?: Employee;
  isSubmitting: boolean;
  onSubmit: (payload: EmployeePayload) => void;
}

export function EmployeeForm({ employee, isSubmitting, onSubmit }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          gender: employee.gender,
          birthDate: toDateInputValue(employee.birthDate),
          phoneNumber: employee.phoneNumber,
          address: employee.address,
          department: employee.department,
          position: employee.position,
          joinDate: toDateInputValue(employee.joinDate),
          employmentStatus: employee.employmentStatus,
          salaryType: employee.salaryType,
          baseSalary: Number(employee.baseSalary),
          userId: employee.userId ?? '',
        }
      : {
          employeeCode: '',
          fullName: '',
          gender: 'MALE',
          birthDate: '',
          phoneNumber: '',
          address: '',
          department: '',
          position: '',
          joinDate: '',
          employmentStatus: 'ACTIVE',
          salaryType: 'MONTHLY',
          baseSalary: 0,
          userId: '',
        },
  });

  const submit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      userId: values.userId || undefined,
      baseSalary: Number(values.baseSalary),
    });
  });

  return (
    <form className="space-y-6 rounded-lg border bg-card p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Employee code" error={form.formState.errors.employeeCode?.message}>
          <Input disabled={isSubmitting} {...form.register('employeeCode')} />
        </Field>
        <Field label="Full name" error={form.formState.errors.fullName?.message}>
          <Input disabled={isSubmitting} {...form.register('fullName')} />
        </Field>
        <Field label="Gender" error={form.formState.errors.gender?.message}>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            disabled={isSubmitting}
            {...form.register('gender')}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </Field>
        <Field label="Birth date" error={form.formState.errors.birthDate?.message}>
          <Input type="date" disabled={isSubmitting} {...form.register('birthDate')} />
        </Field>
        <Field label="Phone number" error={form.formState.errors.phoneNumber?.message}>
          <Input disabled={isSubmitting} {...form.register('phoneNumber')} />
        </Field>
        <Field label="Department" error={form.formState.errors.department?.message}>
          <Input disabled={isSubmitting} {...form.register('department')} />
        </Field>
        <Field label="Position" error={form.formState.errors.position?.message}>
          <Input disabled={isSubmitting} {...form.register('position')} />
        </Field>
        <Field label="Join date" error={form.formState.errors.joinDate?.message}>
          <Input type="date" disabled={isSubmitting} {...form.register('joinDate')} />
        </Field>
        <Field label="Employment status" error={form.formState.errors.employmentStatus?.message}>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            disabled={isSubmitting}
            {...form.register('employmentStatus')}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PROBATION">Probation</option>
            <option value="RESIGNED">Resigned</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </Field>
        <Field label="Salary type" error={form.formState.errors.salaryType?.message}>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            disabled={isSubmitting}
            {...form.register('salaryType')}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="DAILY">Daily</option>
            <option value="HOURLY">Hourly</option>
          </select>
        </Field>
        <Field label="Base salary" error={form.formState.errors.baseSalary?.message}>
          <Input
            type="number"
            min={0}
            step="0.01"
            disabled={isSubmitting}
            {...form.register('baseSalary')}
          />
        </Field>
        <Field label="Linked user ID" error={form.formState.errors.userId?.message}>
          <Input placeholder="Optional UUID" disabled={isSubmitting} {...form.register('userId')} />
        </Field>
      </div>
      <Field label="Address" error={form.formState.errors.address?.message}>
        <Textarea disabled={isSubmitting} {...form.register('address')} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {employee ? 'Save changes' : 'Create employee'}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-sm font-normal text-destructive">{error}</span> : null}
    </label>
  );
}
