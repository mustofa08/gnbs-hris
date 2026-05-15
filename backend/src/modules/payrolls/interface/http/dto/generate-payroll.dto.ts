import { IsString, IsUUID, Matches } from 'class-validator';

export class GeneratePayrollDto {
  @IsUUID()
  employeeId!: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'payrollPeriod must use YYYY-MM format',
  })
  payrollPeriod!: string;
}
