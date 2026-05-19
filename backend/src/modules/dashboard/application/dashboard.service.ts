import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { ActivityCategory } from '../../activities/domain/activity.enums';
import { AttendanceStatus } from '../../attendances/domain/attendance.enums';
import { EmploymentStatus } from '../../employees/domain/employee.enums';
import { PayrollStatus } from '../../payrolls/domain/payroll.enums';
import { Role } from '../../users/domain/role.enum';
import { ValidationStatus } from '../../validations/domain/validation.enums';
import { DashboardQueryDto } from '../interface/http/dto/dashboard-query.dto';
import {
  AdminDashboardResponse,
  CountByStatus,
  DashboardActivitySummary,
  DashboardEmployeeSummary,
  DashboardScheduleSummary,
  EmployeeDashboardResponse,
  MonthlyPayrollTotal,
  RecentAttendanceSummary,
  RecentValidationSummary,
} from './types/dashboard-response.type';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(query: DashboardQueryDto): Promise<AdminDashboardResponse> {
    const year = query.year ?? new Date().getUTCFullYear();

    const [
      employees,
      students,
      activities,
      schedules,
      pendingValidations,
      approvedValidations,
      attendanceByStatus,
      payrollByStatus,
      payrollTotals,
      monthlyPayrolls,
      recentValidations,
      recentAttendanceRecords,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { deletedAt: null } }),
      this.prisma.student.count({ where: { deletedAt: null } }),
      this.prisma.activity.count({ where: { deletedAt: null } }),
      this.prisma.schedule.count({ where: { deletedAt: null } }),
      this.prisma.activityValidation.count({ where: { status: ValidationStatus.PENDING } }),
      this.prisma.activityValidation.count({ where: { status: ValidationStatus.APPROVED } }),
      this.prisma.attendance.groupBy({
        by: ['attendanceStatus'],
        _count: { _all: true },
      }),
      this.prisma.payroll.groupBy({
        by: ['payrollStatus'],
        _count: { _all: true },
      }),
      this.prisma.payroll.aggregate({
        _sum: {
          totalCompensation: true,
          totalPenalty: true,
          totalLatePenalty: true,
          finalAmount: true,
        },
      }),
      this.prisma.payroll.findMany({
        where: {
          payrollPeriod: {
            startsWith: `${year}-`,
          },
        },
        select: {
          payrollPeriod: true,
          finalAmount: true,
        },
      }),
      this.prisma.activityValidation.findMany({
        orderBy: { submittedAt: 'desc' },
        take: 5,
        include: this.validationInclude(),
      }),
      this.prisma.attendance.findMany({
        orderBy: { checkInTime: 'desc' },
        take: 5,
        include: this.attendanceInclude(),
      }),
    ]);

    return {
      totals: {
        employees,
        students,
        activities,
        schedules,
      },
      validations: {
        pending: pendingValidations,
        approved: approvedValidations,
      },
      attendanceStatistics: attendanceByStatus.map((item) => ({
        status: item.attendanceStatus as AttendanceStatus,
        count: item._count._all,
      })),
      payrollStatistics: {
        byStatus: payrollByStatus.map((item) => ({
          status: item.payrollStatus as PayrollStatus,
          count: item._count._all,
        })),
        totalCompensation: this.decimalToString(payrollTotals._sum.totalCompensation),
        totalPenalty: this.decimalToString(payrollTotals._sum.totalPenalty),
        totalLatePenalty: this.decimalToString(payrollTotals._sum.totalLatePenalty),
        totalFinalAmount: this.decimalToString(payrollTotals._sum.finalAmount),
      },
      monthlyPayrollTotals: this.toMonthlyPayrollTotals(year, monthlyPayrolls),
      recentValidations: recentValidations.map((validation) => this.toRecentValidation(validation)),
      recentAttendanceRecords: recentAttendanceRecords.map((attendance) =>
        this.toRecentAttendance(attendance),
      ),
    };
  }

  async getEmployeeDashboard(currentUser: AuthenticatedUser): Promise<EmployeeDashboardResponse> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        userId: currentUser.id,
        deletedAt: null,
      },
    });

    if (!employee) {
      throw new ForbiddenException('Authenticated user is not linked to an employee profile');
    }

    const now = new Date();
    const [attendanceByStatus, payrollAggregate, latestPayroll, upcomingSchedules, recentValidations] =
      await Promise.all([
        this.prisma.attendance.groupBy({
          by: ['attendanceStatus'],
          where: { employeeId: employee.id },
          _count: { _all: true },
        }),
        this.prisma.payroll.aggregate({
          where: { employeeId: employee.id },
          _count: { _all: true },
          _sum: { finalAmount: true },
        }),
        this.prisma.payroll.findFirst({
          where: { employeeId: employee.id },
          orderBy: { generatedAt: 'desc' },
        }),
        this.prisma.schedule.findMany({
          where: {
            employeeId: employee.id,
            deletedAt: null,
            isActive: true,
            endDate: { gte: now },
          },
          orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
          take: 5,
        }),
        this.prisma.activityValidation.findMany({
          where: { employeeId: employee.id },
          orderBy: { submittedAt: 'desc' },
          take: 5,
          include: this.validationInclude(),
        }),
      ]);

    return {
      profile: this.toEmployeeSummary(employee),
      attendanceSummary: attendanceByStatus.map((item) => ({
        status: item.attendanceStatus as AttendanceStatus,
        count: item._count._all,
      })),
      payrollSummary: {
        totalPayrolls: payrollAggregate._count._all,
        totalFinalAmount: this.decimalToString(payrollAggregate._sum.finalAmount),
        latestPayrollPeriod: latestPayroll?.payrollPeriod ?? null,
        latestPayrollStatus: (latestPayroll?.payrollStatus as PayrollStatus | undefined) ?? null,
      },
      upcomingSchedules: upcomingSchedules.map((schedule) => this.toScheduleSummary(schedule)),
      recentValidations: recentValidations.map((validation) => this.toRecentValidation(validation)),
    };
  }

  private toMonthlyPayrollTotals(
    year: number,
    payrolls: Array<{ payrollPeriod: string; finalAmount: Prisma.Decimal }>,
  ): MonthlyPayrollTotal[] {
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, '0');
      const period = `${year}-${month}`;
      const periodPayrolls = payrolls.filter((payroll) => payroll.payrollPeriod === period);
      const totalFinalAmount = periodPayrolls.reduce(
        (sum, payroll) => sum.plus(payroll.finalAmount),
        new Prisma.Decimal(0),
      );

      return {
        period,
        totalFinalAmount: totalFinalAmount.toFixed(2),
        totalPayrolls: periodPayrolls.length,
      };
    });
  }

  private validationInclude() {
    return {
      employee: true,
      activity: true,
      schedule: true,
    };
  }

  private attendanceInclude() {
    return {
      employee: true,
      activity: true,
      schedule: true,
    };
  }

  private toRecentValidation(validation: {
    id: string;
    status: unknown;
    submittedAt: Date;
    validatedAt: Date | null;
    employee: {
      id: string;
      employeeCode: string;
      fullName: string;
      department: string;
      position: string;
      employmentStatus: unknown;
    };
    activity: {
      id: string;
      activityCode: string;
      name: string;
      category: unknown;
    };
    schedule: {
      id: string;
      title: string;
      startDate: Date;
      endDate: Date;
      startTime: Date;
      endTime: Date;
      location: string;
    };
  }): RecentValidationSummary {
    return {
      id: validation.id,
      status: validation.status as ValidationStatus,
      submittedAt: validation.submittedAt,
      validatedAt: validation.validatedAt,
      employee: this.toEmployeeSummary(validation.employee),
      activity: this.toActivitySummary(validation.activity),
      schedule: this.toScheduleSummary(validation.schedule),
    };
  }

  private toRecentAttendance(attendance: {
    id: string;
    attendanceStatus: unknown;
    checkInTime: Date;
    checkOutTime: Date | null;
    lateMinutes: number;
    employee: {
      id: string;
      employeeCode: string;
      fullName: string;
      department: string;
      position: string;
      employmentStatus: unknown;
    };
    activity: {
      id: string;
      activityCode: string;
      name: string;
      category: unknown;
    };
    schedule: {
      id: string;
      title: string;
      startDate: Date;
      endDate: Date;
      startTime: Date;
      endTime: Date;
      location: string;
    };
  }): RecentAttendanceSummary {
    return {
      id: attendance.id,
      attendanceStatus: attendance.attendanceStatus as AttendanceStatus,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      lateMinutes: attendance.lateMinutes,
      employee: this.toEmployeeSummary(attendance.employee),
      activity: this.toActivitySummary(attendance.activity),
      schedule: this.toScheduleSummary(attendance.schedule),
    };
  }

  private toEmployeeSummary(employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    department: string;
    position: string;
    employmentStatus: unknown;
  }): DashboardEmployeeSummary {
    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      department: employee.department,
      position: employee.position,
      employmentStatus: employee.employmentStatus as EmploymentStatus,
    };
  }

  private toActivitySummary(activity: {
    id: string;
    activityCode: string;
    name: string;
    category: unknown;
  }): DashboardActivitySummary {
    return {
      id: activity.id,
      activityCode: activity.activityCode,
      name: activity.name,
      category: activity.category as ActivityCategory,
    };
  }

  private toScheduleSummary(schedule: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    location: string;
  }): DashboardScheduleSummary {
    return {
      id: schedule.id,
      title: schedule.title,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      startTime: this.formatTime(schedule.startTime),
      endTime: this.formatTime(schedule.endTime),
      location: schedule.location,
    };
  }

  private decimalToString(value: Prisma.Decimal | null | undefined): string {
    return (value ?? new Prisma.Decimal(0)).toFixed(2);
  }

  private formatTime(value: Date): string {
    return value.toISOString().slice(11, 16);
  }
}
