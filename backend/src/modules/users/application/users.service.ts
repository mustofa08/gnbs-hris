import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { Role } from '../domain/role.enum';
import { SafeUser } from './types/safe-user.type';

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role?: Role;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<SafeUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role ?? Role.EMPLOYEE,
      },
    });

    return this.toSafeUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findSafeById(id: string): Promise<SafeUser> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        refreshTokenHash: null,
      },
    });
  }

  async markLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
