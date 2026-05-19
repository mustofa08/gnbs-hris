export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
export type PayrollStatus = 'DRAFT' | 'GENERATED' | 'PAID';
export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ActivityCategory = 'TEACHING' | 'DORMITORY' | 'RELIGIOUS' | 'ADMINISTRATIVE' | 'DISCIPLINE';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'RESIGNED' | 'TERMINATED';

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
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface RecentValidationSummary {
  id: string;
  status: ValidationStatus;
  submittedAt: string;
  validatedAt: string | null;
  employee: DashboardEmployeeSummary;
  activity: DashboardActivitySummary;
  schedule: DashboardScheduleSummary;
}

export interface RecentAttendanceSummary {
  id: string;
  attendanceStatus: AttendanceStatus;
  checkInTime: string;
  checkOutTime: string | null;
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
