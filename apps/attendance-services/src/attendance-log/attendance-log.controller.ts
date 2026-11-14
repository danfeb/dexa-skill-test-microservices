import { Controller } from '@nestjs/common';
import { AttendanceLogService } from './attendance-log.service.js';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ATTENDANCE_LOG_MESSAGE_PATTERNS,
  AttendanceLog,
  FilterAttendanceLogListDto,
  AttendanceLogList,
  PresencePayloadDto,
  ServiceError,
} from '@app/common';

@Controller()
export class AttendanceLogController {
  constructor(private readonly attendanceLogService: AttendanceLogService) {}

  @MessagePattern(ATTENDANCE_LOG_MESSAGE_PATTERNS.PRESENCE)
  presence(
    @Payload() inputDto: PresencePayloadDto,
  ): Promise<string | ServiceError> {
    return this.attendanceLogService.presence(inputDto);
  }

  @MessagePattern(
    ATTENDANCE_LOG_MESSAGE_PATTERNS.GET_TODAY_ATTENDANCE_LOG_BY_USER_ID,
  )
  getTodayAttendanceLogByUserId(
    @Payload() userId: number,
  ): Promise<AttendanceLog | null> {
    return this.attendanceLogService.getTodayAttendanceLogByUserId(userId);
  }

  @MessagePattern(ATTENDANCE_LOG_MESSAGE_PATTERNS.GET_ATTENDANCE_LOG_LIST)
  getAttendanceLogList(
    @Payload() filterDto: FilterAttendanceLogListDto,
  ): Promise<AttendanceLogList[]> {
    return this.attendanceLogService.getAttendanceLogList(filterDto);
  }

  @MessagePattern(ATTENDANCE_LOG_MESSAGE_PATTERNS.GET_ATTENDANCE_LOG_COUNT)
  getAttendanceLogCount(
    @Payload() filterDto: FilterAttendanceLogListDto,
  ): Promise<number | null> {
    return this.attendanceLogService.getAttendanceLogCount(filterDto);
  }
}
