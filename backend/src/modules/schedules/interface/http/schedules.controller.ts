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
import { SchedulesService } from '../../application/schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  findAll(@Query() query: ScheduleQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.softDelete(id);
  }
}
