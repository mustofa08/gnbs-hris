import { IsEnum, IsOptional, Matches } from 'class-validator';
import { PayrollStatus } from '../../../domain/payroll.enums';

export class PayrollSummaryQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must use YYYY-MM format',
  })
  period?: string;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}
