import { Module } from '@nestjs/common';
import { StudentsService } from './application/students.service';
import { StudentsController } from './interface/http/students.controller';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
