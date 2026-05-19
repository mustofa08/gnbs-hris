import { ActivityCategory } from '../../../activities/domain/activity.enums';
import { AttendanceStatus } from '../../../attendances/domain/attendance.enums';
import { EmploymentStatus } from '../../../employees/domain/employee.enums';
import { PayrollStatus } from '../../../payrolls/domain/payroll.enums';
import { ValidationStatus } from '../../../validations/domain/validation.enums';

export interface CountByStatus<TStatus extends string> {
  status: TStatus;
  count: number;
}

export interface MonthlyPayrollTotal {
  period: string;
  totalFinalAmount: string;
  totalPayrolls: number;
}

export interface DashboardEmployeeSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
}

export interface DashboardActivitySummary {
  id: string;
  activityCode: string;
  name: string;
  category: ActivityCategory;
}

export interface DashboardScheduleSummary {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: string;
}

export interface RecentValidationSummary {
  id: string;
  status: ValidationStatus;
  submittedAt: Date;
  validatedAt: Date | null;
  employee: DashboardEmployeeSummary;
  activity: DashboardActivitySummary;
  schedule: DashboardScheduleSummary;
}

export interface RecentAttendanceSummary {
  id: string;
  attendanceStatus: AttendanceStatus;
  checkInTime: Date;
  checkOutTime: Date | null;
  lateMinutes: number;
  employee: DashboardEmployeeSummary;
  activity: DashboardActivitySummary;
  schedule: DashboardScheduleSummary;
}

export interface AdminDashboardResponse {
  totals: {
    employees: number;
    students: number;
    activities: number;
    schedules: number;
  };
  validations: {
    pending: number;
    approved: number;
  };
  attendanceStatistics: CountByStatus<AttendanceStatus>[];
  payrollStatistics: {
    byStatus: CountByStatus<PayrollStatus>[];
    totalCompensation: string;
    totalPenalty: string;
    totalLatePenalty: string;
    totalFinalAmount: string;
  };
  monthlyPayrollTotals: MonthlyPayrollTotal[];
  recentValidations: RecentValidationSummary[];
  recentAttendanceRecords: RecentAttendanceSummary[];
}

export interface EmployeeDashboardResponse {
  profile: DashboardEmployeeSummary;
  attendanceSummary: CountByStatus<AttendanceStatus>[];
  payrollSummary: {
    totalPayrolls: number;
    totalFinalAmount: string;
    latestPayrollPeriod: string | null;
    latestPayrollStatus: PayrollStatus | null;
  };
  upcomingSchedules: DashboardScheduleSummary[];
  recentValidations: RecentValidationSummary[];
}
