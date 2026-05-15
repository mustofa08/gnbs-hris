export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const EmploymentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PROBATION: 'PROBATION',
  RESIGNED: 'RESIGNED',
  TERMINATED: 'TERMINATED',
} as const;

export type EmploymentStatus = (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

export const SalaryType = {
  MONTHLY: 'MONTHLY',
  DAILY: 'DAILY',
  HOURLY: 'HOURLY',
} as const;

export type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];
