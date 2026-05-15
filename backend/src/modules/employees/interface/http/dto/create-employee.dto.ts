import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EmploymentStatus, Gender, SalaryType } from '../../../domain/employee.enums';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  employeeCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @Type(() => Date)
  @IsDate()
  birthDate!: Date;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  phoneNumber!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  department!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  position!: string;

  @Type(() => Date)
  @IsDate()
  joinDate!: Date;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @IsEnum(SalaryType)
  salaryType!: SalaryType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseSalary!: number;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
