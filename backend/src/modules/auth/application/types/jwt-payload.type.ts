import { Role } from '../../../users/domain/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
