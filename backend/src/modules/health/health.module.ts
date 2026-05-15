import { Module } from '@nestjs/common';
import { HealthController } from './interface/http/health.controller';
import { HealthService } from './application/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
