import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ActivityCategory, CompensationType } from '../../../domain/activity.enums';

export class CreateActivityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  activityCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(ActivityCategory)
  category!: ActivityCategory;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must use HH:mm 24-hour format',
  })
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must use HH:mm 24-hour format',
  })
  endTime!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  location!: string;

  @IsEnum(CompensationType)
  compensationType!: CompensationType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compensationAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  penaltyAmount?: number;

  @IsOptional()
  @IsBoolean()
  requiresValidation?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
