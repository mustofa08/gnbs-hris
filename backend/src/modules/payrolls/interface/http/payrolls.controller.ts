import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { PayrollsService } from '../../application/payrolls.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { PayrollQueryDto } from './dto/payroll-query.dto';
import { PayrollSummaryQueryDto } from './dto/payroll-summary-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payrolls')
export class PayrollsController {
  constructor(private readonly payrollsService: PayrollsService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('generate')
  generate(@Body() dto: GeneratePayrollDto) {
    return this.payrollsService.generate(dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('summary')
  summary(@Query() query: PayrollSummaryQueryDto) {
    return this.payrollsService.getSummary(query);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PayrollQueryDto) {
    return this.payrollsService.findAll(user, query);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @Get('employees/:employeeId/history')
  employeeHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query() query: PayrollQueryDto,
  ) {
    return this.payrollsService.findEmployeeHistory(user, employeeId, query);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payrollsService.findOne(user, id);
  }
}
