import { Role } from '../../domain/role.enum';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
