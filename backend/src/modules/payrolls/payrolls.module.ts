import { Module } from '@nestjs/common';
import { PayrollsService } from './application/payrolls.service';
import { PayrollsController } from './interface/http/payrolls.controller';

@Module({
  controllers: [PayrollsController],
  providers: [PayrollsService],
})
export class PayrollsModule {}
