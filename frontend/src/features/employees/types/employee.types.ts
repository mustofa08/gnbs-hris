export type Gender = 'MALE' | 'FEMALE';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'RESIGNED' | 'TERMINATED';
export type SalaryType = 'MONTHLY' | 'DAILY' | 'HOURLY';

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  phoneNumber: string;
  address: string;
  department: string;
  position: string;
  joinDate: string;
  employmentStatus: EmploymentStatus;
  salaryType: SalaryType;
  baseSalary: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EmploymentStatus;
  department?: string;
}

export interface EmployeePayload {
  employeeCode: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  phoneNumber: string;
  address: string;
  department: string;
  position: string;
  joinDate: string;
  employmentStatus?: EmploymentStatus;
  salaryType: SalaryType;
  baseSalary: number;
  userId?: string;
}
