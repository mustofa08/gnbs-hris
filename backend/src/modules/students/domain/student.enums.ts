export const StudentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  GRADUATED: 'GRADUATED',
  TRANSFERRED: 'TRANSFERRED',
  DROPPED_OUT: 'DROPPED_OUT',
} as const;

export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];
