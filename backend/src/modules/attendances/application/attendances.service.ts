import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, Attendance, Employee, Prisma, Schedule } from '@prisma/client';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { ActivityCategory } from '../../activities/domain/activity.enums';
import { EmploymentStatus } from '../../employees/domain/employee.enums';
import { Role } from '../../users/domain/role.enum';
import { AttendanceStatus } from '../domain/attendance.enums';
import { AttendanceQueryDto } from '../interface/http/dto/attendance-query.dto';
import { CheckInAttendanceDto } from '../interface/http/dto/check-in-attendance.dto';
import { CheckOutAttendanceDto } from '../interface/http/dto/check-out-attendance.dto';
import { AttendanceResponse } from './types/attendance-response.type';

type AttendanceWithRelations = Attendance & {
  employee: Employee;
  activity: Activity;
  schedule: Schedule;
};

type ScheduleWithRelations = Schedule & {
  employee: Employee;
  activity: Activity;
};

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(
    currentUser: AuthenticatedUser,
    dto: CheckInAttendanceDto,
  ): Promise<AttendanceResponse> {
    await this.ensureEmployeeScope(currentUser, dto.employeeId);
    const schedule = await this.ensureScheduleExists(dto.scheduleId);
    this.ensureScheduleMatchesAttendance(schedule, dto.employeeId, dto.activityId);
    await this.ensureNoAttendanceForSchedule(dto.scheduleId);

    const checkInTime = new Date();
    const lateMinutes = this.calculateLateMinutes(checkInTime, schedule.startTime);
    const attendanceStatus = lateMinutes > 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const attendance = await this.prisma.attendance.create({
      data: {
        employee: { connect: { id: dto.employeeId } },
        schedule: { connect: { id: dto.scheduleId } },
        activity: { connect: { id: dto.activityId } },
        attendanceStatus,
        checkInTime,
        lateMinutes,
        notes: dto.notes,
      },
      include: this.relationInclude(),
    });

    return this.toResponse(attendance);
  }

  async checkOut(
    currentUser: AuthenticatedUser,
    id: string,
    dto: CheckOutAttendanceDto,
  ): Promise<AttendanceResponse> {
    const attendance = await this.findAttendanceById(id);
    await this.ensureEmployeeScope(currentUser, attendance.employeeId);

    if (attendance.checkOutTime) {
      throw new ConflictException('Attendance is already checked out');
    }

    const updatedAttendance = await this.prisma.attendance.update({
      where: { id },
      data: {
        checkOutTime: new Date(),
        notes: dto.notes ?? attendance.notes,
      },
      include: this.relationInclude(),
    });

    return this.toResponse(updatedAttendance);
  }

  async findAll(
    currentUser: AuthenticatedUser,
    query: AttendanceQueryDto,
  ): Promise<PaginatedResult<AttendanceResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = await this.buildWhereInput(currentUser, query);

    const [attendances, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        include: this.relationInclude(),
        orderBy: { checkInTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: attendances.map((attendance) => this.toResponse(attendance)),
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

  async findOne(currentUser: AuthenticatedUser, id: string): Promise<AttendanceResponse> {
    const attendance = await this.findAttendanceById(id);
    await this.ensureEmployeeScope(currentUser, attendance.employeeId);

    return this.toResponse(attendance);
  }

  private async buildWhereInput(
    currentUser: AuthenticatedUser,
    query: AttendanceQueryDto,
  ): Promise<Prisma.AttendanceWhereInput> {
    const where: Prisma.AttendanceWhereInput = {};

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.activityId) {
      where.activityId = query.activityId;
    }

    if (query.status) {
      where.attendanceStatus = query.status;
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      where.checkInTime = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    if (currentUser.role === Role.EMPLOYEE) {
      const employee = await this.findEmployeeByUserId(currentUser.id);

      if (query.employeeId && query.employeeId !== employee.id) {
        throw new ForbiddenException('Employees can only access their own attendance');
      }

      where.employeeId = employee.id;
    }

    if (query.search) {
      where.OR = [
        { notes: { contains: query.search, mode: 'insensitive' } },
        { employee: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: query.search, mode: 'insensitive' } } },
        { activity: { name: { contains: query.search, mode: 'insensitive' } } },
        { activity: { activityCode: { contains: query.search, mode: 'insensitive' } } },
        { schedule: { title: { contains: query.search, mode: 'insensitive' } } },
        { schedule: { location: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private async ensureEmployeeScope(
    currentUser: AuthenticatedUser,
    employeeId: string,
  ): Promise<void> {
    if (currentUser.role !== Role.EMPLOYEE) {
      return;
    }

    const employee = await this.findEmployeeByUserId(currentUser.id);

    if (employee.id !== employeeId) {
      throw new ForbiddenException('Employees can only manage their own attendance');
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

  private async ensureScheduleExists(scheduleId: string): Promise<ScheduleWithRelations> {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        employee: true,
        activity: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.employee.deletedAt || schedule.activity.deletedAt) {
      throw new NotFoundException('Schedule employee or activity not found');
    }

    return schedule;
  }

  private ensureScheduleMatchesAttendance(
    schedule: Schedule,
    employeeId: string,
    activityId: string,
  ): void {
    if (schedule.employeeId !== employeeId || schedule.activityId !== activityId) {
      throw new ConflictException('Schedule does not match the selected employee and activity');
    }
  }

  private async ensureNoAttendanceForSchedule(scheduleId: string): Promise<void> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { scheduleId },
    });

    if (attendance) {
      throw new ConflictException('Attendance for this schedule already exists');
    }
  }

  private async findAttendanceById(id: string): Promise<AttendanceWithRelations> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: this.relationInclude(),
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    return attendance;
  }

  private relationInclude(): Prisma.AttendanceInclude {
    return {
      employee: true,
      activity: true,
      schedule: true,
    };
  }

  private toResponse(attendance: AttendanceWithRelations): AttendanceResponse {
    return {
      id: attendance.id,
      employeeId: attendance.employeeId,
      scheduleId: attendance.scheduleId,
      activityId: attendance.activityId,
      attendanceStatus: attendance.attendanceStatus as AttendanceStatus,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      lateMinutes: attendance.lateMinutes,
      notes: attendance.notes,
      employee: {
        id: attendance.employee.id,
        employeeCode: attendance.employee.employeeCode,
        fullName: attendance.employee.fullName,
        department: attendance.employee.department,
        position: attendance.employee.position,
        employmentStatus: attendance.employee.employmentStatus as EmploymentStatus,
      },
      activity: {
        id: attendance.activity.id,
        activityCode: attendance.activity.activityCode,
        name: attendance.activity.name,
        category: attendance.activity.category as ActivityCategory,
      },
      schedule: {
        id: attendance.schedule.id,
        title: attendance.schedule.title,
        startDate: attendance.schedule.startDate,
        endDate: attendance.schedule.endDate,
        startTime: this.formatTime(attendance.schedule.startTime),
        endTime: this.formatTime(attendance.schedule.endTime),
        location: attendance.schedule.location,
      },
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    };
  }

  private calculateLateMinutes(checkInTime: Date, scheduledStartTime: Date): number {
    const scheduledStart = new Date(checkInTime);
    scheduledStart.setUTCHours(
      scheduledStartTime.getUTCHours(),
      scheduledStartTime.getUTCMinutes(),
      0,
      0,
    );

    return Math.max(0, Math.floor((checkInTime.getTime() - scheduledStart.getTime()) / 60000));
  }

  private formatTime(value: Date): string {
    return value.toISOString().slice(11, 16);
  }
}
