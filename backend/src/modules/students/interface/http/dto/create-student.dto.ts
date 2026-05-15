import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../../../../employees/domain/employee.enums';
import { StudentStatus } from '../../../domain/student.enums';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  studentCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  birthPlace!: string;

  @Type(() => Date)
  @IsDate()
  birthDate!: Date;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  phoneNumber?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  className!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  academicYear!: string;

  @Type(() => Date)
  @IsDate()
  enrollmentDate!: Date;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dormitory!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  roomNumber!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  guardianName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  guardianPhone!: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  studentStatus?: StudentStatus;
}
