export const RecurrenceType = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export type RecurrenceType = (typeof RecurrenceType)[keyof typeof RecurrenceType];
