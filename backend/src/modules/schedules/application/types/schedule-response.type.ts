import { ActivityCategory } from '../../../activities/domain/activity.enums';
import { EmploymentStatus } from '../../../employees/domain/employee.enums';
import { RecurrenceType } from '../../domain/schedule.enums';

export interface ScheduleEmployeeResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
}

export interface ScheduleActivityResponse {
  id: string;
  activityCode: string;
  name: string;
  category: ActivityCategory;
  isActive: boolean;
}

export interface ScheduleResponse {
  id: string;
  title: string;
  description: string | null;
  employeeId: string;
  activityId: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  recurrenceType: RecurrenceType;
  recurrenceDays: string[];
  location: string;
  notes: string | null;
  isActive: boolean;
  employee: ScheduleEmployeeResponse;
  activity: ScheduleActivityResponse;
  createdAt: Date;
  updatedAt: Date;
}
