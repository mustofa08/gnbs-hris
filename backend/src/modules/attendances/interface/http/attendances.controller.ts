import {
  Body,
  Controller,
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
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user.type';
import { Role } from '../../../users/domain/role.enum';
import { AttendancesService } from '../../application/attendances.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CheckInAttendanceDto } from './dto/check-in-attendance.dto';
import { CheckOutAttendanceDto } from './dto/check-out-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post('check-in')
  checkIn(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckInAttendanceDto) {
    return this.attendancesService.checkIn(user, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/check-out')
  checkOut(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CheckOutAttendanceDto,
  ) {
    return this.attendancesService.checkOut(user, id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: AttendanceQueryDto) {
    return this.attendancesService.findAll(user, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.attendancesService.findOne(user, id);
  }
}
