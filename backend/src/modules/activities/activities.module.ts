import { Module } from '@nestjs/common';
import { ActivitiesService } from './application/activities.service';
import { ActivitiesController } from './interface/http/activities.controller';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
