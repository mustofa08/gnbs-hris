export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
export type PayrollStatus = 'DRAFT' | 'GENERATED' | 'PAID';
export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'RESIGNED' | 'TERMINATED';
export type ActivityCategory = 'TEACHING' | 'DORMITORY' | 'RELIGIOUS' | 'ADMINISTRATIVE' | 'DISCIPLINE';

export interface CountByStatus<TStatus extends string> {
  status: TStatus;
  count: number;
}

export interface EmployeeProfileSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
}

export interface EmployeeScheduleSummary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface EmployeeActivitySummary {
  id: string;
  activityCode: string;
  name: string;
  category: ActivityCategory;
}

export interface EmployeeRecentValidation {
  id: string;
  status: ValidationStatus;
  submittedAt: string;
  validatedAt: string | null;
  activity: EmployeeActivitySummary;
  schedule: EmployeeScheduleSummary;
}

export interface EmployeeDashboardResponse {
  profile: EmployeeProfileSummary;
  attendanceSummary: CountByStatus<AttendanceStatus>[];
  payrollSummary: {
    totalPayrolls: number;
    totalFinalAmount: string;
    latestPayrollPeriod: string | null;
    latestPayrollStatus: PayrollStatus | null;
  };
  upcomingSchedules: EmployeeScheduleSummary[];
  recentValidations: EmployeeRecentValidation[];
}
