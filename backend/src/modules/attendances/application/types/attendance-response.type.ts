import { ActivityCategory } from '../../../activities/domain/activity.enums';
import { EmploymentStatus } from '../../../employees/domain/employee.enums';
import { AttendanceStatus } from '../../domain/attendance.enums';

export interface AttendanceEmployeeResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
}

export interface AttendanceActivityResponse {
  id: string;
  activityCode: string;
  name: string;
  category: ActivityCategory;
}

export interface AttendanceScheduleResponse {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: string;
}

export interface AttendanceResponse {
  id: string;
  employeeId: string;
  scheduleId: string;
  activityId: string;
  attendanceStatus: AttendanceStatus;
  checkInTime: Date;
  checkOutTime: Date | null;
  lateMinutes: number;
  notes: string | null;
  employee: AttendanceEmployeeResponse;
  activity: AttendanceActivityResponse;
  schedule: AttendanceScheduleResponse;
  createdAt: Date;
  updatedAt: Date;
}
