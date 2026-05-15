import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/pagination/pagination-query.dto';
import { StudentStatus } from '../../../domain/student.enums';

export class StudentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  className?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dormitory?: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
