import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, ActivityValidation, Employee, Prisma, Schedule, User } from '@prisma/client';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { ActivityCategory } from '../../activities/domain/activity.enums';
import { EmploymentStatus } from '../../employees/domain/employee.enums';
import { Role } from '../../users/domain/role.enum';
import { ValidationStatus } from '../domain/validation.enums';
import { ReviewValidationDto } from '../interface/http/dto/review-validation.dto';
import { SubmitValidationDto } from '../interface/http/dto/submit-validation.dto';
import { ValidationQueryDto } from '../interface/http/dto/validation-query.dto';
import { ValidationResponse } from './types/validation-response.type';

type ValidationWithRelations = ActivityValidation & {
  schedule: Schedule;
  employee: Employee;
  activity: Activity;
  validatedBy: User | null;
};

@Injectable()
export class ValidationsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(currentUser: AuthenticatedUser, dto: SubmitValidationDto): Promise<ValidationResponse> {
    await this.ensureEmployeeSubmitScope(currentUser, dto.employeeId);
    const schedule = await this.ensureScheduleExists(dto.scheduleId);
    await this.ensureEmployeeExists(dto.employeeId);
    await this.ensureActivityExists(dto.activityId);
    this.ensureScheduleMatchesValidation(schedule, dto.employeeId, dto.activityId);

    const validation = await this.prisma.activityValidation.create({
      data: {
        schedule: { connect: { id: dto.scheduleId } },
        employee: { connect: { id: dto.employeeId } },
        activity: { connect: { id: dto.activityId } },
        status: ValidationStatus.PENDING,
        notes: dto.notes,
        evidenceUrl: dto.evidenceUrl,
      },
      include: this.relationInclude(),
    });

    return this.toResponse(validation);
  }

  async findAll(
    currentUser: AuthenticatedUser,
    query: ValidationQueryDto,
  ): Promise<PaginatedResult<ValidationResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = await this.buildWhereInput(currentUser, query);

    const [validations, total] = await this.prisma.$transaction([
      this.prisma.activityValidation.findMany({
        where,
        include: this.relationInclude(),
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityValidation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: validations.map((validation) => this.toResponse(validation)),
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

  async findOne(currentUser: AuthenticatedUser, id: string): Promise<ValidationResponse> {
    const validation = await this.findValidationById(id);
    await this.ensureCanAccessValidation(currentUser, validation.employeeId);

    return this.toResponse(validation);
  }

  async approve(
    currentUser: AuthenticatedUser,
    id: string,
    dto: ReviewValidationDto,
  ): Promise<ValidationResponse> {
    this.ensureReviewerRole(currentUser);
    return this.review(id, ValidationStatus.APPROVED, currentUser.id, dto.notes);
  }

  async reject(
    currentUser: AuthenticatedUser,
    id: string,
    dto: ReviewValidationDto,
  ): Promise<ValidationResponse> {
    this.ensureReviewerRole(currentUser);
    return this.review(id, ValidationStatus.REJECTED, currentUser.id, dto.notes);
  }

  private async review(
    id: string,
    status: ValidationStatus,
    reviewerId: string,
    notes?: string,
  ): Promise<ValidationResponse> {
    const validation = await this.findValidationById(id);

    if (validation.status !== ValidationStatus.PENDING) {
      throw new ConflictException('Only pending validations can be reviewed');
    }

    const reviewedValidation = await this.prisma.activityValidation.update({
      where: { id },
      data: {
        status,
        notes: notes ?? validation.notes,
        validatedAt: new Date(),
        validatedBy: { connect: { id: reviewerId } },
      },
      include: this.relationInclude(),
    });

    return this.toResponse(reviewedValidation);
  }

  private async buildWhereInput(
    currentUser: AuthenticatedUser,
    query: ValidationQueryDto,
  ): Promise<Prisma.ActivityValidationWhereInput> {
    const where: Prisma.ActivityValidationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.activityId) {
      where.activityId = query.activityId;
    }

    if (currentUser.role === Role.EMPLOYEE) {
      const employee = await this.findEmployeeByUserId(currentUser.id);

      if (query.employeeId && query.employeeId !== employee.id) {
        throw new ForbiddenException('Employees can only access their own validations');
      }

      where.employeeId = employee.id;
    }

    if (query.search) {
      where.OR = [
        { notes: { contains: query.search, mode: 'insensitive' } },
        { evidenceUrl: { contains: query.search, mode: 'insensitive' } },
        { schedule: { title: { contains: query.search, mode: 'insensitive' } } },
        { employee: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: query.search, mode: 'insensitive' } } },
        { activity: { name: { contains: query.search, mode: 'insensitive' } } },
        { activity: { activityCode: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private async ensureEmployeeSubmitScope(
    currentUser: AuthenticatedUser,
    employeeId: string,
  ): Promise<void> {
    if (currentUser.role !== Role.EMPLOYEE) {
      return;
    }

    const employee = await this.findEmployeeByUserId(currentUser.id);

    if (employee.id !== employeeId) {
      throw new ForbiddenException('Employees can submit validations only for themselves');
    }
  }

  private async ensureCanAccessValidation(
    currentUser: AuthenticatedUser,
    employeeId: string,
  ): Promise<void> {
    if (currentUser.role !== Role.EMPLOYEE) {
      return;
    }

    const employee = await this.findEmployeeByUserId(currentUser.id);

    if (employee.id !== employeeId) {
      throw new ForbiddenException('Employees can only access their own validations');
    }
  }

  private ensureReviewerRole(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only admin users can review validations');
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

  private async ensureScheduleExists(scheduleId: string): Promise<Schedule> {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        deletedAt: null,
      },
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

  private ensureScheduleMatchesValidation(
    schedule: Schedule,
    employeeId: string,
    activityId: string,
  ): void {
    if (schedule.employeeId !== employeeId || schedule.activityId !== activityId) {
      throw new ConflictException('Schedule does not match the selected employee and activity');
    }
  }

  private async findValidationById(id: string): Promise<ValidationWithRelations> {
    const validation = await this.prisma.activityValidation.findUnique({
      where: { id },
      include: this.relationInclude(),
    });

    if (!validation) {
      throw new NotFoundException('Validation not found');
    }

    return validation;
  }

  private relationInclude(): Prisma.ActivityValidationInclude {
    return {
      schedule: true,
      employee: true,
      activity: true,
      validatedBy: true,
    };
  }

  private toResponse(validation: ValidationWithRelations): ValidationResponse {
    return {
      id: validation.id,
      scheduleId: validation.scheduleId,
      employeeId: validation.employeeId,
      activityId: validation.activityId,
      status: validation.status as ValidationStatus,
      notes: validation.notes,
      evidenceUrl: validation.evidenceUrl,
      submittedAt: validation.submittedAt,
      validatedAt: validation.validatedAt,
      validatedById: validation.validatedById,
      schedule: {
        id: validation.schedule.id,
        title: validation.schedule.title,
        startDate: validation.schedule.startDate,
        endDate: validation.schedule.endDate,
        location: validation.schedule.location,
      },
      employee: {
        id: validation.employee.id,
        employeeCode: validation.employee.employeeCode,
        fullName: validation.employee.fullName,
        department: validation.employee.department,
        position: validation.employee.position,
        employmentStatus: validation.employee.employmentStatus as EmploymentStatus,
      },
      activity: {
        id: validation.activity.id,
        activityCode: validation.activity.activityCode,
        name: validation.activity.name,
        category: validation.activity.category as ActivityCategory,
      },
      validatedBy: validation.validatedBy
        ? {
            id: validation.validatedBy.id,
            email: validation.validatedBy.email,
            name: validation.validatedBy.name,
          }
        : null,
      createdAt: validation.createdAt,
      updatedAt: validation.updatedAt,
    };
  }
}
