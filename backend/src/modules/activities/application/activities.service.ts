import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { ActivityCategory, CompensationType } from '../domain/activity.enums';
import { CreateActivityDto } from '../interface/http/dto/create-activity.dto';
import { ActivityQueryDto } from '../interface/http/dto/activity-query.dto';
import { UpdateActivityDto } from '../interface/http/dto/update-activity.dto';
import { ActivityResponse } from './types/activity-response.type';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto): Promise<ActivityResponse> {
    await this.ensureActivityCodeIsAvailable(dto.activityCode);
    this.ensureValidTimeRange(dto.startTime, dto.endTime);

    const activity = await this.prisma.activity.create({
      data: this.toCreateInput(dto),
    });

    return this.toResponse(activity);
  }

  async findAll(query: ActivityQueryDto): Promise<PaginatedResult<ActivityResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildWhereInput(query);

    const [activities, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: activities.map((activity) => this.toResponse(activity)),
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

  async findOne(id: string): Promise<ActivityResponse> {
    const activity = await this.findActiveActivityById(id);
    return this.toResponse(activity);
  }

  async update(id: string, dto: UpdateActivityDto): Promise<ActivityResponse> {
    const currentActivity = await this.findActiveActivityById(id);

    if (dto.activityCode) {
      await this.ensureActivityCodeIsAvailable(dto.activityCode, id);
    }

    const startTime = dto.startTime ?? this.formatTime(currentActivity.startTime);
    const endTime = dto.endTime ?? this.formatTime(currentActivity.endTime);
    this.ensureValidTimeRange(startTime, endTime);

    const activity = await this.prisma.activity.update({
      where: { id },
      data: this.toUpdateInput(dto),
    });

    return this.toResponse(activity);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findActiveActivityById(id);

    await this.prisma.activity.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'Activity deleted successfully' };
  }

  private buildWhereInput(query: ActivityQueryDto): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {
      deletedAt: null,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { activityCode: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async findActiveActivityById(id: string): Promise<Activity> {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  private async ensureActivityCodeIsAvailable(activityCode: string, currentActivityId?: string): Promise<void> {
    const activity = await this.prisma.activity.findUnique({
      where: { activityCode },
    });

    if (activity && activity.id !== currentActivityId) {
      throw new ConflictException('Activity code is already used');
    }
  }

  private ensureValidTimeRange(startTime: string, endTime: string): void {
    if (this.timeToMinutes(startTime) >= this.timeToMinutes(endTime)) {
      throw new ConflictException('startTime must be earlier than endTime');
    }
  }

  private toCreateInput(dto: CreateActivityDto): Prisma.ActivityCreateInput {
    return {
      activityCode: dto.activityCode,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      startTime: this.parseTime(dto.startTime),
      endTime: this.parseTime(dto.endTime),
      location: dto.location,
      compensationType: dto.compensationType,
      compensationAmount: new Prisma.Decimal(dto.compensationAmount ?? 0),
      penaltyAmount: new Prisma.Decimal(dto.penaltyAmount ?? 0),
      requiresValidation: dto.requiresValidation ?? false,
      isRecurring: dto.isRecurring ?? false,
      isActive: dto.isActive ?? true,
    };
  }

  private toUpdateInput(dto: UpdateActivityDto): Prisma.ActivityUpdateInput {
    return {
      activityCode: dto.activityCode,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      startTime: dto.startTime ? this.parseTime(dto.startTime) : undefined,
      endTime: dto.endTime ? this.parseTime(dto.endTime) : undefined,
      location: dto.location,
      compensationType: dto.compensationType,
      compensationAmount:
        dto.compensationAmount === undefined ? undefined : new Prisma.Decimal(dto.compensationAmount),
      penaltyAmount: dto.penaltyAmount === undefined ? undefined : new Prisma.Decimal(dto.penaltyAmount),
      requiresValidation: dto.requiresValidation,
      isRecurring: dto.isRecurring,
      isActive: dto.isActive,
    };
  }

  private toResponse(activity: Activity): ActivityResponse {
    return {
      id: activity.id,
      activityCode: activity.activityCode,
      name: activity.name,
      description: activity.description,
      category: activity.category as ActivityCategory,
      startTime: this.formatTime(activity.startTime),
      endTime: this.formatTime(activity.endTime),
      location: activity.location,
      compensationType: activity.compensationType as CompensationType,
      compensationAmount: activity.compensationAmount.toFixed(2),
      penaltyAmount: activity.penaltyAmount.toFixed(2),
      requiresValidation: activity.requiresValidation,
      isRecurring: activity.isRecurring,
      isActive: activity.isActive,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
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
