import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/application/users.service';
import { SafeUser } from '../../users/application/types/safe-user.type';
import { Role } from '../../users/domain/role.enum';
import { ChangePasswordDto } from '../interface/http/dto/change-password.dto';
import { LoginDto } from '../interface/http/dto/login.dto';
import { RegisterDto } from '../interface/http/dto/register.dto';
import { AuthTokens } from './types/auth-tokens.type';
import { JwtPayload } from './types/jwt-payload.type';

interface AuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await this.hashSecret(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: Role.EMPLOYEE,
    });
    const tokens = await this.issueTokens(user.id, user.email, user.role);

    await this.usersService.updateRefreshTokenHash(user.id, await this.hashSecret(tokens.refreshToken));

    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser = this.usersService.toSafeUser(user);
    const tokens = await this.issueTokens(safeUser.id, safeUser.email, safeUser.role);

    await this.usersService.updateRefreshTokenHash(
      safeUser.id,
      await this.hashSecret(tokens.refreshToken),
    );
    await this.usersService.markLogin(safeUser.id);

    return { user: safeUser, tokens };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshTokenHash(userId, null);

    return { message: 'Logged out successfully' };
  }

  async refresh(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);

    if (!user?.refreshTokenHash) {
      throw new ForbiddenException('Refresh token is invalid');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Refresh token is invalid');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role as Role);
    await this.usersService.updateRefreshTokenHash(user.id, await this.hashSecret(tokens.refreshToken));

    return tokens;
  }

  async refreshByToken(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    return this.refresh(payload.sub, refreshToken);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);

    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.hashSecret(dto.newPassword);
    await this.usersService.updatePassword(userId, passwordHash);

    return { message: 'Password changed successfully' };
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    return this.usersService.findSafeById(userId);
  }

  private async issueTokens(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.configService.getOrThrow<string>('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async hashSecret(secret: string): Promise<string> {
    const saltRounds = this.configService.getOrThrow<number>('jwt.bcryptSaltRounds');
    return bcrypt.hash(secret, saltRounds);
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new ForbiddenException('Refresh token is invalid');
    }
  }
}
