import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, Employee, Prisma, Schedule } from '@prisma/client';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { ActivityCategory } from '../../activities/domain/activity.enums';
import { EmploymentStatus } from '../../employees/domain/employee.enums';
import { RecurrenceType } from '../domain/schedule.enums';
import { CreateScheduleDto } from '../interface/http/dto/create-schedule.dto';
import { ScheduleQueryDto } from '../interface/http/dto/schedule-query.dto';
import { UpdateScheduleDto } from '../interface/http/dto/update-schedule.dto';
import { ScheduleResponse } from './types/schedule-response.type';

type ScheduleWithRelations = Schedule & {
  employee: Employee;
  activity: Activity;
};

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto): Promise<ScheduleResponse> {
    await this.ensureEmployeeExists(dto.employeeId);
    await this.ensureActivityExists(dto.activityId);
    this.ensureValidDateRange(dto.startDate, dto.endDate);
    this.ensureValidTimeRange(dto.startTime, dto.endTime);

    const schedule = await this.prisma.schedule.create({
      data: this.toCreateInput(dto),
      include: this.relationInclude(),
    });

    return this.toResponse(schedule);
  }

  async findAll(query: ScheduleQueryDto): Promise<PaginatedResult<ScheduleResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildWhereInput(query);

    const [schedules, total] = await this.prisma.$transaction([
      this.prisma.schedule.findMany({
        where,
        include: this.relationInclude(),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.schedule.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: schedules.map((schedule) => this.toResponse(schedule)),
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

  async findOne(id: string): Promise<ScheduleResponse> {
    const schedule = await this.findActiveScheduleById(id);
    return this.toResponse(schedule);
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<ScheduleResponse> {
    const currentSchedule = await this.findActiveScheduleById(id);

    if (dto.employeeId) {
      await this.ensureEmployeeExists(dto.employeeId);
    }

    if (dto.activityId) {
      await this.ensureActivityExists(dto.activityId);
    }

    const startDate = dto.startDate ?? currentSchedule.startDate;
    const endDate = dto.endDate ?? currentSchedule.endDate;
    const startTime = dto.startTime ?? this.formatTime(currentSchedule.startTime);
    const endTime = dto.endTime ?? this.formatTime(currentSchedule.endTime);

    this.ensureValidDateRange(startDate, endDate);
    this.ensureValidTimeRange(startTime, endTime);

    const schedule = await this.prisma.schedule.update({
      where: { id },
      data: this.toUpdateInput(dto),
      include: this.relationInclude(),
    });

    return this.toResponse(schedule);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findActiveScheduleById(id);

    await this.prisma.schedule.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'Schedule deleted successfully' };
  }

  private buildWhereInput(query: ScheduleQueryDto): Prisma.ScheduleWhereInput {
    const where: Prisma.ScheduleWhereInput = {
      deletedAt: null,
    };

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.activityId) {
      where.activityId = query.activityId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { employee: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: query.search, mode: 'insensitive' } } },
        { activity: { name: { contains: query.search, mode: 'insensitive' } } },
        { activity: { activityCode: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private async findActiveScheduleById(id: string): Promise<ScheduleWithRelations> {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: this.relationInclude(),
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
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

  private async ensureActivityExists(activityId: string): Promise<void> {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id: activityId,
        deletedAt: null,
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
  }

  private ensureValidDateRange(startDate: Date, endDate: Date): void {
    if (startDate.getTime() > endDate.getTime()) {
      throw new ConflictException('startDate must be earlier than or equal to endDate');
    }
  }

  private ensureValidTimeRange(startTime: string, endTime: string): void {
    if (this.timeToMinutes(startTime) >= this.timeToMinutes(endTime)) {
      throw new ConflictException('startTime must be earlier than endTime');
    }
  }

  private toCreateInput(dto: CreateScheduleDto): Prisma.ScheduleCreateInput {
    return {
      title: dto.title,
      description: dto.description,
      employee: { connect: { id: dto.employeeId } },
      activity: { connect: { id: dto.activityId } },
      startDate: dto.startDate,
      endDate: dto.endDate,
      startTime: this.parseTime(dto.startTime),
      endTime: this.parseTime(dto.endTime),
      recurrenceType: dto.recurrenceType ?? RecurrenceType.NONE,
      recurrenceDays: dto.recurrenceDays ?? [],
      location: dto.location,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
    };
  }

  private toUpdateInput(dto: UpdateScheduleDto): Prisma.ScheduleUpdateInput {
    return {
      title: dto.title,
      description: dto.description,
      employee: dto.employeeId ? { connect: { id: dto.employeeId } } : undefined,
      activity: dto.activityId ? { connect: { id: dto.activityId } } : undefined,
      startDate: dto.startDate,
      endDate: dto.endDate,
      startTime: dto.startTime ? this.parseTime(dto.startTime) : undefined,
      endTime: dto.endTime ? this.parseTime(dto.endTime) : undefined,
      recurrenceType: dto.recurrenceType,
      recurrenceDays: dto.recurrenceDays,
      location: dto.location,
      notes: dto.notes,
      isActive: dto.isActive,
    };
  }

  private toResponse(schedule: ScheduleWithRelations): ScheduleResponse {
    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      employeeId: schedule.employeeId,
      activityId: schedule.activityId,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      startTime: this.formatTime(schedule.startTime),
      endTime: this.formatTime(schedule.endTime),
      recurrenceType: schedule.recurrenceType as RecurrenceType,
      recurrenceDays: schedule.recurrenceDays,
      location: schedule.location,
      notes: schedule.notes,
      isActive: schedule.isActive,
      employee: {
        id: schedule.employee.id,
        employeeCode: schedule.employee.employeeCode,
        fullName: schedule.employee.fullName,
        department: schedule.employee.department,
        position: schedule.employee.position,
        employmentStatus: schedule.employee.employmentStatus as EmploymentStatus,
      },
      activity: {
        id: schedule.activity.id,
        activityCode: schedule.activity.activityCode,
        name: schedule.activity.name,
        category: schedule.activity.category as ActivityCategory,
        isActive: schedule.activity.isActive,
      },
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  private relationInclude(): Prisma.ScheduleInclude {
    return {
      employee: true,
      activity: true,
    };
  }

  private parseTime(value: string): Date {
    return new Date(`1970-01-01T${value}:00.000Z`);
  }

  private formatTime(value: Date): string {
    return value.toISOString().slice(11, 16);
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
