import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckOutAttendanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
