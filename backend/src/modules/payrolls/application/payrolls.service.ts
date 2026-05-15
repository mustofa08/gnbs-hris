import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Employee, Payroll, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { AttendanceStatus } from '../../attendances/domain/attendance.enums';
import { EmploymentStatus } from '../../employees/domain/employee.enums';
import { Role } from '../../users/domain/role.enum';
import { ValidationStatus } from '../../validations/domain/validation.enums';
import { PayrollStatus } from '../domain/payroll.enums';
import { GeneratePayrollDto } from '../interface/http/dto/generate-payroll.dto';
import { PayrollQueryDto } from '../interface/http/dto/payroll-query.dto';
import { PayrollSummaryQueryDto } from '../interface/http/dto/payroll-summary-query.dto';
import { PayrollResponse, PayrollSummaryResponse } from './types/payroll-response.type';

type PayrollWithEmployee = Payroll & {
  employee: Employee;
};

@Injectable()
export class PayrollsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(dto: GeneratePayrollDto): Promise<PayrollResponse> {
    await this.ensureEmployeeExists(dto.employeeId);
    await this.ensurePayrollDoesNotExist(dto.employeeId, dto.payrollPeriod);

    const { startDate, endDate } = this.getPeriodRange(dto.payrollPeriod);

    const [validations, attendances] = await Promise.all([
      this.prisma.activityValidation.findMany({
        where: {
          employeeId: dto.employeeId,
          status: ValidationStatus.APPROVED,
          submittedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          activity: true,
        },
      }),
      this.prisma.attendance.findMany({
        where: {
          employeeId: dto.employeeId,
          checkInTime: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          activity: true,
        },
      }),
    ]);

    const totalCompensation = validations.reduce(
      (sum, validation) => sum.plus(validation.activity.compensationAmount),
      new Prisma.Decimal(0),
    );
    const totalPenalty = attendances
      .filter((attendance) => attendance.attendanceStatus === AttendanceStatus.ABSENT)
      .reduce((sum, attendance) => sum.plus(attendance.activity.penaltyAmount), new Prisma.Decimal(0));
    const totalLatePenalty = attendances
      .filter((attendance) => attendance.attendanceStatus === AttendanceStatus.LATE)
      .reduce((sum, attendance) => sum.plus(attendance.activity.penaltyAmount), new Prisma.Decimal(0));
    const calculatedFinalAmount = totalCompensation.minus(totalPenalty).minus(totalLatePenalty);
    const finalAmount = calculatedFinalAmount.lessThan(0)
      ? new Prisma.Decimal(0)
      : calculatedFinalAmount;

    const payroll = await this.prisma.payroll.create({
      data: {
        employee: { connect: { id: dto.employeeId } },
        payrollPeriod: dto.payrollPeriod,
        payrollStatus: PayrollStatus.GENERATED,
        totalActivities: validations.length,
        totalAttendance: attendances.length,
        totalCompensation,
        totalPenalty,
        totalLatePenalty,
        finalAmount,
      },
      include: this.relationInclude(),
    });

    return this.toResponse(payroll);
  }

  async findAll(
    currentUser: AuthenticatedUser,
    query: PayrollQueryDto,
  ): Promise<PaginatedResult<PayrollResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = await this.buildWhereInput(currentUser, query);

    const [payrolls, total] = await this.prisma.$transaction([
      this.prisma.payroll.findMany({
        where,
        include: this.relationInclude(),
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payroll.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: payrolls.map((payroll) => this.toResponse(payroll)),
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

  async findOne(currentUser: AuthenticatedUser, id: string): Promise<PayrollResponse> {
    const payroll = await this.findPayrollById(id);
    await this.ensureCanAccessEmployeePayroll(currentUser, payroll.employeeId);

    return this.toResponse(payroll);
  }

  async findEmployeeHistory(
    currentUser: AuthenticatedUser,
    employeeId: string,
    query: PayrollQueryDto,
  ): Promise<PaginatedResult<PayrollResponse>> {
    await this.ensureCanAccessEmployeePayroll(currentUser, employeeId);
    return this.findAll(currentUser, { ...query, employeeId });
  }

  async getSummary(query: PayrollSummaryQueryDto): Promise<PayrollSummaryResponse> {
    const where: Prisma.PayrollWhereInput = {};

    if (query.period) {
      where.payrollPeriod = query.period;
    }

    if (query.status) {
      where.payrollStatus = query.status;
    }

    const payrolls = await this.prisma.payroll.findMany({ where });
    const totals = payrolls.reduce(
      (summary, payroll) => ({
        totalActivities: summary.totalActivities + payroll.totalActivities,
        totalAttendance: summary.totalAttendance + payroll.totalAttendance,
        totalCompensation: summary.totalCompensation.plus(payroll.totalCompensation),
        totalPenalty: summary.totalPenalty.plus(payroll.totalPenalty),
        totalLatePenalty: summary.totalLatePenalty.plus(payroll.totalLatePenalty),
        totalFinalAmount: summary.totalFinalAmount.plus(payroll.finalAmount),
      }),
      {
        totalActivities: 0,
        totalAttendance: 0,
        totalCompensation: new Prisma.Decimal(0),
        totalPenalty: new Prisma.Decimal(0),
        totalLatePenalty: new Prisma.Decimal(0),
        totalFinalAmount: new Prisma.Decimal(0),
      },
    );

    return {
      payrollPeriod: query.period,
      payrollStatus: query.status,
      totalPayrolls: payrolls.length,
      totalActivities: totals.totalActivities,
      totalAttendance: totals.totalAttendance,
      totalCompensation: totals.totalCompensation.toFixed(2),
      totalPenalty: totals.totalPenalty.toFixed(2),
      totalLatePenalty: totals.totalLatePenalty.toFixed(2),
      totalFinalAmount: totals.totalFinalAmount.toFixed(2),
    };
  }

  private async buildWhereInput(
    currentUser: AuthenticatedUser,
    query: PayrollQueryDto,
  ): Promise<Prisma.PayrollWhereInput> {
    const where: Prisma.PayrollWhereInput = {};

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.period) {
      where.payrollPeriod = query.period;
    }

    if (query.status) {
      where.payrollStatus = query.status;
    }

    if (currentUser.role === Role.EMPLOYEE) {
      const employee = await this.findEmployeeByUserId(currentUser.id);

      if (query.employeeId && query.employeeId !== employee.id) {
        throw new ForbiddenException('Employees can only access their own payroll');
      }

      where.employeeId = employee.id;
    }

    if (query.search) {
      where.OR = [
        { payrollPeriod: { contains: query.search, mode: 'insensitive' } },
        { employee: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: query.search, mode: 'insensitive' } } },
        { employee: { department: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private async ensureEmployeeExists(employeeId: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        deletedAt: null,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
  }

  private async ensurePayrollDoesNotExist(employeeId: string, payrollPeriod: string): Promise<void> {
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        employeeId_payrollPeriod: {
          employeeId,
          payrollPeriod,
        },
      },
    });

    if (payroll) {
      throw new ConflictException('Payroll already exists for this employee and period');
    }
  }

  private async findPayrollById(id: string): Promise<PayrollWithEmployee> {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: this.relationInclude(),
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return payroll;
  }

  private async ensureCanAccessEmployeePayroll(
    currentUser: AuthenticatedUser,
    employeeId: string,
  ): Promise<void> {
    if (currentUser.role !== Role.EMPLOYEE) {
      return;
    }

    const employee = await this.findEmployeeByUserId(currentUser.id);

    if (employee.id !== employeeId) {
      throw new ForbiddenException('Employees can only access their own payroll');
    }
  }

  private async findEmployeeByUserId(userId: string): Promise<Employee> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!employee) {
      throw new ForbiddenException('Authenticated user is not linked to an employee profile');
    }

    return employee;
  }

  private relationInclude(): Prisma.PayrollInclude {
    return {
      employee: true,
    };
  }

  private toResponse(payroll: PayrollWithEmployee): PayrollResponse {
    return {
      id: payroll.id,
      employeeId: payroll.employeeId,
      payrollPeriod: payroll.payrollPeriod,
      payrollStatus: payroll.payrollStatus as PayrollStatus,
      totalActivities: payroll.totalActivities,
      totalAttendance: payroll.totalAttendance,
      totalCompensation: payroll.totalCompensation.toFixed(2),
      totalPenalty: payroll.totalPenalty.toFixed(2),
      totalLatePenalty: payroll.totalLatePenalty.toFixed(2),
      finalAmount: payroll.finalAmount.toFixed(2),
      generatedAt: payroll.generatedAt,
      paidAt: payroll.paidAt,
      employee: {
        id: payroll.employee.id,
        employeeCode: payroll.employee.employeeCode,
        fullName: payroll.employee.fullName,
        department: payroll.employee.department,
        position: payroll.employee.position,
        employmentStatus: payroll.employee.employmentStatus as EmploymentStatus,
      },
      createdAt: payroll.createdAt,
      updatedAt: payroll.updatedAt,
    };
  }

  private getPeriodRange(payrollPeriod: string): { startDate: Date; endDate: Date } {
    const [year, month] = payrollPeriod.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    return { startDate, endDate };
  }
}
