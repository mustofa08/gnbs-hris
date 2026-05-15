import { EmploymentStatus, Gender, SalaryType } from '../../domain/employee.enums';

export interface EmployeeResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  gender: Gender;
  birthDate: Date;
  phoneNumber: string;
  address: string;
  department: string;
  position: string;
  joinDate: Date;
  employmentStatus: EmploymentStatus;
  salaryType: SalaryType;
  baseSalary: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
