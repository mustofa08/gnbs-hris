import { Role } from '../../modules/users/domain/role.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}
