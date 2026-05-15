import { ActivityCategory } from '../../../activities/domain/activity.enums';
import { EmploymentStatus } from '../../../employees/domain/employee.enums';
import { ValidationStatus } from '../../domain/validation.enums';

export interface ValidationScheduleResponse {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
}

export interface ValidationEmployeeResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
}

export interface ValidationActivityResponse {
  id: string;
  activityCode: string;
  name: string;
  category: ActivityCategory;
}

export interface ValidationReviewerResponse {
  id: string;
  email: string;
  name: string;
}

export interface ValidationResponse {
  id: string;
  scheduleId: string;
  employeeId: string;
  activityId: string;
  status: ValidationStatus;
  notes: string | null;
  evidenceUrl: string | null;
  submittedAt: Date;
  validatedAt: Date | null;
  validatedById: string | null;
  schedule: ValidationScheduleResponse;
  employee: ValidationEmployeeResponse;
  activity: ValidationActivityResponse;
  validatedBy: ValidationReviewerResponse | null;
  createdAt: Date;
  updatedAt: Date;
}
