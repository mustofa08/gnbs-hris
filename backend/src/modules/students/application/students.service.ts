import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PaginatedResult } from '../../../common/pagination/paginated-result.type';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { Gender } from '../../employees/domain/employee.enums';
import { StudentStatus } from '../domain/student.enums';
import { CreateStudentDto } from '../interface/http/dto/create-student.dto';
import { StudentQueryDto } from '../interface/http/dto/student-query.dto';
import { UpdateStudentDto } from '../interface/http/dto/update-student.dto';
import { StudentResponse } from './types/student-response.type';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto): Promise<StudentResponse> {
    await this.ensureStudentCodeIsAvailable(dto.studentCode);

    const student = await this.prisma.student.create({
      data: this.toCreateInput(dto),
    });

    return this.toResponse(student);
  }

  async findAll(query: StudentQueryDto): Promise<PaginatedResult<StudentResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildWhereInput(query);

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: students.map((student) => this.toResponse(student)),
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

  async findOne(id: string): Promise<StudentResponse> {
    const student = await this.findActiveStudentById(id);
    return this.toResponse(student);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponse> {
    await this.findActiveStudentById(id);

    if (dto.studentCode) {
      await this.ensureStudentCodeIsAvailable(dto.studentCode, id);
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: this.toUpdateInput(dto),
    });

    return this.toResponse(student);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findActiveStudentById(id);

    await this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Student deleted successfully' };
  }

  private buildWhereInput(query: StudentQueryDto): Prisma.StudentWhereInput {
    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.studentStatus = query.status;
    }

    if (query.className) {
      where.className = {
        equals: query.className,
        mode: 'insensitive',
      };
    }

    if (query.dormitory) {
      where.dormitory = {
        equals: query.dormitory,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      where.OR = [
        { studentCode: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
        { guardianName: { contains: query.search, mode: 'insensitive' } },
        { guardianPhone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async findActiveStudentById(id: string): Promise<Student> {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  private async ensureStudentCodeIsAvailable(studentCode: string, currentStudentId?: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { studentCode },
    });

    if (student && student.id !== currentStudentId) {
      throw new ConflictException('Student code is already used');
    }
  }

  private toCreateInput(dto: CreateStudentDto): Prisma.StudentCreateInput {
    return {
      studentCode: dto.studentCode,
      fullName: dto.fullName,
      gender: dto.gender,
      birthPlace: dto.birthPlace,
      birthDate: dto.birthDate,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      className: dto.className,
      academicYear: dto.academicYear,
      enrollmentDate: dto.enrollmentDate,
      dormitory: dto.dormitory,
      roomNumber: dto.roomNumber,
      guardianName: dto.guardianName,
      guardianPhone: dto.guardianPhone,
      studentStatus: dto.studentStatus ?? StudentStatus.ACTIVE,
    };
  }

  private toUpdateInput(dto: UpdateStudentDto): Prisma.StudentUpdateInput {
    return {
      studentCode: dto.studentCode,
      fullName: dto.fullName,
      gender: dto.gender,
      birthPlace: dto.birthPlace,
      birthDate: dto.birthDate,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      className: dto.className,
      academicYear: dto.academicYear,
      enrollmentDate: dto.enrollmentDate,
      dormitory: dto.dormitory,
      roomNumber: dto.roomNumber,
      guardianName: dto.guardianName,
      guardianPhone: dto.guardianPhone,
      studentStatus: dto.studentStatus,
    };
  }

  private toResponse(student: Student): StudentResponse {
    return {
      id: student.id,
      studentCode: student.studentCode,
      fullName: student.fullName,
      gender: student.gender as Gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate,
      phoneNumber: student.phoneNumber,
      address: student.address,
      className: student.className,
      academicYear: student.academicYear,
      enrollmentDate: student.enrollmentDate,
      dormitory: student.dormitory,
      roomNumber: student.roomNumber,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      studentStatus: student.studentStatus as StudentStatus,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
