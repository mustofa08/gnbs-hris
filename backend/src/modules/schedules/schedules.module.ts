import { Module } from '@nestjs/common';
import { SchedulesService } from './application/schedules.service';
import { SchedulesController } from './interface/http/schedules.controller';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
