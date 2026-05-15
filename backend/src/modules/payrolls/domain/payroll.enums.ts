export const PayrollStatus = {
  DRAFT: 'DRAFT',
  GENERATED: 'GENERATED',
  PAID: 'PAID',
} as const;

export type PayrollStatus = (typeof PayrollStatus)[keyof typeof PayrollStatus];
