import { IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/pagination/pagination-query.dto';
import { PayrollStatus } from '../../../domain/payroll.enums';

export class PayrollQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must use YYYY-MM format',
  })
  period?: string;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}
