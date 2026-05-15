import { Module } from '@nestjs/common';
import { AttendancesService } from './application/attendances.service';
import { AttendancesController } from './interface/http/attendances.controller';

@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
