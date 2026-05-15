import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../users/domain/role.enum';
import { StudentsService } from '../../application/students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  findAll(@Query() query: StudentQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.softDelete(id);
  }
}
