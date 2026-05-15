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
import { ValidationsService } from '../../application/validations.service';
import { ReviewValidationDto } from './dto/review-validation.dto';
import { SubmitValidationDto } from './dto/submit-validation.dto';
import { ValidationQueryDto } from './dto/validation-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('validations')
export class ValidationsController {
  constructor(private readonly validationsService: ValidationsService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @Post()
  submit(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitValidationDto) {
    return this.validationsService.submit(user, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ValidationQueryDto) {
    return this.validationsService.findAll(user, query);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE)
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.validationsService.findOne(user, id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/approve')
  approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewValidationDto,
  ) {
    return this.validationsService.approve(user, id, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/reject')
  reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewValidationDto,
  ) {
    return this.validationsService.reject(user, id, dto);
  }
}
