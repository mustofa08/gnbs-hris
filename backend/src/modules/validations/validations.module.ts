import { Module } from '@nestjs/common';
import { ValidationsService } from './application/validations.service';
import { ValidationsController } from './interface/http/validations.controller';

@Module({
  controllers: [ValidationsController],
  providers: [ValidationsService],
})
export class ValidationsModule {}
