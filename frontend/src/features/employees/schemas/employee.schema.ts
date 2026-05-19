import { z } from 'zod';

export const employeeSchema = z.object({
  employeeCode: z.string().min(2, 'Employee code is required').max(50),
  fullName: z.string().min(2, 'Full name is required').max(150),
  gender: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().min(1, 'Birth date is required'),
  phoneNumber: z.string().min(8, 'Phone number is too short').max(30),
  address: z.string().min(5, 'Address is required').max(500),
  department: z.string().min(2, 'Department is required').max(100),
  position: z.string().min(2, 'Position is required').max(100),
  joinDate: z.string().min(1, 'Join date is required'),
  employmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'PROBATION', 'RESIGNED', 'TERMINATED']),
  salaryType: z.enum(['MONTHLY', 'DAILY', 'HOURLY']),
  baseSalary: z.coerce.number().min(0, 'Base salary cannot be negative'),
  userId: z.string().uuid('User ID must be a valid UUID').optional().or(z.literal('')),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
