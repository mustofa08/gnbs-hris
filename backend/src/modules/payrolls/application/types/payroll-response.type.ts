import { EmploymentStatus } from '../../../employees/domain/employee.enums';
import { PayrollStatus } from '../../domain/payroll.enums';

export interface PayrollEmployeeResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
}

export interface PayrollResponse {
  id: string;
  employeeId: string;
  payrollPeriod: string;
  payrollStatus: PayrollStatus;
  totalActivities: number;
  totalAttendance: number;
  totalCompensation: string;
  totalPenalty: string;
  totalLatePenalty: string;
  finalAmount: string;
  generatedAt: Date;
  paidAt: Date | null;
  employee: PayrollEmployeeResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollSummaryResponse {
  payrollPeriod?: string;
  payrollStatus?: PayrollStatus;
  totalPayrolls: number;
  totalActivities: number;
  totalAttendance: number;
  totalCompensation: string;
  totalPenalty: string;
  totalLatePenalty: string;
  totalFinalAmount: string;
}
