export const ValidationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ValidationStatus = (typeof ValidationStatus)[keyof typeof ValidationStatus];
