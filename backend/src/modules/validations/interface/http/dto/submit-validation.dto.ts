import { IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

export class SubmitValidationDto {
  @IsUUID()
  scheduleId!: string;

  @IsUUID()
  employeeId!: string;

  @IsUUID()
  activityId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  evidenceUrl?: string;
}
