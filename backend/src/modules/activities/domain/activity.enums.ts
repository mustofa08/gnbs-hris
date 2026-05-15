export const ActivityCategory = {
  TEACHING: 'TEACHING',
  DORMITORY: 'DORMITORY',
  RELIGIOUS: 'RELIGIOUS',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  DISCIPLINE: 'DISCIPLINE',
} as const;

export type ActivityCategory = (typeof ActivityCategory)[keyof typeof ActivityCategory];

export const CompensationType = {
  FIXED: 'FIXED',
  HOURLY: 'HOURLY',
  PER_SESSION: 'PER_SESSION',
} as const;

export type CompensationType = (typeof CompensationType)[keyof typeof CompensationType];
