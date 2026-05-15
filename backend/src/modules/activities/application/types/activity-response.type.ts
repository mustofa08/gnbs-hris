import { ActivityCategory, CompensationType } from '../../domain/activity.enums';

export interface ActivityResponse {
  id: string;
  activityCode: string;
  name: string;
  description: string | null;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
  location: string;
  compensationType: CompensationType;
  compensationAmount: string;
  penaltyAmount: string;
  requiresValidation: boolean;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
