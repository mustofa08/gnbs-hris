import { Gender } from '../../../employees/domain/employee.enums';
import { StudentStatus } from '../../domain/student.enums';

export interface StudentResponse {
  id: string;
  studentCode: string;
  fullName: string;
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  phoneNumber: string | null;
  address: string;
  className: string;
  academicYear: string;
  enrollmentDate: Date;
  dormitory: string;
  roomNumber: string;
  guardianName: string;
  guardianPhone: string;
  studentStatus: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}
