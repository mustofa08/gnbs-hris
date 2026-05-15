import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Employee, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import {
  EmploymentStatus,
  Gender,
  SalaryType,
} from '../domain/employee.enums';
import { CreateEmployeeDto } from '../interface/http/dto/create-employee.dto';
import { EmployeeQueryDto } from '../interface/http/dto/employee-query.dto';
import { UpdateEmployeeDto } from '../interface/http/dto/update-employee.dto';
import { EmployeeResponse } from './types/employee-response.type';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    await this.ensureEmployeeCodeIsAvailable(dto.employeeCode);
    await this.ensureUserCanBeLinked(dto.userId);

    const employee = await this.prisma.employee.create({
      data: this.toCreateInput(dto),
    });

    return this.toResponse(employee);
  }

  async findAll(query: EmployeeQueryDto): Promise<PaginatedResult<EmployeeResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildWhereInput(query);

    const [employees, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: employees.map((employee) => this.toResponse(employee)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<EmployeeResponse> {
    const employee = await this.findActiveEmployeeById(id);
    return this.toResponse(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeResponse> {
    await this.findActiveEmployeeById(id);

    if (dto.employeeCode) {
      await this.ensureEmployeeCodeIsAvailable(dto.employeeCode, id);
    }

    if (dto.userId !== undefined) {
      await this.ensureUserCanBeLinked(dto.userId, id);
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: this.toUpdateInput(dto),
    });

    return this.toResponse(employee);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findActiveEmployeeById(id);

    await this.prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        userId: null,
      },
    });

    return { message: 'Employee deleted successfully' };
  }

  private buildWhereInput(query: EmployeeQueryDto): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.employmentStatus = query.status;
    }

    if (query.department) {
      where.department = {
        equals: query.department,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      where.OR = [
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
        { position: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async findActiveEmployeeById(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  private async ensureEmployeeCodeIsAvailable(employeeCode: string, currentEmployeeId?: string): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (employee && employee.id !== currentEmployeeId) {
      throw new ConflictException('Employee code is already used');
    }
  }

  private async ensureUserCanBeLinked(userId?: string, currentEmployeeId?: string): Promise<void> {
    if (!userId) {
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException('Linked user not found');
    }

    if (user.employee && user.employee.id !== currentEmployeeId) {
      throw new ConflictException('User is already linked to another employee');
    }
  }

  private toCreateInput(dto: CreateEmployeeDto): Prisma.EmployeeCreateInput {
    return {
      employeeCode: dto.employeeCode,
      fullName: dto.fullName,
      gender: dto.gender,
      birthDate: dto.birthDate,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      department: dto.department,
      position: dto.position,
      joinDate: dto.joinDate,
      employmentStatus: dto.employmentStatus ?? EmploymentStatus.ACTIVE,
      salaryType: dto.salaryType,
      baseSalary: new Prisma.Decimal(dto.baseSalary),
      user: dto.userId ? { connect: { id: dto.userId } } : undefined,
    };
  }

  private toUpdateInput(dto: UpdateEmployeeDto): Prisma.EmployeeUpdateInput {
    return {
      employeeCode: dto.employeeCode,
      fullName: dto.fullName,
      gender: dto.gender,
      birthDate: dto.birthDate,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      department: dto.department,
      position: dto.position,
      joinDate: dto.joinDate,
      employmentStatus: dto.employmentStatus,
      salaryType: dto.salaryType,
      baseSalary: dto.baseSalary === undefined ? undefined : new Prisma.Decimal(dto.baseSalary),
      user:
        dto.userId === undefined
          ? undefined
          : dto.userId
            ? { connect: { id: dto.userId } }
            : { disconnect: true },
    };
  }

  private toResponse(employee: Employee): EmployeeResponse {
    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      gender: employee.gender as Gender,
      birthDate: employee.birthDate,
      phoneNumber: employee.phoneNumber,
      address: employee.address,
      department: employee.department,
      position: employee.position,
      joinDate: employee.joinDate,
      employmentStatus: employee.employmentStatus as EmploymentStatus,
      salaryType: employee.salaryType as SalaryType,
      baseSalary: employee.baseSalary.toFixed(2),
      userId: employee.userId,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }
}
