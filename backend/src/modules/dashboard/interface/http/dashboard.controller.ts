import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user.type';
import { Role } from '../../../users/domain/role.enum';
import { DashboardService } from '../../application/dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin')
  adminDashboard(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getAdminDashboard(query);
  }

  @Roles(Role.EMPLOYEE)
  @Get('employee')
  employeeDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getEmployeeDashboard(user);
  }
}
