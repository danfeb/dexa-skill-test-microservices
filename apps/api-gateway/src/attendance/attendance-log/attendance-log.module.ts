import { Module } from '@nestjs/common';
import { AttendanceLogController } from './attendance-log.controller.js';
import { AttendanceLogService } from './attendance-log.service.js';

@Module({
  controllers: [AttendanceLogController],
  providers: [AttendanceLogService],
})
export class AttendanceLogModule {}
